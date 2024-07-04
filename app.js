let selectedTile

let filters = {
	blur:          {unit:'px',  caption:'Размытие'},
	brightness:    {unit:'%',   caption:'Яркость'},
	contrast:      {unit:'%',   caption:'Контрастность'},
	grayscale    : {unit:'%',   caption:'Монохромность'},
	'hue-rotate':  {unit:'deg', caption:'hue rotation'},
	invert:        {unit:'%',   caption:'Инверсия'},
	saturate:      {unit:'%',   caption:'Насыщенность'},
	sepia:         {unit:'%',   caption:'Сепия'}
}

let workzoneData = {
	filters: [],
	updateFilters(){
		$tiles.forEach(tile => tile.updateFilters())
	}
}

let defaultFilter = 'blur'

let units = {
	px:  {min:0},
	'%': {min:0, max:100},
	deg: {min:0, max:360}
}

function Filter(filter,index,_context){
	let sel = filter.name
	let val = filter.value
	let select = document.createElement('select')
	let selectedFilter

	function context(){
		if(_context === 'global') return workzoneData
		return selectedTile
	}
	
	for(let [key,value] of Object.entries(filters)){
		let option = document.createElement('option')

		if(key === sel){
			option.selected = true
			selectedFilter = key				
		}
			
		option.value = key
		option.innerText = value.caption
		select.append(option)
	}

	select.style.width = '200px'

	select.onchange = _ => {
		filter.name  = selectedFilter = select.value
		filter.value = 0
		updateUI(0)
	}

	function updateUI(val){
		let {unit} = filters[selectedFilter]
		let {min,max} = units[unit]

		if(max)
			input.max = max
		else
			delete input.removeAttribute('max')

		input.min = min
		input.value = val
		label.innerText = unit
		context().updateFilters()
	}

	let input = document.createElement('input')
	input.type = 'number'

	input.style.width='100px'


	input.onchange = _=> {
		filter.value = input.value
		context().updateFilters()
	}

	let component = document.createElement('div')
	component.className = 'filter'
	component.append(select)

	let inputContainer = document.createElement('div')
	let label = document.createElement('div')
	component.append(inputContainer)
	inputContainer.append(input)
	inputContainer.append(label)
	inputContainer.className = 'filter-input-container'

	label.style.width = '50px'

	let deleteButton = document.createElement('button')
	deleteButton.innerHTML = 'X'
	deleteButton.onclick = _=>{
		component.parentNode.removeChild(component)
		context().filters.splice(index,1)
		context().updateFilters()
	}
	inputContainer.append(deleteButton)

	updateUI(val)

	return component
}

function GlobalFilters(){
	let component = document.createElement('div')
	let $filters = document.createElement('div')
	$filters.className = 'filters'
	$filters.id ='_global_filters_list'
	component.append($filters)

	for(let index in workzoneData.filters){
		let filter = workzoneData.filters[index]
		let $filter = Filter(filter,index,'global')
		component.append($filter)
	}	

	let addButton = document.createElement('button')
	addButton.innerText = 'Добавить фильтр'
	component.append(addButton)
	addButton.onclick = _=> {
		let filter = {name:defaultFilter,value:0}
		$filters.append(Filter(filter,workzoneData.filters.length,'global'))
		workzoneData.filters.push(filter)
	}

	return component

}

_global_filters.append(GlobalFilters())

function Filters(){
	let component = document.createElement('div')
	let label = document.createElement('p')
	let $filters = document.createElement('div')
	label.innerHTML = '<b>Фильтры изображения:</b>'
	$filters.className = 'filters'
	component.append(label)
	component.append($filters)

	if(selectedTile) for(let index in selectedTile.filters){
		let filter = selectedTile.filters[index]
		let $filter = Filter(filter,index)
		component.append($filter)
	}

	let addButton = document.createElement('button')
	addButton.innerText = 'Добавить фильтр'
	component.append(addButton)
	addButton.onclick = _=> {
		let filter = {name:defaultFilter,value:0}
		$filters.append(Filter(filter,selectedTile.filters.length))
		selectedTile.filters.push(filter)
	}

	return component
}




function addTiles(max){
	let rows = [...document.querySelectorAll('.row')]
	let start = canvasWidth - max * cellWidth
//	console.log({})

	for(let [k,row] of Object.entries(rows)){
		for(let i = 0; i < max; i++){
			let tile = Tile()
			tile.updateFilters()
			tile.style.left   = start + i * cellWidth + 'px'
			tile.style.top    = k * cellHeight + 'px'
			tile.style.height = cellHeight + 'px'
			tile.style.width  = cellWidth  + 'px'
			row.append(tile)	
		}
	}
}

