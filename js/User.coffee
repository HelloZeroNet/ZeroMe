class User extends Class
	constructor: (row, @item_list) ->
		if row
			@setRow(row)
		@likes = {}
		@followed_users = {}
		@submitting_follow = false

	setRow: (row) ->
		@row = row
		@hub = row.hub
		@auth_address = row.auth_address

	get: (site, auth_address, cb=null) ->
		params = { site: site, directory: "data/users/"+auth_address }
		Page.cmd "dbQuery", ["SELECT * FROM json WHERE site = :site AND directory = :directory LIMIT 1", params], (res) =>
			row = res[0]
			if row
				row.auth_address = row.directory.replace("data/users/", "")
				@setRow(row)
				cb?(row)
			else
				cb(false)

	updateInfo: (cb=null) =>
		@logStart "Info loaded"
		p_likes = new Promise()
		p_followed_users = new Promise()

		# Load followed users
		Page.cmd "dbQuery", ["SELECT * FROM follow WHERE json_id = #{@row.json_id}"], (res) =>
			@followed_users = {}
			for row in res
				@followed_users[row.hub+"/"+row.auth_address] = row
			p_followed_users.resolve()

		# Load likes
		Page.cmd "dbQuery", ["SELECT post_like.* FROM json LEFT JOIN post_like USING (json_id) WHERE directory = 'data/users/#{@auth_address}' AND post_uri IS NOT NULL"], (res) =>
			@likes = {}
			for row in res
				@likes[row.post_uri] = true
			p_likes.resolve()

		Promise.join(p_followed_users, p_likes).then (res1, res2) =>
			@logEnd "Info loaded"
			cb?(true)

	isFollowed: ->
		return Page.user.followed_users[@hub+"/"+@auth_address]

	isSeeding: ->
		return Page.merged_sites[@hub]

	hasHelp: (cb) =>
		Page.cmd "OptionalHelpList", [@hub], (helps) =>
			cb(helps["data/users/#{@auth_address}"])

	getPath: (site=@hub) ->
		if site == Page.userdb
			return "merged-ZeroMe/#{site}/data/userdb/#{@auth_address}"
		else
			return "merged-ZeroMe/#{site}/data/users/#{@auth_address}"

	getLink: ->
		return "?Profile/#{@hub}/#{@auth_address}/#{@row.cert_user_id or ''}"

	getAvatarLink: ->
		cache_invalidation = ""
		# Cache invalidation for local user
		if @auth_address == Page.user?.auth_address
			cache_invalidation = "?"+Page.cache_time
		return "merged-ZeroMe/#{@hub}/data/users/#{@auth_address}/avatar.#{@row.avatar}#{cache_invalidation}"

	getBackgroundLink: ->
		cache_invalidation = ""
		# Cache invalidation for local user
		if @auth_address == Page.user?.auth_address
			cache_invalidation = "?"+Page.cache_time
		return "merged-ZeroMe/#{@hub}/data/users/#{@auth_address}/bg.#{@row.bg}#{cache_invalidation}"

	getBackground: ->
		if @row and @row.bgColor
			return @row.bgColor
		else if @row and @row.bgUnset
			return window.defaultBackground.color
		else
			throw new Error("ROW ERROR")

	getDefaultData: ->
		return {
			"next_post_id": 2,
			"next_comment_id": 1,
			"next_follow_id": 1,
			"avatar": "generate",
			"user_name": @row?.user_name,
			"hub": @hub,
			"intro": "Random ZeroNet user",
			"post": [{
				"post_id": 1,
				"date_added": Time.timestamp(),
				"body": "Hello ZeroMe!"
			}],
			"bgColor": window.defaultBackground.color="#D30C37"
			"post_like": {},
			"comment": [],
			"follow": []
		}

	getData: (site, cb) ->
		Page.cmd "fileGet", [@getPath(site)+"/data.json", false], (data) =>
			data = JSON.parse(data)
			data ?= {
				"next_comment_id": 1,
				"user_name": @row?.user_name,
				"hub": @hub,
				"post_like": {},
				"comment": []
			}
			cb(data)

	renderAvatar: (attrs={}) =>
		if @isSeeding() and (@row.avatar == "png" or @row.avatar == "jpg")
			attrs.style = "background-image: url('#{@getAvatarLink()}')"
			h("a.avatar", attrs)
		else
			attrs.style = "background: linear-gradient("+Text.toColor(@auth_address)+","+Text.toColor(@auth_address.slice(-5))+")"
			attrs.src="img/user-shape.png"
			h("img.avatar",attrs)

	renderBackground: (attrs={}) =>
		if @isSeeding() and (@row.bg == "png" or @row.bg == "jpg")
			attrs.src="#{@getBackgroundLink()}"
		attrs.style = "background: #AFAFAF;width:160px;min-height:75px;"

		h("img.bg-preview", attrs)

	applyBackground: (cb) =>
		if Page.getSetting "disable_background"
			window.stripBackground()
		else if (if Page.user and Page.user.getLink then Page?.user?.getLink() != @getLink() else false) and Page.getSetting "load_others_background_disabled"
			window.defaultBackground()
		else
			if @row.bg and not @row.bgColor
				@row.bgUnset=true
			if @row.bgColor or @row.bgUnset
				if @isSeeding() and (@row.bg == "png" or @row.bg == "jpg")
					window.setBackground @getBackground(),@getBackgroundLink()
				else if @row.bgColor
					window.setBackground @getBackground()
				else if @row.bgUnset
					window.defaultBackground()
				if cb
					cb()
			else
				console.trace "Loading background async, should not happen"
				@getData @hub, (row) =>
					@row?={}
					@row.bg=row.bg
					@row.bgColor=row.bgColor
					if not row.bgColor
						@row.bgUnset=true
					@applyBackground(cb)



	save: (data, site=@hub, cb=null) ->
		Page.cmd "fileWrite", [@getPath(site)+"/data.json", Text.fileEncode(data)], (res_write) =>
			if Page.server_info.rev > 1400
				# Accidently left an unwanted modification in rev1400 fix
				Page.content.update()
			cb?(res_write)
			Page.cmd "sitePublish", {"inner_path": @getPath(site)+"/data.json"}, (res_sign) =>
				@log "Save result", res_write, res_sign
				if site == @hub and res_write == "ok" and res_sign == "ok"
					@saveUserdb(data)

	saveUserdb: (data, cb) =>
		cert_provider = Page.site_info.cert_user_id.replace(/.*@/, "")
		if cert_provider not in ["zeroid.bit", "zeroverse.bit"]
			@log "Cert provider #{cert_provider} not supported by userdb!"
			cb(false)
			return false
		Page.cmd "fileGet", [@getPath(Page.userdb)+"/content.json", false], (userdb_data) =>
			userdb_data = JSON.parse(userdb_data)
			changed = false
			if not userdb_data?.user
				userdb_data = {
					user: [{date_added: Time.timestamp()}]
				}
				changed = true
			for field in ["avatar", "hub", "intro", "user_name", "bg", "bgColor"]
				if userdb_data.user[0][field] != data[field]
					changed = true
					@log "Changed in profile:", field, userdb_data.user[0][field], "!=", data[field]
				userdb_data.user[0][field] = data[field]

			if changed
				Page.cmd "fileWrite", [@getPath(Page.userdb)+"/content.json", Text.fileEncode(userdb_data)], (res_write) =>
					Page.cmd "sitePublish", {"inner_path": @getPath(Page.userdb)+"/content.json"}, (res_sign) =>
						@log "Userdb save result", res_write, res_sign
						cb?(res_sign)

	like: (site, post_uri, cb=null) ->
		@log "Like", site, post_uri
		@likes[post_uri] = true

		@getData site, (data) =>
			data.post_like[post_uri] = Time.timestamp()
			@save data, site, (res) =>
				if cb then cb(res)

	dislike: (site, post_uri, cb=null) ->
		@log "Dislike", site, post_uri
		delete @likes[post_uri]

		@getData site, (data) =>
			delete data.post_like[post_uri]
			@save data, site, (res) =>
				if cb then cb(res)

	comment: (site, post_uri, body, cb=null) ->
		@getData site, (data) =>
			data.comment.push {
				"comment_id": data.next_comment_id,
				"body": body,
				"post_uri": post_uri,
				"date_added": Time.timestamp()
			}
			data.next_comment_id += 1
			@save data, site, (res) =>
				if cb then cb(res)

	# Add optional pattern to user's content.json
	checkContentJson: (cb=null) ->
		Page.cmd "fileGet", [@getPath(@hub)+"/content.json", false], (res) =>
			content_json = JSON.parse(res)
			if content_json.optional
				return cb(true)

			content_json.optional = "(?!avatar).*jpg"
			Page.cmd "fileWrite", [@getPath(@hub)+"/content.json", Text.fileEncode(content_json)], (res_write) =>
				cb(res_write)

	fileWrite: (file_name, content_base64, cb=null) ->
		if not content_base64
			return cb?(null)

		@checkContentJson =>
			Page.cmd "fileWrite", [@getPath(@hub)+"/"+file_name, content_base64], (res_write) =>
				cb?(res_write)

	post: (body, meta=null, image_base64=null, cb=null) ->
		@getData @hub, (data) =>
			post = {
				"post_id": Time.timestamp() + data.next_post_id,
				"body": body,
				"date_added": Time.timestamp()
			}
			if meta
				post["meta"] = Text.jsonEncode(meta)
			data.post.push post
			data.next_post_id += 1
			@fileWrite post.post_id+".jpg", image_base64, (res) =>
				@save data, @hub, (res) =>
					if cb then cb(res)

	followUser: (hub, auth_address, user_name, cb=null) ->
		@log "Following", hub, auth_address
		@download()

		@getData @hub, (data) =>
			follow_row = {
				"follow_id": data.next_follow_id,
				"hub": hub,
				"auth_address": auth_address,
				"user_name": user_name,
				"date_added": Time.timestamp()
			}
			data.follow.push follow_row
			@followed_users[hub+"/"+auth_address] = true
			data.next_follow_id += 1
			@save data, @hub, (res) =>
				if cb then cb(res)

			Page.needSite hub  # Download followed user's site if necessary

	unfollowUser: (hub, auth_address, cb=null) ->
		@log "UnFollowing", hub, auth_address
		delete @followed_users[hub+"/"+auth_address]

		@getData @hub, (data) =>
			follow_index = i for follow, i in data.follow when follow.hub == hub and follow.auth_address == auth_address
			data.follow.splice(follow_index, 1)
			@save data, @hub, (res) =>
				if cb then cb(res)

	handleFollowClick: (e) =>
		@submitting_follow = true
		if not @isFollowed()
			Animation.flashIn(e.target)
			Page.user.followUser @hub, @auth_address, @row.user_name, (res) =>
				@submitting_follow = false
				Page.projector.scheduleRender()
		else
			Animation.flashOut(e.target)
			Page.user.unfollowUser @hub, @auth_address, (res) =>
				@submitting_follow = false
				Page.projector.scheduleRender()
		return false

	download: =>
		if not Page.merged_sites[@hub]
			Page.cmd "mergerSiteAdd", @hub, =>
				Page.updateSiteInfo()

	handleDownloadClick: (e) =>
		@download()
		return false

	handleMuteClick: (e) =>
		if Page.server_info.rev < 1880
			Page.cmd "wrapperNotification", ["info", "You need ZeroNet 0.5.2 to use this feature."]
			return false
		Page.cmd "muteAdd", [@auth_address, @row.cert_user_id, "Muted from [page](http://127.0.0.1:43110/#{Page.address}/?#{Page.history_state.url})"]
		return false

	renderCleanIntro: ->
		text=window.stripMarkdown @row.intro
		text=text.split("\n")
		text=text.filter (a) => !!a.trim() #clear empty lines
		if not text.length
			return '…' #TODO: put in a good placeholder
		return text[0]

	renderList: (type="normal") =>
		classname = ""
		if type == "card" then classname = ".card"
		link = @getLink()
		followed = @isFollowed()
		seeding = @isSeeding()
		if followed then title = "Unfollow" else title = "Follow"
		if type != "card"
			enterAnimation = Animation.slideDown
			exitAnimation = Animation.slideUp
		else
			enterAnimation = null
			exitAnimation = null
		h("div.user"+classname, {key: @hub+"/"+@auth_address, classes: {followed: followed, notseeding: !seeding}, enterAnimation: enterAnimation, exitAnimation: exitAnimation}, [
			h("a.button.button-follow", {href: link, onclick: @handleFollowClick, title: title, classes: {loading: @submitting_follow}}, "+"),
			h("a", {href: link, onclick: Page.handleLinkClick}, @renderAvatar()),
			h("div.nameline", [
				h("a.name.link", {href: link, onclick: Page.handleLinkClick}, @row.user_name),
				if type == "card" then h("span.added", Time.since(@row.date_added))
			])
			if @row.followed_by
				h("div.intro.followedby", [
					"Followed by ",
					h("a.name.link", {href: "?ProfileName/#{@row.followed_by}", onclick: Page.handleLinkClick}, @row.followed_by)
				])
			else
				h("div.intro", @renderCleanIntro())
		])


window.User = User
