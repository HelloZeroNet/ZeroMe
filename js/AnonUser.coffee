class AnonUser extends Class
	constructor: ->
		@auth_address = null
		@hub = null
		@followed_users = {}
		@likes = {}

	updateInfo: (cb=null) =>
		Page.on_local_storage.then =>
			@followed_users = Page.local_storage.followed_users
			cb?(true)

	like: (site, post_uri, cb=null) ->
		Page.cmd "wrapperNotification", ["info", "You need a profile for this feature"]
		cb(true)

	dislike: (site, post_uri, cb=null) ->
		Page.cmd "wrapperNotification", ["info", "You need a profile for this feature"]
		cb(true)

	followUser: (hub, auth_address, user_name, cb=null) ->
		@followed_users[hub+"/"+auth_address] = true
		@save cb
		Page.needSite hub  # Download followed user's site if necessary
		Page.content.update()

	unfollowUser: (hub, auth_address, cb=null) ->
		delete @followed_users[hub+"/"+auth_address]
		@save cb
		Page.content.update()

	comment: (site, post_uri, body, cb=null) ->
		Page.cmd "wrapperNotification", ["info", "You need a profile for this feature"]
		cb?(false)

	save: (cb=null) =>
		Page.saveLocalStorage cb


window.AnonUser = AnonUser