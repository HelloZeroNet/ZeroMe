class Uploadable extends Class
	constructor: (@handleSave) ->
		@node = null
		@resize_width = 50
		@resize_height = 50
		@preverse_ratio = true  # Keep image originial ratio
		@try_png = false  # Try to convert to png
		@png_limit = 2200  # Use png instead of jpg is smaller than this size
		@image_preview = new ImagePreview()
		@pixel_chars = @image_preview.pixel_chars
		@

	storeNode: (node) =>
		@node = node

	scaleHalf: (image) ->
		canvas = document.createElement("canvas")
		canvas.width = image.width / 2
		canvas.height = image.height / 2
		ctx = canvas.getContext("2d")
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
		return canvas

	resizeImage: (file, width, height, cb) =>
		image = new Image()
		image.onload = =>
			@log "Resize image loaded"
			canvas = document.createElement("canvas")
			if @preverse_ratio
				[canvas.width, canvas.height] = @image_preview.calcSize(image.width, image.height, width, height)
			else
				canvas.width = width
				canvas.height = height

			ctx = canvas.getContext("2d")
			ctx.fillStyle = "#FFF"
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			while image.width > width * 2
				image = @scaleHalf(image)
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

			# Try to optimize to png
			if @try_png
				quant = new RgbQuant({colors: 128, method: 1})
				quant.sample(canvas)
				quant.palette(true)
				canvas_quant = drawPixels(quant.reduce(canvas), width)
				optimizer = new CanvasTool.PngEncoder(canvas_quant, { bitDepth: 8, colourType: CanvasTool.PngEncoder.ColourType.TRUECOLOR })
				image_base64uri = "data:image/png;base64," + btoa(optimizer.convert())
				if image_base64uri.length > @png_limit
					# Too large, convert to jpg
					@log "PNG too large (#{image_base64uri.length} bytes), convert to jpg instead"
					image_base64uri = canvas.toDataURL("image/jpeg", 0.8)
			else
				image_base64uri = canvas.toDataURL("image/jpeg", 0.8)

			@log "Size: #{image_base64uri.length} bytes"
			cb image_base64uri, canvas.width, canvas.height
		image.onerror = (e) =>
			@log "Image upload error", e
			Page.cmd "wrapperNotification", ["error", "Invalid image, only jpg format supported"]
			cb null
		if file.name
			image.src = URL.createObjectURL(file)
		else
			image.src = file


	handleUploadClick: (e) =>
		@log "handleUploadClick", e
		script = document.createElement("script")
		script.src = "js-external/pngencoder.js"
		document.head.appendChild(script)
		input = document.createElement('input')
		document.body.appendChild(input)
		input.type = "file"
		input.style.visibility = "hidden"
		input.onchange = (e) =>
			@log "Uploaded"
			@resizeImage input.files[0], @resize_width, @resize_height, (image_base64uri, width, height) =>
				@log "Resized", width, height
				if image_base64uri
					@handleSave(image_base64uri, width, height)
				input.remove()
		input.click()
		return false

	render: (body) =>
		h("div.uploadable",
			h("a.icon.icon-upload", {href: "#Upload", onclick: @handleUploadClick})
			body()
		)

	getPixelData: (data) =>
		color_db = {}
		colors = []
		colors_next_id = 0
		pixels = []
		for i in [0..data.length-1] by 4

			r = data[i]
			g = data[i+1]
			b = data[i+2]
			#r = r - (r % 64)
			#g = g - (g % 64)
			#b = b - (b % 64)
			r = Math.round(r/17)
			g = Math.round(g/17)
			b = Math.round(b/17)
			hex = Number(0x1000 + r*0x100 + g*0x10 + b).toString(16).substring(1)
			if i == 0
				@log r, g, b, data[i+3], hex
			if !color_db[hex]
				color_db[hex] = @pixel_chars[colors_next_id]
				colors.push(hex)
				colors_next_id += 1
			pixels.push(color_db[hex])
		return [colors, pixels]

	getPreviewData: (image_base64uri, target_width, target_height, cb) ->
		image = new Image()
		image.src = image_base64uri
		image.onload = =>
			image_width = image.width
			image_height = image.height
			canvas = document.createElement("canvas")
			[canvas.width, canvas.height] = @image_preview.calcSize(image.width, image.height, target_width, target_height)

			ctx = canvas.getContext("2d")
			ctx.fillStyle = "#FFF"
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			while image.width > target_width * 2
				image = @scaleHalf(image)

			ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

			quant = new RgbQuant({colors: 16, method: 1})
			quant.sample(canvas)
			quant.palette(true)
			canvas = drawPixels(quant.reduce(canvas), canvas.width)
			ctx = canvas.getContext("2d")

			image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
			pixeldata = @getPixelData(image_data.data)

			back = [image_width, image_height, pixeldata[0].join(""), pixeldata[1].join("")].join(",")
			@log "Previewdata size:", back.length
			cb back


window.Uploadable = Uploadable