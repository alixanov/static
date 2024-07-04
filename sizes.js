let cellsInRow   = _width.value          = 4
let cellsInCol   = _height.value         = 4
let cellWidth    = _cell_width.value     = 100
let cellHeight   = _cell_height.value    = 100
let canvasWidth  = _canvas_width.value   = cellWidth  * cellsInRow
let canvasHeight = _canvas_height.value  = cellHeight * cellsInCol

let $tiles = []

_width.onkeyup =
_width.onchange = 
_height.onkeyup =
_height.onchange = 
_cell_width.onkeyup =
_cell_width.onchange =
_cell_height.onkeyup =
_cell_height.onchange = calcCanvasSize

_canvas_width.onkeyup =
_canvas_width.onchange = 
_canvas_height.onkeyup =
_canvas_height.onchange = calcCellSize

function calcCanvasSize(){
	_canvas_width.value  = _width.value  * _cell_width.value
	_canvas_height.value = _height.value * _cell_height.value
}

function calcCellSize(){
	let w = Number(_width.value)
	let h = Number(_height.value)
	if(w) _cell_width.value  = _canvas_width.value  / w
	if(h) _cell_height.value = _canvas_height.value / h
}

function setWorkzoneSize({width,height}){
	_workzone.style.width  = width  + 'px'
	_workzone.style.height = height + 'px'
}

function updateTiles(){
	$tiles = [...document.querySelectorAll('.tile')]
}

init: for(let i = 0; i < cellsInCol; i++){
	let row = document.createElement('div')
	row.className = 'row'
	for(let k = 0; k < cellsInRow; k++){
		let tile = Tile()
		tile.style.width  = cellWidth  + 'px'
		tile.style.height = cellHeight + 'px'
		tile.style.left   = k * cellWidth  + 'px'
		tile.style.top    = i * cellHeight + 'px'
		$tiles.push(tile)
		row.append(tile)
	}
	_workzone.append(row)
	setWorkzoneSize({width:canvasWidth, height:canvasHeight})
}

resizeFrame.resize()

_setSizes.onclick = _ => {
	let cellWidthNew    = _cell_width.value
	let cellHeightNew   = _cell_height.value
	let canvasWidthNew  = _canvas_width.value   
	let canvasHeightNew = _canvas_height.value 
	let wchange         = cellWidthNew  / cellWidth
	let hchange         = cellHeightNew / cellHeight
	canvasWidth = canvasWidthNew
	canvasHeight = canvasHeightNew

	
	setWorkzoneSize({width:canvasWidthNew, height:canvasHeightNew})

	let cellsInRowNew  = Number(_width.value)
	let cellsInColNew  = Number(_height.value)
	cellWidth  = cellWidthNew
	cellHeight = cellHeightNew

	for(let tile of $tiles){
		tile.style.width  = parseFloat(tile.style.width)  * wchange + 'px'
		tile.style.height = parseFloat(tile.style.height) * hchange + 'px'
		tile.style.top    = parseFloat(tile.style.top)    * hchange + 'px'
		tile.style.left   = parseFloat(tile.style.left)   * wchange + 'px'
	}

	if(cellsInColNew>cellsInCol){
		addRows(cellsInColNew - cellsInCol)
		updateTiles()
	}

	if(cellsInColNew<cellsInCol){
		removeRows(cellsInCol-cellsInColNew)
		updateTiles()
	}
	if(cellsInRowNew>cellsInRow){
		addTiles(cellsInRowNew-cellsInRow)
		updateTiles()
	}

	if(cellsInRowNew<cellsInRow){
		removeTiles(cellsInRow-cellsInRowNew)
		updateTiles()
	}

	


	
	
	cellsInRow = cellsInRowNew
	cellsInCol = cellsInColNew


	resizeFrame.resize()
	resizeFrame.select(selectedTile)
}
