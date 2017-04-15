window.h = maquette.h

class ZeroMe extends ZeroFrame
	init: ->
		@params = {}
		@merged_sites = {}
		@site_info = null
		@server_info = null
		@address = null
		@user = false
		@user_loaded = false
		@userdb = "1UDbADib99KE9d3qZ87NqJF2QLTHmMkoV"
		@cache_time = Time.timestamp()  # Image cache invalidation

		@on_site_info = new Promise()
		@on_local_storage = new Promise()
		@on_user_info = new Promise()
		@on_loaded = new Promise()
		@local_storage = null
		@local_storage_loaded = false
		@loadLocalStorage()

		@on_site_info.then =>
			# Load user data
			@checkUser =>
				@on_user_info.resolve()

			# Check merger permissions
			if "Merger:ZeroMe" not in @site_info.settings.permissions
				@cmd "wrapperPermissionAdd", "Merger:ZeroMe", =>
					@updateSiteInfo =>
						@content.update()

	changeTitle: (title) ->
		suffix=@site_info?.content?.title||"ZeroMe"
		if title
			Page.cmd "wrapperSetTitle", "#{title} | #{suffix}"
		else
			Page.cmd "wrapperSetTitle", "#{suffix}"

	createProjector: ->
		@projector = maquette.createProjector()
		@head = new Head()
		@overlay = new Overlay()
		@content_feed = new ContentFeed()
		@content_users = new ContentUsers()
		@content_settings = new ContentSettings()
		@content_profile = new ContentProfile()
		@content_create_profile = new ContentCreateProfile()
		@scrollwatcher = new Scrollwatcher()

		if base.href.indexOf("?") == -1
			@route("")
		else
			url = base.href.replace(/.*?\?/, "")
			@route(url)
			@history_state["url"] = url

		# Remove fake long body
		@on_loaded.then =>
			@log "onloaded"
			window.requestAnimationFrame =>
				document.body.className = "loaded"+@otherClasses()

		@projector.replace($("#Head"), @head.render)
		@projector.replace($("#Overlay"), @overlay.render)

		# Update every minute to keep time since fields up-to date
		setInterval ( ->
			Page.projector.scheduleRender()
		), 60*1000

	renderContent: =>
		if @site_info
			return h("div#Content", @content.render())
		else
			return h("div#Content")

	# Route site urls
	route: (query) ->
		@params = Text.queryParse(query)
		@log "Route", @params

		if not @params.urls
			content =
				update: ->
					return false
				render: ->
					return false
			return @setUrl("?Home")
		else if @params.urls[0] == "Create+profile"
			content = @content_create_profile
		else if @params.urls[0] == 'Users' and
			content = @content_users
		else if @params.urls[0] == 'Settings'
			content = @content_settings
		else if @params.urls[0] == "ProfileName"
			@content_profile.findUser @params.urls[1], (user) =>
				@setUrl user.getLink(), "replace"
		else if @params.urls[0] == "Profile"
			content = @content_profile
			changed = (@content_profile.auth_address != @params.urls[2])
			@content_profile.setUser(@params.urls[1], @params.urls[2]).filter(null)
		else if @params.urls[0] == "Post"
			content = @content_profile
			changed = (@content_profile.auth_address != @params.urls[2] or @content_profile.filter_post_id != @params.urls[3])
			@content_profile.setUser(@params.urls[1], @params.urls[2]).filter(@params.urls[3])
		else
			content = @content_feed
		if content and (@content != content or changed)
			if @content
				setTimeout ( => @content.update() ), 100
				@projector.detach(@content.render)
			@content = content
			@on_user_info.then =>
				@projector.replace($("#Content"), @content.render)


	setUrl: (url, mode="push") ->
		url = url.replace(/.*?\?/, "")
		@log "setUrl", @history_state["url"], "->", url
		if @history_state["url"] == url
			@content.update()
			return false
		@history_state["url"] = url
		if mode == "replace"
			@cmd "wrapperReplaceState", [@history_state, "", url]
		else
			@cmd "wrapperPushState", [@history_state, "", url]
		@route url
		return false


	handleLinkClick: (e) =>
		if e.which == 2
			# Middle click dont do anything
			return true
		else
			@log "save scrollTop", window.pageYOffset
			@history_state["scrollTop"] = window.pageYOffset
			@cmd "wrapperReplaceState", [@history_state, null]

			window.scroll(window.pageXOffset, 0)
			@history_state["scrollTop"] = 0

			@on_loaded.resolved = false
			document.body.className = ""+@otherClasses()

			@setUrl e.currentTarget.search
			return false


	# Add/remove/change parameter to current site url
	createUrl: (key, val) ->
		params = JSON.parse(JSON.stringify(@params))  # Clone
		if typeof key == "Object"
			vals = key
			for key, val of keys
				params[key] = val
		else
			params[key] = val
		return "?"+Text.queryEncode(params)


	loadLocalStorage: ->
		@on_site_info.then =>
			@logStart "Loaded localstorage"
			@cmd "wrapperGetLocalStorage", [], (@local_storage) =>
				@logEnd "Loaded localstorage"
				@local_storage_loaded = true
				@local_storage ?= {}
				@local_storage.followed_users ?= {}
				@local_storage.settings ?= {}
				@on_local_storage.resolve(@local_storage)


	saveLocalStorage: (cb=null) ->
		@logStart "Saved localstorage"
		if @local_storage
			@cmd "wrapperSetLocalStorage", @local_storage, (res) =>
				@logEnd "Saved localstorage"
				cb?(res)


	onOpenWebsocket: (e) =>
		@updateSiteInfo()
		@updateServerInfo()

	otherClasses: =>
		res=[]
		if not @getSetting("transparent") then res.push("no-transparent")
		if @getSetting("logo_left") then res.push("logo-left")
		if not @getSetting("not_sticky_header") then res.push("sticky-header")
		if res.length then return " "+res.join(" ") else return ""


	updateSiteInfo: (cb=null) =>
		on_site_info = new Promise()
		@cmd "mergerSiteList", {}, (merged_sites) =>
			@merged_sites = merged_sites
			# Add userdb if not seeded yet
			on_site_info.then =>
				if "Merger:ZeroMe" in @site_info.settings.permissions and not @merged_sites[@userdb]
					@cmd "mergerSiteAdd", @userdb
				cb?(true)
		@cmd "siteInfo", {}, (site_info) =>
			@address = site_info.address
			@setSiteInfo(site_info)
			on_site_info.resolve()


	updateServerInfo: =>
		@cmd "serverInfo", {}, (server_info) =>
			@setServerInfo(server_info)

	needSite: (address, cb) =>
		if @merged_sites[address]
			cb?(true)
		else
			Page.cmd "mergerSiteAdd", address, cb

	checkUser: (cb=null) =>
		@log "Find hub for user", @site_info.cert_user_id
		if not @site_info.cert_user_id
			@user = new AnonUser()
			@user.updateInfo(cb)
			return false

		Page.cmd "dbQuery", ["SELECT * FROM json WHERE directory = :directory AND user_name IS NOT NULL AND file_name = 'data.json' AND intro IS NOT NULL", {directory: "data/users/#{@site_info.auth_address}"}], (res) =>
			if res?.length > 0
				@user = new User({hub: res[0]["hub"], auth_address: @site_info.auth_address})
				@user.row = res[0]
				for row in res
					if row.site == row.hub
						@user.row = row
				@log "Choosen site for user", @user.row.site, @user.row
				@user.updateInfo(cb)
			else
				# No currently seeded user with that cert_user_id
				@user = new AnonUser()
				@user.updateInfo()
				# Check in the userdb and start add the user's hub if necessary
				@queryUserdb @site_info.auth_address, (user) =>
					if user
						if not @merged_sites[user.hub]
							@log "Profile not seeded, but found in the userdb", user
							Page.cmd "mergerSiteAdd", user.hub, =>  # Start download user's hub
								cb?(true)
						else
							cb?(true)
					else
						# User selected, but no profile yet
						cb?(false)



			Page.projector.scheduleRender()

	# Look for user in the userdb
	queryUserdb: (auth_address, cb) =>
		query = """
			SELECT
			 CASE WHEN user.auth_address IS NULL THEN REPLACE(json.directory, "data/userdb/", "") ELSE user.auth_address END AS auth_address,
			 CASE WHEN user.cert_user_id IS NULL THEN json.cert_user_id ELSE user.cert_user_id END AS cert_user_id,
			 *
			FROM user
			LEFT JOIN json USING (json_id)
			WHERE
			 user.auth_address = :auth_address OR
			 json.directory = :directory
			LIMIT 1
		"""
		Page.cmd "dbQuery", [query, {auth_address: auth_address, directory: "data/userdb/"+auth_address}], (res) =>
			if res?.length > 0
				cb?(res[0])
			else
				cb?(false)

	getSetting: (key) ->
		if @local_storage?.settings?[key]
			return true
		else if not @local_storage_loaded
			@log "WARN: Getting setting #{key} but storage has not been loaded yet"
		else
			return false

	# Parse incoming requests from UiWebsocket server
	onRequest: (cmd, params) ->
		if cmd == "setSiteInfo" # Site updated
			@setSiteInfo(params)
		else if cmd == "wrapperPopState" # Site updated
			if params.state
				if not params.state.url
					params.state.url = params.href.replace /.*\?/, ""
				@on_loaded.resolved = false
				document.body.className = ""+@otherClasses()
				window.scroll(window.pageXOffset, params.state.scrollTop or 0)
				@route(params.state.url or "")
		else
			@log "Unknown command", cmd, params


	setSiteInfo: (site_info) ->
		# First update
		if site_info.address == @address
			if not @site_info  # First site info
				@site_info = site_info
				@on_site_info.resolve()
			@site_info = site_info
			if site_info.event?[0] == "cert_changed"
				@checkUser (found) =>
					if Page.site_info.cert_user_id and not found
						@setUrl "?Create+profile"
					# Auto follow mentions and comments on user change
					if Page.site_info.cert_user_id
						Page.head.follows["Mentions"] = true
						Page.head.follows["Comments on your posts"] = true
						Page.head.saveFollows()
					@content.update()

		if site_info.event?[0] == "file_done"
			file_name = site_info.event[1]
			if file_name.indexOf(site_info.auth_address) != -1 and Page.user?.auth_address != site_info.auth_address
				# User's data arrived and not autheticated yet
				@checkUser =>
					@content.update()
			else if not @merged_sites[site_info.address] and site_info.address != @address
				# New site added
				@log "New site added:", site_info.address
				@updateSiteInfo =>
					@content.update()
			else if file_name.indexOf(site_info.auth_address) != -1
				# User's data changed, update immedietly
				@content.update()
			else if not file_name.endsWith("content.json") or file_name.indexOf(@userdb) != -1
				# Check only on data changes on hub sites and every file on userdb
				if site_info.tasks > 100
					RateLimit 3000, @content.update
				else if site_info.tasks > 20
					RateLimit 1000, @content.update
				else
					RateLimit 500, @content.update


	setServerInfo: (server_info) ->
		@server_info = server_info
		if @server_info.rev < 1400
			@cmd "wrapperNotification", ["error", "This site requries ZeroNet 0.4.0+<br>Please delete the site from your current client, update it, then add again!"]
		@projector.scheduleRender()


	# Simple return false to avoid link clicks
	returnFalse: ->
		return false


window.Page = new ZeroMe()
window.Page.createProjector()
