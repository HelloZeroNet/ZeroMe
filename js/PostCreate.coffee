class PostCreate extends Class
	constructor: ->
		@field_post = new Autosize({
			placeholder: "Write something...",
			class: "postfield",
			onfocus: @startEdit,
			onblur: @startEdit
		})
		@upload = new Uploadable(@handleUpload)
		@upload.resize_width = 900
		@upload.resize_height = 700
		@is_editing = false
		@image = new ImagePreview()

	startEdit: =>
		@is_editing = true
		Page.projector.scheduleRender()

	handleUpload: (base64uri, width, height) =>
		@startEdit()
		@image.base64uri = base64uri
		@image.width = width
		@image.height = height
		@upload.getPreviewData base64uri, 10, 10, (preview_data) =>
			@image.preview_data = preview_data
			Page.projector.scheduleRender()

	handleImageClose: =>
		@image.height = 0
		@image.base64uri = ""
		return false

	handlePostSubmit: =>
		@field_post.loading = true
		if @image.height
			meta = {}
			meta["img"] = @image.preview_data
		else
			meta = null

		Page.user.post @field_post.attrs.value, meta, @image.base64uri?.replace(/.*base64,/, ""), (res) =>
			@field_post.loading = false
			if res
				@field_post.setValue("")
				@image = new ImagePreview()
				document.activeElement.blur()  # Clear the focus
			setTimeout ( ->
				Page.content.update()
			), 100
		return false

	handleUploadClick: =>
		if Page.server_info.rev < 1700
			Page.cmd "wrapperNotification", ["info", "You need ZeroNet version 0.5.0 to upload images"]
		else
			@upload.handleUploadClick()

	render: =>
		user = Page.user
		if user == false
			h("div.post-create.post.empty")
		else if user?.hub
			# Registered user
			h("div.post-create.post", {classes: {editing: @is_editing}},
				h("div.user", user.renderAvatar()),
				@field_post.render(),
				if @image.base64uri
					h("div.image", {style: "background-image: url(#{@image.base64uri}); height: #{@image.getSize(530, 600)[1]}px", classes: {empty: false}}, [
						h("a.close", {href: "#", onclick: @handleImageClose}, "×")
					])
				else
					h("div.image", {style: "height: 0px", classes: {empty: true}})
				h("div.postbuttons",
				    h("a.icon-add.link", {href: "#", title: "Add a photo", onclick: @handleUploadClick}, h("i.fa.fa-picture-o")),
					h("a.button.button-submit", {href: "#Submit", onclick: @handlePostSubmit}, "Submit new post"),
				),
				h("div", {style: "clear: both"})
			)
		else if Page.site_info.cert_user_id
			# Selected cert, but no registered user
			h("div.post-create.post.empty.noprofile",
				h("div.user", h("a.avatar", href: "#", style: "background-image: url('img/unkown.png')")),
				h("div.select-user-container",
					h("a.button.button-submit.select-user", {href: "?Create+profile", onclick: Page.handleLinkClick}, [
						"Create new profile"
					])
				),
				h("textarea", {disabled: true})
			)
		else
			# No cert selected
			h("div.post-create.post.empty.nocert",
				h("div.user", h("a.avatar", href: "#", style: "background-image: url('img/unkown.png')")),
				h("div.select-user-container",
					h("a.button.button-submit.select-user", {href: "#Select+user", onclick: Page.head.handleSelectUserClick}, [
						h("div.icon.icon-profile"),
						"Select user to post new content"
					])
				),
				h("textarea", {disabled: true})
			)

window.PostCreate = PostCreate
