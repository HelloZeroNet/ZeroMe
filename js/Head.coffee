class Head extends Class
	handleSelectUserClick: ->
		if "Merger:ZeroMe" not in Page.site_info.settings.permissions
			Page.cmd "wrapperPermissionAdd", "Merger:ZeroMe", =>
				Page.updateSiteInfo =>
					Page.content.update()
		else
			Page.cmd "certSelect", {"accepted_domains": ["zeroid.bit"], "accept_any": true}
		return false

	renderSettings: =>
		# h("a.settings", {href: "?Signup", onclick: Page.handleLinkClick}, "\u22EE")
		return ""

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
					@renderSettings()
				])
			else if not Page.user?.hub and Page.site_info?.cert_user_id
				# Cert selected, but not registered
				h("div.right.selected", [
					h("div.user",
						h("a.name.link", {href: "?Create+profile", onclick: Page.handleLinkClick}, "Create profile"),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, Page.site_info.cert_user_id)
					),
					@renderSettings()
				])
			else if not Page.user?.hub and Page.site_info
				# No cert selected
				h("div.right.unknown", [
					h("div.user",
						h("a.name.link", {href: "#Select+user", onclick: @handleSelectUserClick}, "Visitor"),
						h("a.address", {href: "#Select+user", onclick: @handleSelectUserClick}, "Select your account")
					),
					@renderSettings()
				])
			else
				h("div.right.unknown")
		])

window.Head = Head