class ContentFeed extends Class
	constructor: ->
		@post_create = new PostCreate()
		@post_list = new PostList()
		@activity_list = new ActivityList()
		@new_user_list = new UserList("new")
		@suggested_user_list = new UserList("suggested")
		@need_update = true
		@type = "followed"
		@update()

	handleListTypeClick: (e) =>
		@type = e.currentTarget.attributes.type.value
		@post_list.limit = 10
		@activity_list.limit = 10
		@update()
		return false

	render: =>
		if @post_list.loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()

		if @need_update
			@log "Updating", @type
			if Page.user and Page.user.applyBackground
				Page.user.applyBackground()
			else
				window.setBackground "#F6F7F8"
			@need_update = false

			@new_user_list.need_update = true
			@suggested_user_list.need_update = true

			# Post list
			if @type == "followed"
				@post_list.directories = ("data/users/#{key.split('/')[1]}" for key, followed of Page.user.followed_users)
				if Page.user.hub  # Also show my posts
					@post_list.directories.push("data/users/"+Page.user.auth_address)
				@post_list.filter_post_ids = null
			else if @type == "liked"
				@post_list.directories = ("data/users/#{like.split('_')[0]}" for like, _ of Page.user.likes)
				@post_list.filter_post_ids = (like.split('_')[1] for like, _ of Page.user.likes)
			else
				@post_list.directories = "all"
				@post_list.filter_post_ids = null
			@post_list.need_update = true

			# Activity list
			if @type == "followed"
				@activity_list.directories = ("data/users/#{key.split('/')[1]}" for key, followed of Page.user.followed_users)
			else
				@activity_list.directories = "all"
			@activity_list.update()


		h("div#Content.center", [
			h("div.col-center", [
				@post_create.render(),
				h("div.post-list-type",
					h("a.link", {href: "#Everyone", onclick: @handleListTypeClick, type: "everyone", classes: {active: @type == "everyone"}}, "Everyone")
					h("a.link", {href: "#Liked", onclick: @handleListTypeClick, type: "liked", classes: {active: @type == "liked"}}, "Liked")
					h("a.link", {href: "#Followed+users", onclick: @handleListTypeClick, type: "followed", classes: {active: @type == "followed"}}, "Followed users")
				),
				@post_list.render()
			]),
			h("div.col-right.noscrollfix", [
				@activity_list.render(),
				if @new_user_list.users.length > 0
					h("h2.sep.new", [
						"New users",
						h("a.link", {href: "?Users", onclick: Page.handleLinkClick}, "Browse all \u203A")
					])
				@new_user_list.render(".gray"),

				if @suggested_user_list.users.length > 0
					h("h2.sep.suggested", [
						"Suggested users"
					])
				@suggested_user_list.render(".gray"),
			])
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentFeed = ContentFeed
