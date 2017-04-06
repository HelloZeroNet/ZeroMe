class ContentCreateProfile extends Class
	constructor: ->
		@loaded = true
		@hubs = []
		@default_hubs = []
		@need_update = true
		@creation_status = []
		@downloading = {}

	handleDownloadClick: (e) =>
		hub = e.target.attributes.address.value
		@downloading[hub] = true
		Page.needSite hub, =>
			@update()
		return false


	handleJoinClick: (e) =>
		hub = e.target.attributes.address.value
		user = new User({hub: hub, auth_address: Page.site_info.auth_address})
		@creation_status.push "Checking user on selected hub..."
		Page.cmd "fileGet", {"inner_path": user.getPath()+"/content.json", "required": false}, (found) =>
			if found
				Page.cmd "wrapperNotification", ["error", "User #{Page.site_info.cert_user_id} already exists on this hub"]
				@creation_status = []
				return

			# Create new profile
			user_name = Page.site_info.cert_user_id.replace(/@.*/, "")
			data = user.getDefaultData()
			data.avatar = "generate"
			data.user_name = user_name.charAt(0).toUpperCase()+user_name.slice(1)
			data.hub = hub
			@creation_status.push "Creating new profile..."
			user.save data, hub, =>
				@creation_status = []
				Page.checkUser()
				Page.setUrl("?Home")

		return false


	updateHubs: =>
		Page.cmd "mergerSiteList", true, (sites) =>
			# Get userlist
			Page.cmd "dbQuery", "SELECT * FROM json", (users) =>
				site_users = {}
				for user in users
					site_users[user.hub] ?= []
					site_users[user.hub].push(user)
				hubs = []
				for address, site of sites
					if address == Page.userdb
						continue
					site["users"] = site_users[site.address] or []
					hubs.push(site)
				@hubs = hubs
				Page.projector.scheduleRender()

			@default_hubs = []
			for address, content of Page.site_info.content.settings.default_hubs
				if not sites[address] and not @downloading[address]
					@default_hubs.push {
						users: [],
						address: address,
						content: content,
						type: "available"
					}


	renderHub: (hub) =>
		rendered = 0
		h("div.hub.card", {key: hub.address+hub.type, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
			if hub.type == "available"
				h("a.button.button-join", {href: "#Download:#{hub.address}", address: hub.address, onclick: @handleDownloadClick}, "Download")
			else
				h("a.button.button-join", {href: "#Join:#{hub.address}", address: hub.address, onclick: @handleJoinClick}, "Join!")
			h("div.avatars", [
				hub.users.map (user) =>
					if user.avatar not in ["jpg", "png"] or rendered >= 4
						return ""
					avatar = "merged-ZeroMe/#{hub.address}/#{user.directory}/avatar.#{user.avatar}"
					rendered += 1
					h("a.avatar", {key: user.user_name, title: user.user_name, style: "background-image: url('#{avatar}')"})
				if hub.users.length - rendered > 0
					h("a.avatar.empty", "+#{hub.users.length - rendered}")
			])
			h("div.name", hub.content.title),
			h("div.intro", hub.content.description)
		])


	renderSeededHubs: =>
		h("div.hubs.hubs-seeded", @hubs.map(@renderHub))

	renderDefaultHubs: =>
		h("div.hubs.hubs-default", @default_hubs.map(@renderHub))


	handleSelectUserClick: ->
		Page.cmd "certSelect", {"accepted_domains": ["zeroid.bit"], "accept_any": true}
		return false


	render: =>
		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()
		if @need_update
			@updateHubs()
			@need_update = false
			Page.changeTitle "Create Profile"

		h("div#Content.center.content-signup", [
			h("h1", "Create new profile"),
			h("a.button.button-submit.button-certselect.certselect", {href: "#Select+user", onclick: @handleSelectUserClick}, [
				h("div.icon.icon-profile"),
				if Page.site_info?.cert_user_id
					"As: #{Page.site_info.cert_user_id}"
				else
					"Select ID..."
			])
			if @creation_status.length > 0
				h("div.creation-status", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
					@creation_status.map (creation_status) =>
						h("h3", {key: creation_status, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, creation_status)
				])
			else if Page.site_info.cert_user_id
				h("div.hubs", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
					if @hubs.length
						h("div.hubselect.seeded", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
							h("h2", "Seeded HUBs")
							@renderSeededHubs()
						])
					if @default_hubs.length
						h("div.hubselect.default", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
							h("h2", "Available HUBs")
							@renderDefaultHubs()
						])
					h("h5", "(With this you choose where is your profile stored. There is no difference on content and you will able to reach all users from any hub)")
				])
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()



window.ContentCreateProfile = ContentCreateProfile
