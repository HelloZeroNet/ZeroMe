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

	handleFollowMenuItemClick: (type, item) =>
		selected = not @follows[type]
		@follows[type] = selected
		item[2] = selected
		@saveFollows()
		Page.projector.scheduleRender()
		return true

	handleMenuClick: =>
		if not Page.site_info?.cert_user_id
			return @handleSelectUserClick()
		Page.cmd "feedListFollow", [], (@follows) =>
			@menu.items = []

			@menu.items.push ["Follow username mentions", ( (item) =>
				return @handleFollowMenuItemClick("Mentions", item)
			), @follows["Mentions"]]

			@menu.items.push ["Follow comments on your posts", ( (item) =>
				return @handleFollowMenuItemClick("Comments on your posts", item)
			), @follows["Comments on your posts"]]

			@menu.items.push ["Follow new followers", ( (item) =>
				return @handleFollowMenuItemClick("New followers", item)
			), @follows["New followers"]]

			@menu.toggle()
			Page.projector.scheduleRender()
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
				 '@' || json.user_name || ': ' || comment.body AS body,
				 '?Post/' || site || '/' || REPLACE(post_uri, '_', '/') AS url
				FROM comment
				LEFT JOIN json USING (json_id)
				WHERE
				post_uri LIKE '#{Page.user.auth_address}%'
			", [""]]

		if @follows["New followers"]
			out["New followers"] = ["
				SELECT
				 'follow' AS type,
				 follow.date_added AS date_added,
				 json.user_name || ' started following you' AS title,
				 '' AS body,
				 '?Profile/' || json.hub || REPLACE(json.directory, 'data/users', '') AS url
 				FROM follow
 				LEFT JOIN json USING(json_id)
 				WHERE
 				auth_address = '#{Page.user.auth_address}'
 				GROUP BY json.directory
 			", [""]]

		Page.cmd "feedFollow", [out]



	render: =>
		h("div.head.center", [
			if Page.getSetting("logo_left")
				h("div.logo", h("img", {src: "img/logo.svg", height: 40, title: "ZeroMe", onerror: "this.src='img/logo.png'; this.onerror=null;"}))
			h("ul", [
				for el in [["Home",'Home',"home"],["Users",'Users',"users"],["Settings",'Settings',"gear"]]
					h("li",h("a",{href:"?#{el[1]}", onclick: Page.handleLinkClick},[h("i.fa.fa-margin.fa-#{el[2]}"),el[0]]))
			]),
			if not Page.getSetting("logo_left")
				h("div.logo", h("img", {src: "img/logo.svg", height: 40, title: "ZeroMe", onerror: "this.src='img/logo.png'; this.onerror=null;"}))
			if Page.user?.hub
				# Registered user
				h("div.right.authenticated", [
					h("div.user",
						h("a.name.link", {href: Page.user.getLink(), onclick: Page.handleLinkClick}, Page.user.row.user_name),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, Page.site_info.cert_user_id)
					),
					h("a.settings", {href: "#Settings", onclick: Page.returnFalse, onmousedown: @handleMenuClick}, "\u22EE")
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
					h("a.settings", {href: "#Settings", onclick: Page.returnFalse, onmousedown: @handleMenuClick}, "\u22EE")
				])
			else if not Page.user?.hub and Page.site_info
				# No cert selected
				h("div.right.unknown", [
					h("div.user",
						h("a.name.link", {href: "#Select+user", onclick: @handleSelectUserClick}, "Visitor"),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, "Select your account")
					),
					@menu.render()
					h("a.settings", {href: "#Settings", onclick: Page.returnFalse, onmousedown: @handleMenuClick}, "\u22EE")
				])
			else
				h("div.right.unknown")
		])

window.Head = Head
