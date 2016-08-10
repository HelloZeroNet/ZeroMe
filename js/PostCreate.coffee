class PostCreate
	constructor: ->
		@field_post = new Autosize({
			placeholder: "Write something...",
			class: "postfield",
			onfocus: Page.projector.scheduleRender,
			onblur: Page.projector.scheduleRender
		})

	isEditing: ->
		return @field_post.attrs.value?.length or document.activeElement?.parentElement == @field_post.node?.parentElement

	handlePostSubmit: =>
		@field_post.loading = true
		Page.user.post @field_post.attrs.value, (res) =>
			@field_post.loading = false
			if res
				@field_post.setValue("")
				document.activeElement.blur()  # Clear the focus
			setTimeout ( ->
				Page.content.update()
			), 100
		return false

	render: =>
		user = Page.user
		if user == false
			h("div.post-create.post.empty")
		else if user?.hub
			# Registered user
			h("div.post-create.post", {classes: {editing: @isEditing()}},
				h("div.user", user.renderAvatar()),
				@field_post.render(),
				h("div.postbuttons",
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
