class ContentFeed extends Class
	constructor: ->
		@post_create = new PostCreate()
		@post_list = new PostList()
		@activity_list = new ActivityList()
		@new_user_list = new UserList("new")
		@suggested_user_list = new UserList("suggested")
		@hubs = new Menu()
		@lang_filter = new Menu()
		@filter_lang_list = {}
		@need_update = true
		@type = "followed"
		@update()
		@language_dict = {
			"English": /[\u0041-\u007A]/,
			"Latin-1": /[\u00C0-\u00FF]/,
			"Greek": /[\u0391-\u03C9]/,
			"Cyrillic": /[\u0410-\u044F]/,
			"Armenian": /[\u0531-\u0586]/,
			"Hebrew": /[\u05D0-\u05EA]/,
			"Arabic": /[\u0620-\u06D5]/,
			"Devanagari": /[\u0904-\u097F]/
			"Kana": /[\u3041-\u30FA]/,
			"ZH-JA-KO": /[\u4E00-\u9FEA]/,
			"Hangul": /[\uAC00-\uD7A3]/,
			"Emoji": /[\ud83C-\ud83E][\uDC00-\uDDEF]/
		}

	handleListTypeClick: (e) =>
		@type = e.currentTarget.attributes.type.value
		if @type == "everyone"
			@filter_lang_list = {}
		@post_list.limit = 10
		@activity_list.limit = 10
		@update()
		return false

	renderHubsMenu: (hub_title, address)=>
		h("a.link", {href: "#" + hub_title, onclick: @handleListTypeClick, type: "hub"+"_"+address, classes: {active: @type == "hub"+"_"+address}}, hub_title)

	handleHubsClick: =>
		@hubs.items = []
		Page.cmd "mergerSiteList", true, (sites) =>
			for address, site of sites
				if address == Page.userdb
					continue
				@hubs.items.push [@renderHubsMenu(site.content.title, address), null]

			@hubs.toggle()
		return false

	handleLanguageClick: (e) =>
		value = e.currentTarget.value
		if @filter_lang_list[value]
			delete @filter_lang_list[value]
		else
			@filter_lang_list[value] = true
		if value.slice(0,7) == "lang-on"
			delete @filter_lang_list["lang-off"+value.slice(7)]
		else if value.slice(0,8) == "lang-off"
			delete @filter_lang_list["lang-on"+value.slice(8)]
		# Without re-push, the language won't be selected.
		@lang_filter.items = []		
		@lang_filter.items.push [@renderFilterLanguage(), null]
		return false

	renderFilterLanguage: =>
		langs = Object.keys(@language_dict)

		h("div.menu-radio",
			h("a.all", {href: "#all", onclick: @handleListTypeClick, type: "everyone", classes: {active: @type == "everyone"}}, "Show all")
			h("a.filter", {href: "#filter", onclick: @handleListTypeClick, type: "lang", classes: {active: @type == "lang"}}, "Filter")
			for lang in langs
				[
					h("span",
						h("a.lang-on", {href: "#"+lang+"_on", onclick: @handleLanguageClick, value: "lang-on"+"_"+lang, classes: {selected: @filter_lang_list["lang-on"+"_"+lang]}}, "    +"),
						h("a.lang-off", {href: "#"+lang+"_off", onclick: @handleLanguageClick, value: "lang-off"+"_"+lang, classes: {selected: @filter_lang_list["lang-off"+"_"+lang]}}, "-    "),
					" ", lang
					)
				]
		)

	handleFiltersClick: =>
		@lang_filter.items = []
		@lang_filter.items.push [@renderFilterLanguage(), null]
		if @lang_filter.visible
			@lang_filter.hide()
		else
			@lang_filter.show()
		return false

	queryLanguageIds: (query, lang_list, cb) =>
		language_ids = []
		Page.cmd "dbQuery", [query], (rows) =>
			for row in rows
				if row["body"] == null
					continue
				# Only select 100 letters
				if row["body"].length > 100
					body_tmp = ""
					for i in [0..9]
						start_point = ~~(row["body"].length/10)*i
						body_tmp += row["body"].slice(start_point, start_point+9)
					row["body"] = body_tmp

				not_match = false
				for lang_off in lang_list["off"]
					if row["body"].match(@language_dict[lang_off])
						not_match = true
						break
					if lang_off == lang_list["off"][-1]
					  if lang_list["on"].length == 0
						  language_ids.push([row["item_id"], row["json_id"]])
				if !not_match
					for lang_on in lang_list["on"]
						if row["body"].match(@language_dict[lang_on])
							language_ids.push([row["item_id"], row["json_id"]])
							break
			cb(language_ids)

	render: =>
		if @post_list.loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()

		if @need_update
			@log "Updating", @type
			@need_update = false

			@new_user_list.need_update = true
			@suggested_user_list.need_update = true

			@post_list.filter_post_ids = null
			@post_list.filter_hub = null
			@post_list.filter_language_ids = null
			@post_list.directories = "all"
			@activity_list.filter_hub = null
			@activity_list.filter_language_ids = null
			@activity_list.directories = "all"

			# Post list
			if @type == "followed"
				@post_list.directories = ("data/users/#{key.split('/')[1]}" for key, followed of Page.user.followed_users)
				if Page.user.hub  # Also show my posts
					@post_list.directories.push("data/users/"+Page.user.auth_address)
			else if @type == "liked"
				@post_list.directories = ("data/users/#{like.split('_')[0]}" for like, _ of Page.user.likes)
				@post_list.filter_post_ids = (like.split('_')[1] for like, _ of Page.user.likes)
			else if @type.slice(0,3) == "hub"
				@post_list.filter_hub = @type.slice(4)
			else if @type == "lang"
				lang_list = {"on": [], "off": []}
				for lang in Object.keys(@filter_lang_list)
					if lang.slice(0,7) == "lang-on"
						lang_list["on"].push(lang.slice(8))
					else
						lang_list["off"].push(lang.slice(9))
				query = "SELECT post_id AS item_id, post.json_id, post.body FROM post"
				@queryLanguageIds query, lang_list, (language_ids) =>
					@post_list.filter_language_ids = "(VALUES "+("(#{id_pair[0]},#{id_pair[1]})" for id_pair in language_ids).join(',')+")"
					@post_list.need_update = true
			if @type.slice(0,4) != "lang"
				@post_list.need_update = true

			# Activity list
			if @type == "followed"
				@activity_list.directories = ("data/users/#{key.split('/')[1]}" for key, followed of Page.user.followed_users)
			else if @type.slice(0,3) == "hub"
				@activity_list.directories = "hub"
				@activity_list.filter_hub = @type.slice(4)
			else if @type == "lang"
				query = "SELECT comment_id AS item_id, comment.json_id, comment.body FROM comment"
				@queryLanguageIds query, lang_list, (language_ids) =>
					@activity_list.filter_language_ids = "(VALUES "+("(#{id_pair[0]},#{id_pair[1]})" for id_pair in language_ids).join(',')+")"
					@activity_list.update()
			if @type.slice(0,4) != "lang"
				@activity_list.update()


		h("div#Content.center", [
			h("div.col-center", [
				@post_create.render(),
				h("div.post-list-type",
					h("div.hub-menu",
						h("a.link", {href: "#Hubs", onclick: @handleHubsClick}, "Hubs")
						@hubs.render()
					)
					h("div.filters-menu",
						h("a.link", {href: "#Filters", onmousedown: @handleFiltersClick, onclick: Page.returnFalse}, "Everyone")
						@lang_filter.render()
					)
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
