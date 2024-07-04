function ResizeFrame(){
	let w = document.createElement('div')
	let n = document.createElement('div')
	let e = document.createElement('div')
	let s = document.createElement('div')
	let sw = document.createElement('div')
	let se = document.createElement('div')
	let nw = document.createElement('div')
	let ne = document.createElement('div')
	let center = document.createElement('div')
	let el,x,y,workzoneRect
	let border = 5
	let status = null
	let rect,actualRect

	w.className  = 'rf w'
	n.className  = 'rf n'
	e.className  = 'rf e'
	s.className  = 'rf s'
	sw.className = 'rf sw'
	se.className = 'rf se'
	nw.className = 'rf nw'
	ne.className = 'rf ne'
	center.className = 'rf center'

	function resize(){
		workzoneRect = _workzone.getBoundingClientRect()
	}

	window.addEventListener('resize',resize)

	document.body.addEventListener('mousemove',_=>{
		if(status){
			let xdelta = _.clientX-x
			let ydelta = _.clientY-y
			switch(status){
				case 'center':{
					_resizeFrame({
						top: rect.top + ydelta,
						left: rect.left + xdelta,
						height:rect.height,
						width:rect.width
					})
					break
				}
				case 'n':{
					_resizeFrame({
						top: rect.top + ydelta,
						height: rect.height - ydelta,
						left: rect.left,
						width: rect.width
					})
					break
				}
				case 's':{
					_resizeFrame({
						top:rect.top,
						left: rect.left,
						width: rect.width,						
						height: rect.height + ydelta
					})
					break
				}
				case 'w':{
					_resizeFrame({
						top:rect.top,
						height:rect.height,
						left:rect.left+xdelta,
						width:rect.width-xdelta
					})
					break
				}
				case 'e':{
					_resizeFrame({
						top:rect.top,
						height:rect.height,
						left:rect.left,
						width:rect.width+xdelta						
					})
					break
				}
				case 'nw':{
					_resizeFrame({
						top: rect.top + ydelta,
						height: rect.height - ydelta,
						left:rect.left+xdelta,
						width:rect.width-xdelta
					})
					break
				}
				case 'ne':{
					_resizeFrame({
						top: rect.top + ydelta,
						height: rect.height - ydelta,
						left:rect.left,
						width:rect.width+xdelta						
					})
					break
				}
				case 'sw':{
					_resizeFrame({
						top:rect.top,
						height: rect.height + ydelta,
						left:rect.left+xdelta,
						width:rect.width-xdelta
					})
					break
				}
				case 'se':{
					_resizeFrame({
						top:rect.top,
						height: rect.height + ydelta,
						left:rect.left,
						width:rect.width+xdelta						
					})
					break
				}

			}
		}
	})
	
	document.body.addEventListener('mouseup',_=>{status=null;rect=actualRect})

	for(let [name,el] of Object.entries({w,n,e,s,sw,se,nw,ne,center})){
		el.style.width = border + 'px'
		el.style.height = border + 'px'
		el.style.left = '-5000px'
		el.style.top  = '-5000px'
		_workzone.append(el)
		el.onmousedown = _=> {
			status = name
			x = _.clientX
			y = _.clientY
		}
	}

	function _resizeFrame(rect){
		el.style.width  = rect.width  + 'px'
		el.style.height = rect.height + 'px'
		el.style.top    = rect.top  -workzoneRect.top+ 'px'
		el.style.left   = rect.left -workzoneRect.left+ 'px'
		
		return resizeFrame({
			...rect,
			bottom: rect.top+rect.height,
			right:  rect.left+rect.width
		})
	}
	function resizeFrame(_rect){
		let rect= {
			left:_rect.left - workzoneRect.left,
			top:_rect.top - workzoneRect.top,
			bottom:_rect.bottom-workzoneRect.top,
			right:_rect.right-workzoneRect.left,
			height:_rect.height,
			width:_rect.width
		}
		actualRect=_rect
		center.style.left   = rect.left    + 'px'
		center.style.top    = rect.top     + 'px'
		center.style.height = rect.height  + 'px'
		center.style.width  = rect.width   + 'px'
		nw.style.left = rect.left - border + 'px'
		nw.style.top  = rect.top  - border + 'px'

		ne.style.left  = rect.right + 'px'
		ne.style.top   = rect.top  - border + 'px'

		sw.style.left  = rect.left - border + 'px'
		sw.style.top   = rect.bottom + 'px'

		se.style.left  = rect.right + 'px'
		se.style.top   = rect.bottom + 'px'

		w.style.left   = rect.left - border + 'px'
		w.style.top    = rect.top           + 'px'
		w.style.height = rect.height        + 'px'

		e.style.left   = rect.right  + 'px'
		e.style.top    = rect.top    + 'px'
		e.style.height = rect.height + 'px'

		n.style.left   = rect.left         + 'px'
		n.style.top    = rect.top - border + 'px'
		n.style.width  = rect.width        + 'px'

		s.style.left   = rect.left   + 'px'
		s.style.top    = rect.bottom + 'px'
		s.style.width  = rect.width  + 'px'		
	}

	return {
		resize,
		select(_el){
			if(_el){
				el = _el
				let _rect = el.getBoundingClientRect()
				rect=_rect
				resizeFrame(_rect)
			}
		}
	}
}
