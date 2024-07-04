// let imagesServer = 'https://upload.wikimedia.org/'

function SaveForm(){
	let form = document.createElement('div')
	let list = document.createElement('select')
	let textbox=document.createElement('input')
	let buttons=document.createElement('div')
	let saveButton=document.createElement('button')
	let exitButton=document.createElement('button')
	let images,data

	list.size=5

	saveButton.innerText='Сохранить'
	exitButton.innerText='Отмена'

	exitButton.onclick=_=>form.style.display='none'

	list.onchange=_=>textbox.value=list.selectedOptions[0].textContent

	buttons.style.display ='flex'
	buttons.style.flexDirection='row'

	buttons.append(saveButton,exitButton)

	textbox.placeholder='Введите имя файла'
	form.className = 'popup-form'

	saveButton.onclick=async ()=>{
		let filename=textbox.value.trim()
		if(!filename){
			alert('Выберите файл')
		}else{
			await saveCanvas(data,images,textbox.value,list.selectedOptions[0] && textbox.value == list.selectedOptions[0].textContent ? list.selectedOptions[0].value : '')
			form.style.display='none'		
		}
	}

	form.append(
		'Выберите название файла из списка или введите новое название:',
		list,
		'Название файла:',
		textbox,
		buttons
	)
	
	return {
		el:form,
		setList(files){
			list.innerHTML = ''
			for(let idx in files){
				let item = document.createElement('option')
				item.value = idx
				item.innerText=files[ idx ]
				list.append(item)
			}
		},
		show(_images,_data){
			images=_images
			data=_data
			form.style.display='flex'
		}
	}
}



function setData(data){
	_height.value        = data.cellsInCol
	_width.value         = data.cellsInRow
	_cell_width.value    = data.cellWidth
	_cell_height.value   = data.cellHeight
	_canvas_width.value  = data.canvasWidth
	_canvas_height.value = data.canvasHeight
	_setSizes.onclick()
	
	workzoneData.filters = data.globalFilters

	let $rows = [...document.querySelectorAll('.row')]

	for(let i in $rows){
		let $row = $rows[i]
		let row  = data.rows[i]
		let $tiles = [...$row.querySelectorAll('.tile')]
		for(let k in $tiles){
			let $tile=$tiles[k]
			let tile=row[k]

			$tile.setLayer(tile.layer)
			$tile.style.left  = tile.left +'px'
			$tile.style.top=tile.top+'px'
			$tile.style.height=tile.height+'px'
			$tile.style.width=tile.width+'px'
			$tile.filters = tile.filters
			$tile.filename=tile.filename
			if (tile.image) $tile.setImage( tile.image );
			//~ $tile.imgID=tile.imgID
			//~ if(tile.imgID)
				//~ $tile.style.backgroundImage=`url("${imagesServer + tile.imgID}")`
		}
	}

	workzoneData.updateFilters()
	if(selectedTile) selectedTile.onclick()
	

	for(let i in workzoneData.filters){
		let filter = workzoneData.filters[i]
		_global_filters_list.append(Filter(filter,1,'global'))
	}
}

function LoadForm(){
	let form = document.createElement('div')	
	let list = document.createElement('select')
	let buttons      = document.createElement('div')
	let openButton   = document.createElement('button')
	let cancelButton = document.createElement('button')

	list.size=5

	openButton.innerText = 'Открыть'
	cancelButton.innerText ='Отмена'

	cancelButton.onclick = _=>form.style.display='none'
	openButton.onclick=async ()=>{
		if(!list.value){
			alert('Выберите файл')
		}else{
			let data =await loadCanvas(list.value)
			setData(data)
			form.style.display='none'
		}
	}
	buttons.append(openButton,cancelButton)

	form.className = 'popup-form'
	form.append(
		'Выберите файл для открытия:',
		list,
		buttons		
	)

	return {
		el:form,
		setList(files){
			list.innerHTML = ''
			for(let idx in files){
				let item = document.createElement('option')
				item.value = idx
				item.innerText=files[ idx ]
				list.append(item)
			}			
		},
		show(){
			form.style.display='flex'			
		}
	}
}

let saveForm = SaveForm()
let loadForm = LoadForm()

document.body.append(saveForm.el,loadForm.el)

