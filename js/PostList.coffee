class PostList extends Class
	constructor: ->
		@item_list = new ItemList(Post, "key")
		@posts = @item_list.items
		@need_update = true
		@directories = []
		@loaded = false

	queryComments: (post_uris, cb) =>
		query = "
			SELECT
			 post_uri, comment.body, comment.date_added, comment.comment_id, json.cert_auth_type, json.cert_user_id, json.user_name, json.hub, json.directory, json.site
			FROM
			 comment
			LEFT JOIN json USING (json_id)
			WHERE
			 ?
			ORDER BY date_added DESC
		"
		return Page.cmd "dbQuery", [query, {post_uri: post_uris}], cb

	update: =>
		@log "Updating"
		@need_update = false
		query = "
			SELECT
			 (SELECT COUNT(*) FROM post_like WHERE 'data/users/' || post_uri =  directory || '_' || post_id) AS likes,
			 *
			FROM
			 json
			LEFT JOIN post ON (post.json_id = json.json_id)
			WHERE ? AND post_id IS NOT NULL
			ORDER BY date_added DESC
			LIMIT 30
		"

		Page.cmd "dbQuery", [query, {"directory": @directories}], (rows) =>
			items = []
			post_uris = []
			for row in rows
				row["key"] = row["site"]+"-"+row["directory"].replace("data/users/", "")+"_"+row["post_id"]
				row["post_uri"] = row["directory"].replace("data/users/", "") + "_" + row["post_id"]
				post_uris.push(row["post_uri"])

			# Get comments for latest posts
			@queryComments post_uris, (comment_rows) =>
				comment_db = {}  # {Post id: posts}
				for comment_row in comment_rows
					comment_db[comment_row.site+"/"+comment_row.post_uri] ?= []
					comment_db[comment_row.site+"/"+comment_row.post_uri].push(comment_row)
				for row in rows
					row["comments"] = comment_db[row.site+"/"+row.post_uri]
				@item_list.sync(rows)
				@loaded = true
				Page.projector.scheduleRender()

	render: =>
		if @need_update then @update()
		if not @posts.length
			if not @loaded
				return null
			else
				return h("div.post-list", [
					h("div.post-list-empty", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
						h("h2", "No posts yet"),
						h("a", {href: "?Users", onclick: Page.handleLinkClick}, "Let's follow some users!")
					])
				])
		h("div.post-list", @posts.map (post) =>
			try
				post.render()
			catch err
				h("div.error", ["Post render error:", err.message])
				Debug.formatException(err)
		)

window.PostList = PostList
