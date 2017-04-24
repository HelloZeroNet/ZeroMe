class PostMeta extends Class
	constructor: (@post, @meta) ->
		@

	afterCreateImage: (tag) =>
		Page.scrollwatcher.add tag, =>
			try
				@image_preview.preview_uri = @image_preview.getPreviewUri()
				Page.cmd "optionalFileInfo", @post.user.getPath()+"/"+@post.row.post_id+".jpg", (res) =>
					@image_preview.optional_info = res
					Page.projector.scheduleRender()
			catch e
				@log "Image preview error: #{e}"
			Page.projector.scheduleRender()

	handleImageClick: (e) =>
		if @image_preview.load_fullsize or @image_preview.optional_info?.is_downloaded
			Page.overlay.zoomImageTag(e.currentTarget, @image_preview.width, @image_preview.height)
		else
			@image_preview.load_fullsize = true
			@image_preview.loading = true
			image = new Image()
			image.src = "#{@post.user.getPath()}/#{@post.row.post_id}.jpg"
			image.onload = =>
				@image_preview.loading = false
				@image_preview.optional_info.is_downloaded = 1
				@image_preview.optional_info.peer += 1
				Page.projector.scheduleRender()

			Page.projector.scheduleRender()
		return false

	handleOptionalHelpClick: =>
		@post.user.hasHelp (optional_helping) =>
			@optional_helping = optional_helping
			if @optional_helping
				Page.cmd "OptionalHelpRemove", ["data/users/#{@post.user.auth_address}", @post.user.hub]
				@optional_helping = false
			else
				Page.cmd "OptionalHelp", ["data/users/#{@post.user.auth_address}", "#{@post.row.user_name}'s new images", @post.user.hub]
				@optional_helping = true
			Page.content_profile.update()
			Page.projector.scheduleRender()
		return true

	handleImageDeleteClick: =>
		inner_path = "#{@post.user.getPath()}/#{@post.row.post_id}.jpg"
		Page.cmd "optionalFileDelete", inner_path, =>
			@image_preview.optional_info.is_downloaded = 0
			@image_preview.optional_info.peer -= 1
			Page.projector.scheduleRender()

	handleImageSettingsClick: (e) =>
		if e.target.classList.contains("menu-item")
			return
		@post.user.hasHelp (helping) =>
			if not @menu_image
				@menu_image = new Menu()
			@optional_helping = helping
			@menu_image.items = []
			@menu_image.items.push ["Help distribute this user's new images", @handleOptionalHelpClick, ( => return @optional_helping)]
			@menu_image.items.push ["---"]
			if @image_preview.optional_info?.is_downloaded
				@menu_image.items.push ["Delete image", @handleImageDeleteClick]
			else
				@menu_image.items.push ["Show image", @handleImageClick, false]
			@menu_image.toggle()
		return false

	render: =>
		if @meta.img
			if not @image_preview
				@image_preview = new ImagePreview()
				@image_preview.setPreviewData(@meta.img)
			[width, height] = @image_preview.getSize(530, 600)

			if @image_preview?.preview_uri
				style_preview = "background-image: url(#{@image_preview.preview_uri})"
			else
				style_preview = ""

			if @image_preview.load_fullsize or @image_preview.optional_info?.is_downloaded
				style_fullsize = "background-image: url(#{@post.user.getPath()}/#{@post.row.post_id}.jpg)"
			else
				style_fullsize = ""

			h("div.img.preview", {
				afterCreate: @afterCreateImage,
				style: "width: #{width}px; height: #{height}px; #{style_preview}",
				classes: {downloaded: @image_preview.optional_info?.is_downloaded, hasinfo: @image_preview.optional_info?.peer != null, loading: @image_preview.loading}
			},
				h("a.fullsize", {href: "#", onclick: @handleImageClick, style: style_fullsize}),
				if Page.server_info.rev < 1700
					h("small.oldversion", "You need ZeroNet 0.5.0 to view this image")
				if @image_preview?.optional_info
					h("a.show", {href: "#", onclick: @handleImageClick}, h("div.title", "Loading...\nShow image"))
					if Page.getSetting("autoload_media") and not @image_preview.optional_info?.is_downloaded
						setTimeout @handleImageClick,0
				if @image_preview?.optional_info
					h("a.details", {href: "#Settings", onclick: Page.returnFalse, onmousedown: @handleImageSettingsClick}, [
						h("div.size", Text.formatSize(@image_preview.optional_info?.size)),
						h("div.peers.icon-profile"), @image_preview.optional_info?.peer,
						h("a.image-settings", "\u22EE")
						if @menu_image then @menu_image.render(".menu-right")
					])
			)

window.PostMeta = PostMeta
