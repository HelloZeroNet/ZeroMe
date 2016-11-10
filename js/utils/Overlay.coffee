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
		@style = ""
		@pos = null
		@tag = null

	zoomImageTag: (tag, target_width, target_height) =>
		@log "Show", target_width, target_height
		@background_image = tag.style.backgroundImage
		@height = document.body.scrollHeight

		pos = tag.getBoundingClientRect()
		@original_pos = pos
		@image_top = parseInt(pos.top + window.scrollY) + "px"
		@image_left = parseInt(pos.left)+"px"
		@image_width = target_width
		@image_height = target_height
		ratio = pos.width/target_width
		@image_transform = "scale(#{ratio}) "
		@image_margin_left = parseInt((pos.width - target_width) / 2)
		@image_margin_top = parseInt((pos.height - target_height) / 2)
		@style = ""
		#@image_transform += "translateX(#{((pos.width / ratio) - (target_width / ratio)) / 2}px) "
		#@image_transform += "translateY(#{((pos.height / ratio) - (target_height / ratio)) / 2}px) "


		@called = true

		@tag = tag

		@visible = true

		window.requestAnimationFrame ( =>
			#@image_width = target_width
			#@image_height = target_height
			ratio = 1
			@image_transform = "scale(#{ratio}) "
			#@image_transform += "translateX(#{((pos.width / ratio) - (target_width / ratio)) / 2}px) "
			#@image_transform += "translateY(#{((pos.height / ratio) - (target_height / ratio)) / 2}px) "
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
		ratio = @original_pos.width/@image_width
		@image_transform = "scale(#{ratio}) "
		#@image_transform += "translateX(#{((@original_pos.width / ratio) - (@image_width / ratio)) / 2}px) "
		#@image_transform += "translateY(#{((@original_pos.height / ratio) - (@image_height / ratio)) / 2}px) "
		@image_margin_left = Math.floor((@original_pos.width - @image_width) / 2)
		@image_margin_top = Math.floor((@original_pos.height - @image_height) / 2)
		@log @image_margin_top, @image_margin_left, @image_width, @image_height
		@visible = false
		setTimeout ( =>
			@log "opacity", @visible
			if not @visible
				@style = "opacity: 0"
				Page.projector.scheduleRender()
		), 400
		setTimeout ( =>
			if not @visible
				@called = false
				Page.projector.scheduleRender()
		), 900
		return false

	render: =>
		if not @called
			return h("div#Overlay", {classes: {visible: @visible}, onclick: @handleClick})

		h("div#Overlay", {classes: {visible: @visible}, onclick: @handleClick, style: "height: #{@height}px"}, [
			h("div.img", {style: """
				transform: #{@image_transform}; margin-left: #{@image_margin_left}px; margin-top: #{@image_margin_top}px;
				top: #{@image_top}; left: #{@image_left};
				width: #{@image_width}px; height: #{@image_height}px;
				background-image: #{@background_image};
				#{@style}"""
			})
		])

window.Overlay = Overlay