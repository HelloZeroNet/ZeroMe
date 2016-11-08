class Overlay extends Class
	constructor: ->
		@visible = false
		@called = false
		@height = 0
		@image_top = 0
		@image_left = 0
		@image_width = 0
		@image_height = 0
		@background_image = ""
		@image_transform = ""
		@pos = null
		@tag = null

	zoomImageTag: (tag, target_width, target_height) =>
		@log "Show"
		@background_image = tag.style.backgroundImage
		@height = document.body.scrollHeight

		pos = tag.getBoundingClientRect()
		@original_pos = pos
		@image_top = (pos.top + window.scrollY) + "px"
		@image_left = pos.left+"px"
		@image_margin_left = "0px"
		@image_width = pos.width
		@image_height = pos.height


		@called = true

		@tag = tag

		@visible = true

		window.requestAnimationFrame ( =>
			#@image_width = target_width
			#@image_height = target_height
			@image_transform = "scale(#{target_width / pos.width})"
			image_left = (pos.left + pos.width / 2 - target_width / 2)
			if image_left < 0
				@image_transform += " translateX(#{0-image_left}px)"
			#@image_top = (pos.top + pos.height / 2 - target_height / 2) + "px"
			#@image_margin_left = 0-target_width/2
			Page.projector.scheduleRender()
		)

	handleClick: =>
		@log "Hide"
		#@image_width = @original_pos.width
		#@image_height = @original_pos.height+1
		#@image_left = @original_pos.left+"px"
		#@image_margin_left = 0
		@image_transform = ""
		@visible = false
		setTimeout ( =>
			if not @visible
				@called = false
				Page.projector.scheduleRender()
		), 500
		return false

	render: =>
		if not @called
			return h("div#Overlay", {classes: {visible: @visible}, onclick: @handleClick})

		h("div#Overlay", {classes: {visible: @visible}, onclick: @handleClick, style: "height: #{@height}px"}, [
			h("div.img", {style: """
				transform: #{@image_transform}; margin-left: #{@image_margin_left}px;
				top: #{@image_top}; left: #{@image_left};
				width: #{@image_width}px; height: #{@image_height}px;
				background-image: #{@background_image}"""
			})
		])

window.Overlay = Overlay