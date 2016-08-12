class Post extends Class
	constructor: (row, @item_list) ->
		@liked = false
		@commenting = false
		@submitting_like = false
		@owned = false
		@editable_comments = {}
		@field_comment = new Autosize({placeholder: "Add your comment", onsubmit: @handleCommentSubmit})
		@comment_limit = 3
		@setRow(row)

	setRow: (row) ->
		@row = row
		if Page.user
			@liked = Page.user.likes[@row.key]
		@user = new User({hub: row.site, auth_address: row.directory.replace("data/users/", "")})
		@user.row = row
		@owned = @user.auth_address == Page.user?.auth_address
		if @owned
			@editable_body = new Editable("div.body", @handlePostSave, @handlePostDelete)
			@editable_body.render_function = Text.renderMarked

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
			Page.user.save data, Page.user.hub, (res) =>
				cb(res)

	handleLikeClick: (e) =>
		@submitting_like = true
		[site, post_uri] = @row.key.split("-")
		if Page.user.likes[post_uri]
			Animation.flashOut(e.currentTarget.firstChild)
			Page.user.dislike site, post_uri, =>
				@submitting_like = false
		else
			Animation.flashIn(e.currentTarget.firstChild)
			Page.user.like site, post_uri, =>
				@submitting_like = false
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
			@editable_comments[comment_uri].render_function = Text.renderLinks

		return @editable_comments[comment_uri]


	renderComments: =>
		if not @row.comments and not @commenting
			return []
		h("div.comment-list", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp, animate_noscale: true}, [
			if @commenting then h("div.comment-create", {enterAnimation: Animation.slideDown},
				@field_comment.render()
			),
			@row.comments?[0..@comment_limit-1].map (comment) =>
				user_address = comment.directory.replace("data/users/", "")
				comment_uri = user_address+"_"+comment.comment_id
				owned = user_address == Page.user?.auth_address
				user_link = "?Profile/"+comment.hub+"/"+user_address+"/"+comment.cert_user_id
				h("div.comment", {id: comment_uri, key: comment_uri, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
					h("div.user", [
						h("a.name.link", {href: user_link, style: "color: #{Text.toColor(user_address)}", onclick: Page.handleLinkClick}, comment.user_name),
						h("span.sep", " \u00B7 "),
						h("span.address", {title: user_address}, comment.cert_user_id),
						h("span.sep", " \u2015 "),
						h("a.added.link", {href: "#", title: Time.date(comment.date_added, "long")}, Time.since(comment.date_added)),
						h("a.icon.icon-reply", {href: "#Reply", onclick: @handleReplyClick, user_name: comment.user_name}, "Reply")
					])
					if owned
						@getEditableComment(comment_uri).render(comment.body)
					else
						h("div.body", {innerHTML: Text.renderLinks(comment.body) })
				])
			if @row.comments?.length > @comment_limit
				h("a.more", {href: "#More", onclick: @handleMoreCommentsClick, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, "Show more comments...")
		])

	render: =>
		[site, post_uri] = @row.key.split("-")
		h("div.post", {key: @row.key, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
			h("div.user", [
				@user.renderAvatar({href: @user.getLink(), onclick: Page.handleLinkClick}),
				h("a.name.link", {href: @user.getLink(), onclick: Page.handleLinkClick, style: "color: #{Text.toColor(@user.auth_address)}"},
					@row.user_name
				),
				h("span.sep", " \u00B7 "),
				h("span.address", {title: @user.auth_address}, @row.cert_user_id),
				h("span.sep", " \u2015 "),
				h("a.added.link", {href: "?Post:#{@row.key}", title: Time.date(@row.date_added, "long")}, Time.since(@row.date_added)),
			])
			if @owned
				@editable_body.render(@row.body)
			else
				h("div.body", {innerHTML: Text.renderMarked(@row.body)})
			h("div.actions", [
				h("a.icon.icon-comment.link", {href: "#Comment", onclick: @handleCommentClick}, "Comment"),
				h("a.like.link", {classes: {active: Page.user?.likes[post_uri], loading: @submitting_like, "like-zero": @row.likes == 0}, href: "#Like", onclick: @handleLikeClick},
					h("div.icon.icon-heart", {classes: {active: Page.user?.likes[post_uri]}}),
					if @row.likes then @row.likes
				)
				# h("a.icon.icon-share.link", {href: "#Share"}, "Share"),
			]),
			@renderComments()
		])

window.Post = Post