function addRows(max){
	let start = canvasHeight - max * cellHeight
	for(let i = 0; i < max; i++){
		let row = document.createElement('div')
		row.className = 'row'

		for(let k = 0; k < cellsInRow; k++){
			let tile = Tile()
			tile.updateFilters()

			tile.style.left   = k * cellWidth  + 'px'
			tile.style.top    = start + i * cellHeight + 'px'
			tile.style.height = cellHeight + 'px'
			tile.style.width  = cellWidth  + 'px'
			row.append(tile)
		}
		
		_workzone.append(row)
	}	
}

function removeRows(max){
	let rows = [...document.querySelectorAll('.row')]

	for(let i = 0; i < max; i++){
		rows.pop().remove()
	}
}

function removeTiles(max){
	let rows = [...document.querySelectorAll('.row')]

	for(let row of rows){
		let tiles = [...row.querySelectorAll('.tile')]
		for(let i = 0; i < max; i++){
			tiles.pop().remove()
		}
	}	
}

function Tile(){
	let tile = document.createElement('div')
	tile.className = 'tile'
	tile.layer = 500
	tile.setLayer =_=>{
		_=Number(_)
		tile.layer = _
		tile.style.zIndex = 1000+_
	}
	tile.onclick = _ => {
		let tiles = [...document.querySelectorAll('.tile')]
		for(let tile of tiles){
			tile.classList.remove('selected')			
		}
		tile.classList.add('selected')
		selectedTile = tile
		_imgtools.style.display = 'block'
		_filters.innerHTML = ''
		_filters.append(Filters())
		_imgname.value = tile.filename || ''
		resizeFrame.select(tile)
		_layer.value =tile.layer
	}
	tile.setImage = (image) => {
		let url = window.URL.createObjectURL(image)
		tile.image = image
		tile.imgID = url.split('/').pop()
		tile.style.backgroundImage = `url("${url}")`
	}
	tile.updateFilters=_=>{
		let s = ''
		for(let {name,value} of [...workzoneData.filters, ...tile.filters]){
			let {unit} = filters[name]
			s+=`${name}(${value}${unit}) `
		}
		tile.style.filter = s
	}
	tile.clear = _=>{
		tile.filters = []
		tile.style.filter = ''
		delete tile.image
		delete tile.imgID
		tile.style.backgroundImage = 'none'
		delete tile.filename
		tile.setLayer(500)
	}
	tile.filters = []
	return tile
}


_file.onchange = _ => {
	selectedTile.setImage(_file.files[0])
	selectedTile.filename = _imgname.value = _file.files[0].name
}

_imgname.onchange = _ => {
	selectedTile.filename = _imgname.value
}

_files.onchange = _ => {
	let tiles = [...document.querySelectorAll('.tile')]

	for(let index in _files.files){
		if(tiles[index]){
			tiles[index].setImage(_files.files[index])
		}
	}
}

_clear.onclick = _=> {
	if(confirm('Вы действительно хотите очистить холст?')){
		let rows = [...document.querySelectorAll('.row')]

		for(let k in rows){
			let row =rows[k]
			let tiles=[...row.querySelectorAll('.tile')]
			for(let i in tiles){
				let tile = tiles[i]
				tile.clear()
				tile.style.left = i*cellWidth+'px'
				tile.style.top=k*cellHeight+'px'
				tile.style.height=cellHeight+'px'
				tile.style.width=cellWidth+'px'
			}
		}
		workzoneData.filters = [];

		[...document.querySelectorAll('.filters')].forEach(
			filters => filters.innerHTML = ''
		)

		resizeFrame.select(selectedTile)
	}
}

/*
_save_json_btn.onclick = _=> {
	let filename = _json_file_name.value.trim()
	if(!filename){
		alert('Введите имя файла')
		return false
	}else{
		_save_json_btn.download=filename
		_save_json_btn.href = 'data:application/json;charset=utf-8,' +
			encodeURI(JSON.stringify([
				workzoneData.filters.map(filter => [filter.name,filter.value]),
				cellsInRow, cellsInCol, cellWidth, cellHeight,
				$tiles.map(tile => [])
			]))
	}
}
*/
let resizeFrame = ResizeFrame()
_layer.onchange =_=> selectedTile.setLayer(_layer.value)
