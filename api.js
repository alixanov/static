
//~ u_id	553
//~ email test@nowhere.net
//~ password MuR]BLJ9&}
//~ token	"ff75d97755b27bb0d058ecb2c1ed589f"
//~ u_hash	"JxgBVHP0rSRyN8Jt653GLQ2iH98IMAlEC3NtiCxkT42f9PqJFT448gQfn9FvSVxM8D7lRNDog/Gxtew97iHdJgFmBIo7wfZHjROujBQ1uPJfzWIdhlVwtiZdTSmPazPR"

const url_prefix = "https://ibronevik.ru/taxi/c/gruzvill/api/v1/";
const u_token = "ff75d97755b27bb0d058ecb2c1ed589f";
const u_hash = "JxgBVHP0rSRyN8Jt653GLQ2iH98IMAlEC3NtiCxkT42f9PqJFT448gQfn9FvSVxM8D7lRNDog/Gxtew97iHdJgFmBIo7wfZHjROujBQ1uPJfzWIdhlVwtiZdTSmPazPR";

function postRequest( api, data = {}, rawResponse = false ) {
	data = Object.assign( { token : u_token, u_hash : u_hash }, data );
	
	let opt = {
		method : 'POST',
		headers : {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body : ( new URLSearchParams( data ) ).toString()
	};
	return fetch( `${url_prefix}${api}`, opt ).
		then( response => {
			if (!response.ok) {
				let e = new Error( 'Request failed.' );
				e.cause = response;
				throw e;
			}
			if (rawResponse) {
				return response;
			}
			else {
				if (!response.headers.get( 'Content-Type' ).startsWith( 'application/json' )) {
					let e = new Error( 'Invalid content type.' );
					e.cause = response;
					throw e;
				};
				return response.json().
					then( ret => {
						if (ret.status != 'success') {
							let e = new Error( 'Response status is not "success".' );
							e.cause = ret;
							throw e;
						}
						return ret.data;
					} );
			}
		} );
}

function getCollages() {
	return (
		postRequest( 'drive', { fields : 0 } ).
		then( result =>
			Object.keys( result.booking ).map( id => ({
				id,
				name : result.booking[ id ].b_custom_comment,
				composedId : result.booking[ id ].b_options.collage[0].composedId,
				canvas : result.booking[ id ].b_options.collage[0]
			}) )
		)
	);
}

function saveImage( imageFile, dlId ) {
	return new Promise( ( resolve, reject ) => {
		let reader = new FileReader();
		reader.onloadend = () => {
			if (!/^data:[^,]*;base64,/.test( reader.result )) reject( new Error( 'Failed reading image file.' ) );
			let file;
			if (dlId) {
				file = JSON.stringify( {
					base64 : reader.result,
					dl_id : dlId
				} );
			}
			else {
				file = JSON.stringify( {
					base64 : reader.result,
					name : imageFile.name,
					private : 0
				} );
			}
			postRequest( 'dropbox/file/', { file } ).
				then( result => resolve( result ) ).
				catch( reason => reject( reason ) );
		};
		reader.readAsDataURL( imageFile );
	} );
}

function loadImage( dlId ) {
	return postRequest( `dropbox/file/${dlId}`, {}, true ).
		then( response => response.blob() ).
		then( image => {
			image.dlId = dlId;
			return image;
		} );
}

function saveCollage( containerElement, collageId, composedId, data, images, name ) {
	return html2canvas( containerElement ).
		then( canvas => { return new Promise( ( resolve, reject ) => { canvas.toBlob( resolve, 'image/jpeg' ), 0.9 } ); } ).
		then( assembledImage => {
			assembledImage.name = 'collage.jpg';
			let saves = [ saveImage( assembledImage, composedId || false ) ];
			let saveIds = [ -1 ];

			images = Object.assign( {}, images );
			for (let id in images) {
				if (images[ id ] instanceof File) {
					saveIds.push( id );
					saves.push( saveImage( images[ id ] ) );
				}
			}
			return Promise.all( saves ).
				then( results => {
					for (let i in results) {
						if ( saveIds[ i ] == -1 ) data.composedId = results[ i ].dl_id;
						else images[ saveIds[ i ] ].dlId = results[ i ].dl_id;
					}
					let imagesData = [];
					for (let row in data.rows) {
						for (let col in data.rows[ row ]) {
							if (data.rows[ row ][ col ].imgID) {
								let tile = data.rows[ row ][ col ];
								let img = images[ tile.imgID ];
								img.row = row;
								img.col = col;
								imagesData.push( {
									row,
									col,
									layer : tile.layer,
									width : tile.width,
									height : tile.height,
									top : tile.top,
									left : tile.left,
									filters : tile.filters,
									filename : tile.filename,
									dlId : img.dlId
								} );
							}
						}
					}
					let collage = Object.assign( {}, data );
					delete collage.rows;
					collage.images = imagesData;
					if (collageId) {
						return postRequest( `drive/get/${collageId}`, {
							action : 'edit',
							data : JSON.stringify( { b_options : [ [ '-', [ 'collage' ] ], [ '+', [ 'collage' ], collage ] ] } )
						} ).
						catch( e => {
							if (!e || !e.cause || e.cause.message != 'modified data not found') throw e;
						} )
					}
					else {
						return postRequest( 'drive', {
							data : JSON.stringify( {
								b_start_address : "unknown",
								b_start_datetime : "any",
								b_payment_way : "1",
								b_custom_comment : name,
								b_options : { collage : [ collage ] }
							} )
						} );
					}
				} );
		});
}
