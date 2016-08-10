class Uploadable extends Class
	constructor: (@handleSave) ->
		@node = null
		@resize_w = 50
		@resize_h = 50

	storeNode: (node) =>
		@node = node

	resizeImage: (file, width, height, cb) =>
		image = new Image()

		# Smooth image resize
		resizer = (i) ->
			cc = document.createElement("canvas")
			cc.width = i.width / 2
			cc.height = i.height / 2
			cc_ctx = cc.getContext("2d")
			cc_ctx.drawImage(i, 0, 0, cc.width, cc.height)
			return cc

		image.onload = =>
			canvas = document.createElement("canvas")
			canvas.width = width
			canvas.height = height
			ctx = canvas.getContext("2d")
			ctx.fillStyle = "#FFF"
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			while image.width > width * 2
				image = resizer(image)
			ctx.drawImage(image, 0, 0, width, height)

			# Try to optimize to png
			quant = new RgbQuant({colors: 128, method: 1})
			quant.sample(canvas)
			quant.palette(true)
			canvas_quant = drawPixels(quant.reduce(canvas), width)
			optimizer = new CanvasTool.PngEncoder(canvas_quant, { bitDepth: 8, colourType: CanvasTool.PngEncoder.ColourType.TRUECOLOR })
			image_base64uri = "data:image/png;base64," + btoa(optimizer.convert())
			if image_base64uri.length > 2200
				# Too large, convert to jpg
				@log "PNG too large (#{image_base64uri.length} bytes), convert to jpg instead"
				image_base64uri = canvas.toDataURL("image/jpeg", 0.8)

			@log "Size: #{image_base64uri.length} bytes"
			cb image_base64uri
		image.onerror = (e) =>
			@log "Image upload error", e
			cb null
		image.src = URL.createObjectURL(file)


	handleUploadClick: (e) =>
		script = document.createElement("script")
		script.src = "js-external/pngencoder.js"
		document.head.appendChild(script)
		input = document.createElement('input')
		input.type = "file"
		input.addEventListener 'change', (e) =>
			script.onload = @resizeImage input.files[0], @resize_w, @resize_h, (image_base64uri) =>
				@handleSave(image_base64uri)
				input.remove()
		input.click()
		return false

	render: (body) =>
		h("div.uploadable",
			h("a.icon.icon-upload", {href: "#Upload", onclick: @handleUploadClick})
			body()
		)

window.Uploadable = Uploadable