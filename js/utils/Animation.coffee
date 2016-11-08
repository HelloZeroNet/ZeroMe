class Animation
	slideDown: (elem, props) ->
		h = elem.offsetHeight
		cstyle = window.getComputedStyle(elem)
		margin_top = cstyle.marginTop
		margin_bottom = cstyle.marginBottom
		padding_top = cstyle.paddingTop
		padding_bottom = cstyle.paddingBottom
		border_top_width = cstyle.borderTopWidth
		border_bottom_width = cstyle.borderBottomWidth
		transition = cstyle.transition

		if window.Animation.shouldScrollFix(elem, props)
			# Keep objects in the screen at same position
			top_after = document.body.scrollHeight
			next_elem = elem.nextSibling
			parent = elem.parentNode
			parent.removeChild(elem)
			top_before = document.body.scrollHeight
			console.log("Scrollcorrection down", (top_before - top_after))
			window.scrollTo(window.scrollX, window.scrollY - (top_before - top_after))
			if next_elem
				parent.insertBefore(elem, next_elem)
			else
				parent.appendChild(elem)
			return

		if props.animate_scrollfix and elem.getBoundingClientRect().top > 1600
			# console.log "Skip down", elem
			return

		elem.style.boxSizing = "border-box"
		elem.style.overflow = "hidden"
		if not props.animate_noscale
			elem.style.transform = "scale(0.6)"
		elem.style.opacity = "0"
		elem.style.height = "0px"
		elem.style.marginTop = "0px"
		elem.style.marginBottom = "0px"
		elem.style.paddingTop = "0px"
		elem.style.paddingBottom = "0px"
		elem.style.borderTopWidth = "0px"
		elem.style.borderBottomWidth = "0px"
		elem.style.transition = "none"

		setTimeout (->
			elem.className += " animate-inout"
			elem.style.height = h+"px"
			elem.style.transform = "scale(1)"
			elem.style.opacity = "1"
			elem.style.marginTop = margin_top
			elem.style.marginBottom = margin_bottom
			elem.style.paddingTop = padding_top
			elem.style.paddingBottom = padding_bottom
			elem.style.borderTopWidth = border_top_width
			elem.style.borderBottomWidth = border_bottom_width
		), 1

		elem.addEventListener "transitionend", ->
			elem.classList.remove("animate-inout")
			elem.style.transition = elem.style.transform = elem.style.opacity = elem.style.height = null
			elem.style.boxSizing = elem.style.marginTop = elem.style.marginBottom = null
			elem.style.paddingTop = elem.style.paddingBottom = elem.style.overflow = null
			elem.style.borderTopWidth = elem.style.borderBottomWidth = elem.style.overflow = null
			elem.removeEventListener "transitionend", arguments.callee, false

	shouldScrollFix: (elem, props) ->
		pos = elem.getBoundingClientRect()
		if props.animate_scrollfix and window.scrollY > 300 and pos.top < 0 and not document.querySelector(".noscrollfix:hover")
			return true
		else
			return false

	slideDownAnime: (elem, props) ->
		cstyle = window.getComputedStyle(elem)
		elem.style.overflowY = "hidden"
		anime({targets: elem, height: [0, elem.offsetHeight], easing: 'easeInOutExpo'})

	slideUpAnime: (elem, remove_func, props) ->
		elem.style.overflowY = "hidden"
		anime({targets: elem, height: [elem.offsetHeight, 0], complete: remove_func, easing: 'easeInOutExpo'})


	slideUp: (elem, remove_func, props) ->
		if window.Animation.shouldScrollFix(elem, props) and elem.nextSibling
			# Keep objects in the screen at same position
			top_after = document.body.scrollHeight
			next_elem = elem.nextSibling
			parent = elem.parentNode
			parent.removeChild(elem)
			top_before = document.body.scrollHeight
			console.log("Scrollcorrection down", (top_before - top_after))
			window.scrollTo(window.scrollX, window.scrollY + (top_before - top_after))
			if next_elem
				parent.insertBefore(elem, next_elem)
			else
				parent.appendChild(elem)
			remove_func()
			return

		if props.animate_scrollfix and elem.getBoundingClientRect().top > 1600
			remove_func()
			# console.log "Skip up", elem
			return

		elem.className += " animate-inout"
		elem.style.boxSizing = "border-box"
		elem.style.height = elem.offsetHeight+"px"
		elem.style.overflow = "hidden"
		elem.style.transform = "scale(1)"
		elem.style.opacity = "1"
		elem.style.pointerEvents = "none"

		setTimeout (->
			cstyle = window.getComputedStyle(elem)
			elem.style.height = "0px"
			elem.style.marginTop = (0-parseInt(cstyle.borderTopWidth)-parseInt(cstyle.borderBottomWidth))+"px"
			elem.style.marginBottom = "0px"
			elem.style.paddingTop = "0px"
			elem.style.paddingBottom = "0px"
			elem.style.transform = "scale(0.8)"
			elem.style.opacity = "0"
		), 1
		elem.addEventListener "transitionend", (e) ->
			if e.propertyName == "opacity" or e.elapsedTime >= 0.6
				elem.removeEventListener "transitionend", arguments.callee, false
				setTimeout ( ->
					remove_func()
				), 2000


	showRight: (elem, props) ->
		elem.className += " animate"
		elem.style.opacity = 0
		elem.style.transform = "TranslateX(-20px) Scale(1.01)"
		setTimeout (->
			elem.style.opacity = 1
			elem.style.transform = "TranslateX(0px) Scale(1)"
		), 1
		elem.addEventListener "transitionend", ->
			elem.classList.remove("animate")
			elem.style.transform = elem.style.opacity = null
			elem.removeEventListener "transitionend", arguments.callee, false


	show: (elem, props) ->
		delay = arguments[arguments.length-2]?.delay*1000 or 1
		elem.className += " animate"
		elem.style.opacity = 0
		setTimeout (->
			elem.style.opacity = 1
		), delay
		elem.addEventListener "transitionend", ->
			elem.classList.remove("animate")
			elem.style.opacity = null
			elem.removeEventListener "transitionend", arguments.callee, false

	hide: (elem, remove_func, props) ->
		delay = arguments[arguments.length-2]?.delay*1000 or 1
		elem.className += " animate"
		setTimeout (->
			elem.style.opacity = 0
		), delay
		elem.addEventListener "transitionend", (e) ->
			if e.propertyName == "opacity"
				remove_func()
				elem.removeEventListener "transitionend", arguments.callee, false

	addVisibleClass: (elem, props) ->
		setTimeout ->
			elem.classList.add("visible")

	cloneAnimation: (elem, animation) ->
		window.requestAnimationFrame =>
			if elem.style.pointerEvents == "none"  # Fix if animation called on cloned element
				elem = elem.nextSibling
			elem.style.position = "relative"
			elem.style.zIndex = "2"
			clone = elem.cloneNode(true)
			cstyle = window.getComputedStyle(elem)
			clone.classList.remove("loading")
			clone.style.position = "absolute"
			clone.style.zIndex = "1"
			clone.style.pointerEvents = "none"
			clone.style.animation = "none"

			# Check the position difference between original and cloned object
			elem.parentNode.insertBefore(clone, elem)
			cloneleft = clone.offsetLeft

			clone.parentNode.removeChild(clone)  # Remove from dom to avoid animation
			clone.style.marginLeft = parseInt(cstyle.marginLeft) + elem.offsetLeft - cloneleft + "px"
			elem.parentNode.insertBefore(clone, elem)

			clone.style.animation = "#{animation} 0.8s ease-in-out forwards"
			setTimeout ( -> clone.remove() ), 1000

	flashIn: (elem) ->
		if elem.offsetWidth > 100
			@cloneAnimation(elem, "flash-in-big")
		else
			@cloneAnimation(elem, "flash-in")

	flashOut: (elem) ->
		if elem.offsetWidth > 100
			@cloneAnimation(elem, "flash-out-big")
		else
			@cloneAnimation(elem, "flash-out")


window.Animation = new Animation()