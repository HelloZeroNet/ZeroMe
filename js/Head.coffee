class Head extends Class
	constructor: ->
		@menu = new Menu()
		@follows = []

	handleSelectUserClick: ->
		if "Merger:ZeroMe" not in Page.site_info.settings.permissions
			Page.cmd "wrapperPermissionAdd", "Merger:ZeroMe", =>
				Page.updateSiteInfo =>
					Page.content.update()
		else
			Page.cmd "certSelect", {"accepted_domains": ["zeroid.bit"], "accept_any": true}
		return false

	handleMenuClick: =>
		if not Page.site_info?.cert_user_id
			return @handleSelectUserClick()
		Page.cmd "feedListFollow", [], (@follows) =>
			@menu.items = []

			@menu.items.push ["Follow username mentions", ( (item) =>
				selected = not @follows["Mentions"]
				@follows["Mentions"] = selected
				item[2] = selected
				@saveFollows()
				Page.projector.scheduleRender()
				return true
			), @follows["Mentions"]]

			@menu.items.push ["Follow comments on your posts", ( (item) =>
				selected = not @follows["Comments on your posts"]
				@follows["Comments on your posts"] = selected
				item[2] = selected
				@saveFollows()
				Page.projector.scheduleRender()
				return true
			), @follows["Comments on your posts"]]

			@menu.toggle()
			Page.projector.sche
		return false

	saveFollows: =>
		out = {}
		if @follows["Mentions"]
			out["Mentions"] = ["
				SELECT
				 'mention' AS type,
				 comment.date_added AS date_added,
				 'a comment' AS title,
				 '@' || user_name || ': ' || comment.body AS body,
				 '?Post/' || json.site || '/' || REPLACE(post_uri, '_', '/') AS url
				FROM comment
				LEFT JOIN json USING (json_id)
				WHERE
				 comment.body LIKE '%@#{Page.user.row.user_name}%'

				UNION

				SELECT
				 'mention' AS type,
				 post.date_added AS date_added,
				 'In ' || json.user_name || \"'s post\" AS title,
				 post.body AS body,
				 '?Post/' || json.site || '/' || REPLACE(json.directory, 'data/users/', '') || '/' || post_id AS url
				FROM post
				LEFT JOIN json USING (json_id)
				WHERE
				 post.body LIKE '%@#{Page.user.row.user_name}%'
			", [""]]

		if @follows["Comments on your posts"]
			out["Comments on your posts"] = ["
				SELECT
				 'comment' AS type,
				 comment.date_added AS date_added,
				 'Your post' AS title,
				 comment.body AS body,
				 '?Post/' || site || '/' || REPLACE(post_uri, '_', '/') AS url
				FROM comment
				LEFT JOIN json USING (json_id)
				WHERE
				post_uri LIKE '#{Page.user.auth_address}%'
			", [""]]

		Page.cmd "feedFollow", [out]



	render: =>
		h("div.head.center", [
			h("a.logo", {href: "?Home", onclick: Page.handleLinkClick}, h("img", {src: "img/logo.png"})),
			if Page.user?.hub
				# Registered user
				h("div.right.authenticated", [
					h("div.user",
						h("a.name.link", {href: Page.user.getLink(), onclick: Page.handleLinkClick}, Page.user.row.user_name),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, Page.site_info.cert_user_id)
					),
					h("a.settings", {href: "#Settings", onclick: @handleMenuClick}, "\u22EE")
					@menu.render()
				])
			else if not Page.user?.hub and Page.site_info?.cert_user_id
				# Cert selected, but not registered
				h("div.right.selected", [
					h("div.user",
						h("a.name.link", {href: "?Create+profile", onclick: Page.handleLinkClick}, "Create profile"),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, Page.site_info.cert_user_id)
					),
					@menu.render()
					h("a.settings", {href: "#Settings", onclick: @handleMenuClick}, "\u22EE")
				])
			else if not Page.user?.hub and Page.site_info
				# No cert selected
				h("div.right.unknown", [
					h("div.user",
						h("a.name.link", {href: "#Select+user", onclick: @handleSelectUserClick}, "Visitor"),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, "Select your account")
					),
					@menu.render()
					h("a.settings", {href: "#Settings", onclick: @handleMenuClick}, "\u22EE")
				])
			else
				h("div.right.unknown")
		])

window.Head = Head