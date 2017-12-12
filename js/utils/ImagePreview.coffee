class ImagePreview extends Class
	constructor: ->
		@width = 0
		@height = 0
		@preview_data = ""
		@pixel_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

	getSize: (target_width, target_height) ->
		return @calcSize(@width, @height, target_width, target_height)

	calcSize: (source_width, source_height, target_width, target_height) ->
		width = target_width
		height = width * (source_height / source_width);
		if height > target_height
			height = target_height
			width = height * (source_width / source_height)
		return [Math.round(width), Math.round(height)]

	setPreviewData: (@preview_data) =>
		[@width, @height, colors, pixels] = @preview_data.split(",")

	getPreviewUri: (target_width=10, target_height=10) ->
		@logStart "Render"
		[@width, @height, colors, pixels] = @preview_data.split(",")
		[width, height] = @getSize(target_width, target_height)

		colors = colors.match(/.{3}/g)
		pixels = pixels.split("")

		canvas = document.createElement("canvas")
		canvas.width = width
		canvas.height = height
		ctx = canvas.getContext('2d')
		image_data = ctx.createImageData(width, height)

		color_codes = {}
		for color, i in colors
			color_codes[@pixel_chars[i]] = color

		di = 0
		for pixel in pixels
			hex = color_codes[pixel]
			r = parseInt(hex[0], 16) * 17
			g = parseInt(hex[1], 16) * 17
			b = parseInt(hex[2], 16) * 17
			image_data.data[di] = r
			image_data.data[di+1] = g
			image_data.data[di+2] = b
			image_data.data[di+3] = 255
			di += 4

		#ctx.putImageData(image_data, 1, 0)
		#ctx.putImageData(image_data, 0, 1)
		ctx.putImageData(image_data, 0, 0)

		# Add some blur for more smooth image
		canvas2 = document.createElement("canvas")
		canvas2.width = width*3
		canvas2.height = height*3
		ctx = canvas2.getContext('2d')
		ctx.filter = "blur(1px)"
		ctx.drawImage(canvas, -5, -5, canvas.width*3 + 10, canvas.height*3 + 10)
		ctx.drawImage(canvas, 0, 0, canvas.width*3, canvas.height*3)

		back = canvas2.toDataURL("image/png")
		@logEnd "Render"
		return back

window.ImagePreview = ImagePreview