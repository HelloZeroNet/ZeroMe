class ContentProfile extends Class
	constructor: ->
		@post_list = null
		@activity_list = null
		@user_list = null
		@auth_address = null
		@user = new User()
		@owned = false
		@need_update = true
		@loaded = false

	renderNotSeeded: =>
		return h("div#Content.center.#{@auth_address}", [
			h("div.col-left", [
				h("div.users", [
					h("div.user.card.profile", [
						@user.renderAvatar()
						h("a.name.link",
							{href: @user.getLink(), style: "color: #{Text.toColor(@user.row.auth_address)}", onclick: Page.handleLinkClick},
							@user.row.user_name
						),
						h("div.cert_user_id", @user.row.cert_user_id)
						h("div.intro-full",
							@user.row.intro
						),
						h("div.follow-container", [
							h("a.button.button-follow-big", {href: "#", onclick: @user.handleFollowClick, classes: {loading: @user.submitting_follow}},
								h("span.icon-follow", "+"),
								if @user.isFollowed() then "Unfollow" else "Follow"
							)
						])
					])
				])
			]),
			h("div.col-center", {style: "padding-top: 30px; text-align: center"}, [
				h("h1", "Download profile site"),
				h("h2", "User's profile site not loaded to your client yet."),
				h("a.button.submit", {href: "#Add+site", onclick: @user.handleDownloadClick}, "Download user's site")
			])
		])


	render: =>
		if @need_update
			@log "Updating"
			@need_update = false

			# Update components
			@post_list?.need_update = true
			@user_list?.need_update = true

			# Update profile details
			@user.get @hub, @auth_address, =>
				@owned = @user.auth_address == Page.user?.auth_address
				if @owned and not @editable_intro
					@editable_intro = new Editable("div", @handleIntroSave)
					@editable_intro.render_function = Text.renderMarked
					@editable_user_name = new Editable("span", @handleUserNameSave)
					@uploadable_avatar = new Uploadable(@handleAvatarUpload)
				Page.projector.scheduleRender()
				@loaded = true

			if not Page.merged_sites[@hub]
				# Not seeded user, get details from userdb
				Page.queryUserdb @auth_address, (row) =>
					@user.setRow(row)
					Page.projector.scheduleRender()
					@loaded = true

		if not @user?.row
			return h("div#Content.center.#{@auth_address}", [])

		if not Page.merged_sites[@hub]
			return @renderNotSeeded()

		if @post_list.loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()

		h("div#Content.center.#{@auth_address}", [
			h("div.col-left", [
				h("div.users", [
					h("div.user.card.profile", {classes: {followed: @user.isFollowed()}}, [
						if @owned then @uploadable_avatar.render(@user.renderAvatar) else @user.renderAvatar()
						h("span.name.link",
							{style: "color: #{Text.toColor(@user.row.auth_address)}"},
							if @owned then @editable_user_name.render(@user.row.user_name) else @user.row.user_name
						),
						h("div.cert_user_id", @user.row.cert_user_id)
						h("div.intro-full",
							if @owned then @editable_intro.render(@user.row.intro) else @user.row.intro
						),
						h("div.follow-container", [
							h("a.button.button-follow-big", {href: "#", onclick: @user.handleFollowClick, classes: {loading: @user.submitting_follow}},
								h("span.icon-follow", "+"),
								if @user.isFollowed() then "Unfollow" else "Follow"
							)
						])
					])
				]),
				if @user_list.users.length > 0
					h("h2.sep", {afterCreate: Animation.show}, [
						"Following",
					])
				@user_list.render(".gray"),
			]),
			h("div.col-center", [
				@post_list.render()
			])
		])

	setUser: (@hub, @auth_address, @cert_user_id) =>
		@log "setUser", @cert_user_id
		if not @post_list or @post_list.directories[0] != "data/users/"+@auth_address
			# Changed user, create clean status objects
			# @post_create = new PostCreate()
			@post_list = new PostList()
			@activity_list = new ActivityList()
			@user_list = new UserList()
			@user = new User()
			@post_list.directories = ["data/users/"+@auth_address]
			@user_list.followed_by = @user
			@user_list.limit = 50
			@need_update = true

	handleIntroSave: (intro, cb) =>
		@user.row.intro = intro
		@user.getData @user.hub, (data) =>
			data.intro = intro
			@user.save data, @user.hub, (res) =>
				cb(res)
				@update()

	handleUserNameSave: (user_name, cb) =>
		@user.row.user_name = user_name
		@user.getData @user.hub, (data) =>
			data.user_name = user_name
			@user.save data, @user.hub, (res) =>
				cb(res)
				@update()

	handleAvatarUpload: (image_base64uri) =>
		# Cleanup previous avatars
		Page.cmd "fileDelete", @user.getPath()+"/avatar.jpg"
		Page.cmd "fileDelete", @user.getPath()+"/avatar.png"

		if not image_base64uri
			# Delete image
			@user.getData @user.hub, (data) =>
				data.avatar = "generate"
				@user.save data, @user.hub, (res) =>
					Page.cmd "wrapperReload"  # Reload the page
			return false

		# Handle upload
		image_base64 = image_base64uri?.replace(/.*?,/, "")
		ext = image_base64uri.match("image/([a-z]+)")[1]
		if ext == "jpeg" then ext = "jpg"


		Page.cmd "fileWrite", [@user.getPath()+"/avatar."+ext, image_base64], (res) =>
			@user.getData @user.hub, (data) =>
				data.avatar = ext
				@user.save data, @user.hub, (res) =>
					Page.cmd "wrapperReload"  # Reload the page

	update: =>
		if not @auth_address
			return
		@need_update = true
		Page.projector.scheduleRender()

window.ContentProfile = ContentProfile