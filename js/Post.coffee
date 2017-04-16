class Post extends Class
	constructor: (row, @item_list) ->
		@liked = false
		@commenting = false
		@submitting_like = false
		@owned = false
		@editable_comments = {}
		@field_comment = new Autosize({placeholder: "Add your comment", onsubmit: @handleCommentSubmit})
		@comment_limit = 3
		@menu = null
		@meta = null
		@css_style = ""
		@setRow(row)

	setRow: (row) ->
		@row = row
		if @row.meta
			@meta = new PostMeta(@, JSON.parse(@row.meta))
		if Page.user
			@liked = Page.user.likes[@row.key]
		@user = new User({hub: row.site, auth_address: row.directory.replace("data/users/", "")})
		@user.row = row
		@owned = @user.auth_address == Page.user?.auth_address
		if @owned
			@editable_body = new Editable("div.body", @handlePostSave, @handlePostDelete)
			@editable_body.render_function = Text.renderMarked
			@editable_body.empty_text = " "

	getLink: ->
		"?Post/#{@user.hub}/#{@user.auth_address}/#{@row.post_id}"

	handlePostSave: (body, cb) =>
		Page.user.getData Page.user.hub, (data) =>
			post_index = i for post, i in data.post when post.post_id == @row.post_id
			data.post[post_index].body = body
			Page.user.save data, Page.user.hub, (res) =>
				cb(res)

	handlePostDelete: (cb) =>
		Page.user.getData Page.user.hub, (data) =>
			post_index = i for post, i in data.post when post.post_id == @row.post_id
			data.post.splice(post_index, 1)
			if @meta?.meta?.img
				Page.cmd "fileDelete", "#{@user.getPath()}/#{@row.post_id}.jpg", =>
					Page.user.save data, Page.user.hub, (res) =>
						cb(res)
			else
				Page.user.save data, Page.user.hub, (res) =>
					cb(res)

	handleLikeClick: (e) =>
		@submitting_like = true
		[site, post_uri] = @row.key.split("-")
		if Page.user.likes[post_uri]
			Animation.flashOut(e.currentTarget.firstChild)
			Page.user.dislike site, post_uri, =>
				@submitting_like = false
				@unfollow()
		else
			Animation.flashIn(e.currentTarget.firstChild)
			Page.user.like site, post_uri, =>
				@submitting_like = false
				@follow()
		return false

	handleCommentClick: =>
		if @field_comment.node
			@field_comment.node.focus()
		else
			@commenting = true
			setTimeout ( =>
				@field_comment.node.focus()
			), 600
		return false

	handleCommentSubmit: =>
		timer_loading = setTimeout ( => @field_comment.loading = true ), 100  # Only add loading message if takes more than 100ms
		[site, post_uri] = @row.key.split("-")
		Page.user.comment site, post_uri, @field_comment.attrs.value, (res) =>
			clearInterval(timer_loading)
			@field_comment.loading = false
			if res
				@field_comment.setValue("")
			@follow()

	handleCommentSave: (comment_id, body, cb) =>
		Page.user.getData @row.site, (data) =>
			comment_index = i for comment, i in data.comment when comment.comment_id == comment_id
			data.comment[comment_index].body = body
			Page.user.save data, @row.site, (res) =>
				cb(res)

	handleCommentDelete: (comment_id, cb) =>
		Page.user.getData @row.site, (data) =>
			comment_index = i for comment, i in data.comment when comment.comment_id == comment_id
			data.comment.splice(comment_index, 1)
			Page.user.save data, @row.site, (res) =>
				cb(res)
				@unfollow()

	handleMoreCommentsClick: =>
		@comment_limit += 10
		return false

	handleReplyClick: (e) =>
		user_name = e.currentTarget.attributes.user_name.value
		if @field_comment.attrs.value
			@field_comment.setValue("#{@field_comment.attrs.value}\n@#{user_name}: ")
		else
			@field_comment.setValue("@#{user_name}: ")
		@handleCommentClick(e)
		return false

	getEditableComment: (comment_uri) ->
		if not @editable_comments[comment_uri]
			[user_address, comment_id] = comment_uri.split("_")

			handleCommentSave = (body, cb) =>
				@handleCommentSave(parseInt(comment_id), body, cb)

			handleCommentDelete = (cb) =>
				@handleCommentDelete(parseInt(comment_id), cb)

			@editable_comments[comment_uri] = new Editable("div.body", handleCommentSave, handleCommentDelete)
			@editable_comments[comment_uri].render_function = Text.renderMarked

		return @editable_comments[comment_uri]

	getPostUri: =>
		return "#{@user.auth_address}_#{@row.post_id}"

	handleSettingsClick: =>
		@css_style = "z-index: #{@row.date_added}; position: relative"
		Page.cmd "feedListFollow", [], (follows) =>
			if not @menu
				@menu = new Menu()
			followed = follows["Post follow"] and @getPostUri() in follows["Post follow"][1]
			@menu.items = []
			@menu.items.push [(if followed then "Unfollow" else "Follow")+" post in newsfeed", ( => if followed then @unfollow() else @follow() ), followed]
			if not @owned
				@menu.items.push ["Mute user", @user.handleMuteClick]
			@menu.items.push ["Permalink", @getLink()]
			@menu.toggle()
		return false

	unfollow: =>
		Page.cmd "feedListFollow", [], (follows) =>
			if not follows["Post follow"]
				return
			followed_uris = follows["Post follow"][1]

			index = followed_uris.indexOf @getPostUri()
			if index == -1
				return

			followed_uris.splice(index, 1)
			if followed_uris.length == 0
				delete follows["Post follow"]
			@log "Unfollow", follows
			Page.cmd "feedFollow", [follows]

	follow: =>
		Page.cmd "feedListFollow", [], (follows) =>
			if not follows["Post follow"]
				follows["Post follow"] = ["""
					SELECT
					 "comment" AS type,
					 comment.date_added AS date_added,
					 "a followed post" AS title,
					 '@' || user_name || ': ' || comment.body AS body,
					 '?Post/' || json.site || '/' || REPLACE(post_uri, '_', '/') AS url
					FROM comment
					LEFT JOIN json USING (json_id)
					WHERE post_uri IN (:params)
				""", []]
			followed_uris = follows["Post follow"][1]
			followed_uris.push @getPostUri()
			Page.cmd "feedFollow", [follows]

	renderComments: =>
		if not @row.comments and not @commenting
			return []
		if @row.selected
			comment_limit = @comment_limit + 50
		else
			comment_limit = @comment_limit
		h("div.comment-list", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp, animate_scrollfix: true, animate_noscale: true}, [
			if @commenting then h("div.comment-create", {enterAnimation: Animation.slideDown},
				@field_comment.render()
			),
			@row.comments?[0..comment_limit-1].map (comment) =>
				user_address = comment.directory.replace("data/users/", "")
				comment_uri = user_address+"_"+comment.comment_id
				owned = user_address == Page.user?.auth_address
				user_link = "?Profile/"+comment.hub+"/"+user_address+"/"+comment.cert_user_id
				h("div.comment", {id: comment_uri, key: comment_uri, animate_scrollfix: true, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
					h("div.user", [
						h("a.name.link", {href: user_link, style: "color: #{Text.toColor(user_address)}", onclick: Page.handleLinkClick}, comment.user_name),
						h("span.sep", " \u00B7 "),
						h("span.address", {title: user_address}, comment.cert_user_id),
						h("span.sep", " \u2015 "),
						h("a.added.link", {href: @getLink(), title: Time.date(comment.date_added, "long")}, Time.since(comment.date_added)),
						h("a.icon.icon-reply", {href: "#Reply", onclick: @handleReplyClick, user_name: comment.user_name}, "Reply")
					])
					if owned
						@getEditableComment(comment_uri).render(comment.body)
					else if comment.body?.length > 5000
						h("div.body.maxheight", {innerHTML: Text.renderMarked(comment.body), afterCreate: Maxheight.apply})
					else
						h("div.body", {innerHTML: Text.renderMarked(comment.body) })
				])
			if @row.comments?.length > comment_limit
				h("a.more", {href: "#More", onclick: @handleMoreCommentsClick, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, "Show more comments...")
		])

	render: =>
		[site, post_uri] = @row.key.split("-")
		h("div.post", {key: @row.key, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp, animate_scrollfix: true, classes: {selected: @row.selected}, style: @css_style}, [
			h("div.user", [
				@user.renderAvatar({href: @user.getLink(), onclick: Page.handleLinkClick}),
				h("a.name.link", {href: @user.getLink(), onclick: Page.handleLinkClick, style: "color: #{Text.toColor(@user.auth_address)}"},
					@row.user_name
				),
				h("span.sep", " \u00B7 "),
				h("span.address", {title: @user.auth_address}, @row.cert_user_id),
				h("span.sep", " \u2015 "),
				h("a.added.link", {href: @getLink(), title: Time.date(@row.date_added, "long"), onclick: Page.handleLinkClick}, Time.since(@row.date_added)),
				if @menu then @menu.render(".menu-right"),
				h("a.settings", {href: "#Settings", title: "Options for this post", onclick: Page.returnFalse, onmousedown: @handleSettingsClick}, "\u22EE")
			])
			if @owned
				@editable_body.render(@row.body)
			else
				h("div.body", {classes: {maxheight: not @row.selected and @row.body?.length > 3000}, innerHTML: Text.renderMarked(@row.body), afterCreate: Maxheight.apply, afterUpdate: Maxheight.apply})
			if @meta
				@meta.render()
			h("div.actions", [
				h("a.icon.link", {href: "#Comment", title: "What do you think?", onclick: @handleCommentClick}, h("i.fa.fa-comment.icon-comment"), "Comment"),
				h("a.icon.link", {classes: {active: Page.user?.likes[post_uri], loading: @submitting_like, "like-zero": @row.likes == 0}, href: "#Like", title: "Like", onclick: @handleLikeClick},
					h("div"+(if Page.getSetting "gimme_stars" then ".fa.fa-star.icon-star" else ".fa.fa-heart.icon-heart"), {classes: {active: Page.user?.likes[post_uri]}}),
					if @row.likes then @row.likes
				)
				# h("a.icon.icon-share.link", {href: "#Share"}, "Share"),
			]),
			@renderComments()
		])

window.Post = Post
