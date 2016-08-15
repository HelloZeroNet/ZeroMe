class ContentFeed extends Class
	constructor: ->
		@post_create = new PostCreate()
		@post_list = new PostList()
		@activity_list = new ActivityList()
		@user_list = new UserList()
		@need_update = true
		@type = "followed"
		@update()

	handleListTypeClick: (e) =>
		@type = e.currentTarget.attributes.type.value
		@update()
		return false

	render: =>
		if @post_list.loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()

		if @need_update
			@log "Updating"
			@need_update = false

			@user_list.need_update = true

			# Post list
			if @type == "followed"
				@post_list.directories = ("data/users/#{key.split('/')[1]}" for key, followed of Page.user.followed_users)
				if Page.user.hub  # Also show my posts
					@post_list.directories.push("data/users/"+Page.user.auth_address)
			else
				@post_list.directories = "all"
			@post_list.need_update = true

			# Activity list
			@activity_list.directories = @post_list.directories
			@activity_list.update()


		h("div#Content.center", [
			h("div.col-center", [
				@post_create.render(),
				h("div.post-list-type",
					h("a.link", {href: "#Everyone", onclick: @handleListTypeClick, type: "everyone", classes: {active: @type == "everyone"}}, "Everyone")
					h("a.link", {href: "#Followed+users", onclick: @handleListTypeClick, type: "followed", classes: {active: @type == "followed"}}, "Followed users")
				),
				@post_list.render()
			]),
			h("div.col-right", [
				@activity_list.render(),
				if @user_list.users.length > 0
					h("h2.sep", [
						"New users",
						h("a.link", {href: "?Users", onclick: Page.handleLinkClick}, "Browse all \u203A")
					])
				@user_list.render(".gray"),
			])
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentFeed = ContentFeed