_save.onclick =async ()=> {
	let images = {}
	let data = {
		cellsInRow,cellsInCol,cellWidth,cellHeight,canvasWidth,canvasHeight,
		globalFilters: workzoneData.filters,
		rows: [...document.querySelectorAll('.row')].map(row=>
			[...row.querySelectorAll('.tile')].map(tile=>{
				let params = {
					layer:tile.layer,
					filters:tile.filters,
					filename:tile.filename,
					width:parseFloat(tile.style.width),
					height:parseFloat(tile.style.height),
					top:parseFloat(tile.style.top),
					left:parseFloat(tile.style.left),
					imgID:tile.imgID
				}	
				if(tile.image) images[tile.imgID] = tile.image
				return params
			})
		)
	}

	saveForm.setList(await getFiles())
	saveForm.show(images,data)
}

_load.onclick =async ()=> {
	loadForm.setList(await getFiles())
	loadForm.show()
}

let collages = [];

//Получить с сервера список сохранённых холстов
async function getFiles(){
	//return ['Мой холст 1','Мой холст 2','Тест']
	collages = await getCollages();
	return collages.map( e => e.name );
}

//Сохранить холст на сервер
async function saveCanvas(data,images,canvasName,canvasIndex){
	let canvasId;
	if (canvasIndex) {
		canvasIndex = Number(canvasIndex);
		canvasId = collages[ canvasIndex ].id;
		composedId = collages[ canvasIndex ].composedId;
	}
	await saveCollage( _workzone, canvasId, composedId, data, images, canvasName );
	//~ console.log(JSON.stringify(data,null,2))
	//~ console.log(images)
	//~ console.log({canvasName})
}

//Получить данные с сервера
async function loadCanvas(canvasIndex){
	let canvas = collages[ canvasIndex ].canvas;
	console.log(canvas.name);
	if (!canvas.rows) {
		canvas.rows = [];
		for (let row = 0; row < canvas.cellsInCol; row++) {
			canvas.rows.push( [] );
			for (let col = 0; col < canvas.cellsInRow; col++) {
				canvas.rows[ row ].push( {
					layer : 500,
					filters : [],
					width : canvas.cellWidth,
					height : canvas.cellHeight,
					top : Math.floor( row * canvas.canvasHeight / canvas.cellsInCol ),
					left : Math.floor( col * canvas.canvasWidth / canvas.cellsInRow )
				} );
			}
		}
		if (canvas.images && canvas.images.length ) {
			let loads = canvas.images.map( e => loadImage( e.dlId ) );
			let imgData = await Promise.all( loads );
			for (let i in canvas.images) {
				let img = canvas.images[ i ];
				img.image = imgData[ i ];
				canvas.rows[ img.row ][ img.col ] = img;
			}
		}
	}
	return canvas;
	
/*
return {
  "cellsInRow": 4,
  "cellsInCol": 5,
  "cellWidth": "100",
  "cellHeight": "120",
  "canvasWidth": "400",
  "canvasHeight": "600",
  "globalFilters": [
    {
      "name": "invert",
      "value": "100"
    }
  ],
  "rows": [
    [
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 0,
        "left": 0
      },
      {
        "layer": 502,
        "filters": [
          {
            "name": "blur",
            "value": "1"
          }
        ],
        "filename": "jjj.png",
        "width": 121,
        "height": 139.2,
        "top": 22.8,
        "left": 73,
        "imgID": "wikipedia/commons/thumb/5/5b/Cebras_de_Burchell_(Equus_quagga_burchellii)%2C_vista_aérea_del_delta_del_Okavango%2C_Botsuana%2C_2018-08-01%2C_DD_30.jpg/800px-Cebras_de_Burchell_(Equus_quagga_burchellii)%2C_vista_aérea_del_delta_del_Okavango%2C_Botsuana%2C_2018-08-01%2C_DD_30.jpg"
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 0,
        "left": 200
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 0,
        "left": 300
      }
    ],
    [
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 120,
        "left": 0
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 120,
        "left": 100
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 120,
        "left": 200
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 120,
        "left": 300
      }
    ],
    [
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 240,
        "left": 0
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 240,
        "left": 100
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 240,
        "left": 200
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 240,
        "left": 300
      }
    ],
    [
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 360,
        "left": 0
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 360,
        "left": 100
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 360,
        "left": 200
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 360,
        "left": 300
      }
    ],
    [
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 480,
        "left": 0
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 480,
        "left": 100
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 480,
        "left": 200
      },
      {
        "layer": 500,
        "filters": [],
        "width": 100,
        "height": 120,
        "top": 480,
        "left": 300
      }
    ]
  ]
}
*/

}
