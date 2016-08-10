class ContentUsers extends Class
	constructor: ->
		@user_list_recent = new UserList("recent")
		@user_list_recent.limit = 1000
		@loaded = true
		@need_update = false

	render: =>
		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()
		if @need_update
			@log "Updating"
			@need_update = false

			# Update components
			@user_list_recent?.need_update = true

		h("div#Content.center", [
			#h("input.text.big.search", {placeholder: "Search in users..."}),
			h("h2", "New users in ZeroMe")
			h("div.users.cards", [
				@user_list_recent.render("card")
			])
		])
		###
			h("a.more", {href: "#"}, "Show more..."),
			h("h2", "Followed users"),
			h("div.users.cards", [
				h("div.user.card", [
					h("a.button.button-follow", {href: "#"}, "+"),
					h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
					h("a.name.link", {href: "#"}, "Nofish"),
					h("div.intro", "ZeroNet developer")
				])
			]),
		])
		###

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentUsers = ContentUsers