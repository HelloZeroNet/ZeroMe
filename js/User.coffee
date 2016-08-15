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
		Page.cmd "dbQuery", ["SELECT * FROM post_like WHERE json_id = #{@row.json_id}"], (res) =>
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

	getPath: (site=@hub) ->
		if site == Page.userdb
			return "merged-ZeroMe/#{site}/data/userdb/#{@auth_address}"
		else
			return "merged-ZeroMe/#{site}/data/users/#{@auth_address}"

	getLink: ->
		return "?Profile/#{@hub}/#{@auth_address}/#{@row.cert_user_id}"

	getAvatarLink: ->
		cache_invalidation = ""
		# Cache invalidation for local user
		if @auth_address == Page.user?.auth_address
			cache_invalidation = "?"+Page.cache_time
		return "merged-ZeroMe/#{@hub}/data/users/#{@auth_address}/avatar.#{@row.avatar}#{cache_invalidation}"

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
		else
			attrs.style = "background: linear-gradient("+Text.toColor(@auth_address)+","+Text.toColor(@auth_address.slice(-5))+")"
		h("a.avatar", attrs)

	saveUserdb: (data, cb=null) ->
		Page.cmd "fileWrite", [@getPath(Page.userdb)+"/content.json", Text.fileEncode(data)], (res_write) =>
			Page.cmd "sitePublish", {"inner_path": @getPath(Page.userdb)+"/content.json"}, (res_sign) =>
				@log "Userdb save result", res_write, res_sign
				cb?(res_sign)

	save: (data, site=@hub, cb=null) ->
		Page.cmd "fileWrite", [@getPath(site)+"/data.json", Text.fileEncode(data)], (res_write) =>
			if Page.server_info.rev > 1400
				# Accidently left an unwanted modification in rev1400 fix
				Page.content.update()
			cb?(res_write)
			Page.cmd "sitePublish", {"inner_path": @getPath(site)+"/data.json"}, (res_sign) =>
				@log "Save result", res_write, res_sign

		# Update userdb
		if site == @hub
			Page.cmd "fileGet", [@getPath(Page.userdb)+"/content.json", false], (userdb_data) =>
				userdb_data = JSON.parse(userdb_data)
				changed = false
				if not userdb_data?.user
					userdb_data = {
						user: [{date_added: Time.timestamp()}]
					}
					changed = true
				for field in ["avatar", "hub", "intro", "user_name"]
					if userdb_data.user[0][field] != data[field]
						changed = true
						@log "Changed in profile:", field
					userdb_data.user[0][field] = data[field]

				if changed
					@saveUserdb(userdb_data)


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

	post: (body, cb=null) ->
		@getData @hub, (data) =>
			data.post.push {
				"post_id": data.next_post_id,
				"body": body,
				"date_added": Time.timestamp()
			}
			data.next_post_id += 1
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

	renderList: (type="normal") =>
		classname = ""
		if type == "card" then classname = ".card"
		link = @getLink()
		followed = @isFollowed()
		seeding = @isSeeding()
		if followed then title = "Unfollow" else title = "Follow"
		h("div.user"+classname, {key: @hub+"/"+@auth_address, classes: {followed: followed, notseeding: !seeding}, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
			h("a.button.button-follow", {href: link, onclick: @handleFollowClick, title: title, classes: {loading: @submitting_follow}}, "+"),
			h("a", {href: link, onclick: Page.handleLinkClick}, @renderAvatar()),
			h("div.nameline", [
				h("a.name.link", {href: link, onclick: Page.handleLinkClick}, @row.user_name),
				if type == "card" then h("span.added", Time.since(@row.date_added))
			])
			h("div.intro", @row.intro)
		])


window.User = User