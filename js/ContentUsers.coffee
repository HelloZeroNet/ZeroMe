class ContentUsers extends Class
	constructor: ->
		@user_list_suggested = new UserList("suggested")
		@user_list_suggested.limit = 9

		@user_list_active = new UserList("active")
		@user_list_active.limit = 9

		@user_list_recent = new UserList("recent")
		@user_list_recent.limit = 90

		@loaded = true
		@need_update = false
		@search = ""
		@num_users_total = null

	handleSuggestedMoreClick: =>
		@user_list_suggested.limit += 90
		@user_list_suggested.need_update = true
		@user_list_suggested.loading = true
		Page.projector.scheduleRender()
		return false

	handleActiveMoreClick: =>
		@user_list_active.limit += 90
		@user_list_active.need_update = true
		@user_list_active.loading = true
		Page.projector.scheduleRender()
		return false

	handleRecentMoreClick: =>
		@user_list_recent.limit += 300
		@user_list_recent.need_update = true
		@user_list_recent.loading = true
		Page.projector.scheduleRender()
		return false

	handleSearchInput: (e=null) =>
		@search = e.target.value
		if @search == ""
			rate_limit = 0
		if @search.length < 3
			rate_limit = 400
		else
			rate_limit = 200
		RateLimit rate_limit, =>
			@log "Search", @search
			@user_list_recent.search = @search
			@user_list_recent.need_update = true
			@user_list_recent.limit = 15
			Page.projector.scheduleRender()

	render: =>
		window.otherPageBackground()

		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()
		if @need_update or not @num_users_total
			Page.cmd "dbQuery", "SELECT COUNT(*) AS num FROM user", (res) =>
				@num_users_total = res[0]["num"]
				Page.projector.scheduleRender()
		if @need_update
			@log "Updating"
			@need_update = false
			Page.changeTitle "Users"

			# Update components
			@user_list_recent?.need_update = true
			@user_list_active?.need_update = true
			if Page.user.auth_address
				@user_list_suggested?.need_update = true

		h("div#Content.center", [
			h("input.text.big.search", {placeholder: "Search in users...", value: @search, oninput: @handleSearchInput})

			if not @search
				[
					if @user_list_suggested.users.length > 0
						h("h2.suggested", "Suggested users")
					h("div.users.cards.suggested", [
						@user_list_suggested.render("card")
					])
					if @user_list_suggested.users.length == @user_list_suggested.limit
						h("a.more.suggested", {href: "#", onclick: @handleSuggestedMoreClick}, "Show more...")
					else if @user_list_suggested.users.length > 0 and @user_list_suggested.loading
						h("a.more.suggested", {href: "#", onclick: @handleSuggestedMoreClick}, "Loading...")

					if @user_list_active.users.length > 0
						h("h2.active", "Most active")
					h("div.users.cards.active", [
						@user_list_active.render("card")
					])
					if @user_list_active.users.length == @user_list_active.limit
						h("a.more.active", {href: "#", onclick: @handleActiveMoreClick}, "Show more...")
					else if @user_list_active.users.length > 0 and @user_list_active.loading
						h("a.more.active", {href: "#", onclick: @handleActiveMoreClick}, "Loading...")

					if @user_list_recent.users.length > 0
						h("h2.recent", "New users in ZeroMe")
				]

			h("div.users.cards.recent", [
				@user_list_recent.render("card")
			])
			if @user_list_recent.users.length == @user_list_recent.limit
				h("a.more.recent", {href: "#", onclick: @handleRecentMoreClick}, "Show more...")
			else if @user_list_recent.users.length > 0 and @user_list_recent.loading
				h("a.more.recent", {href: "#", onclick: @handleRecentMoreClick}, "Loading...")

			if @user_list_recent.users.length
				h("h5", {style: "text-align: center"}, "Total: #{@num_users_total} registered users")
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentUsers = ContentUsers
