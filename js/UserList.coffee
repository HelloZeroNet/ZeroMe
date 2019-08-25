class UserList extends Class
	constructor: (@type="new") ->
		@item_list = new ItemList(User, "key")
		@users = @item_list.items
		@need_update = true
		@limit = 5
		@followed_by = null
		@search = null

	update: ->
		@loading = true
		params = {}
		if @search
			search_where = "AND (json.user_name LIKE :search_like OR user.user_name LIKE :search_like OR json.cert_user_id LIKE :search_like)"
			params["search_like"] = "%#{@search}%"
		else
			search_where = ""
		if @followed_by
			query = """
				SELECT user.user_name, follow.*, user.*
				FROM follow
				LEFT JOIN user USING (auth_address, hub)
				WHERE
				 follow.json_id = #{@followed_by.row.json_id}  AND user.json_id IS NOT NULL

				UNION

				SELECT user.user_name, follow.*, user.*
				FROM follow
				LEFT JOIN json ON (json.directory = 'data/userdb/' || follow.auth_address)
				LEFT JOIN user ON (user.json_id = json.json_id)
				WHERE
				 follow.json_id = #{@followed_by.row.json_id}  AND user.json_id IS NOT NULL AND
				 follow.date_added < #{Time.timestamp()+120}
				ORDER BY date_added DESC
				LIMIT #{@limit}
			"""
		else if @type == "suggested"
			followed_user_addresses = (key.replace(/.*\//, "") for key, val of Page.user.followed_users)
			followed_user_directories = ("data/users/"+key for key in followed_user_addresses)
			if not followed_user_addresses.length
				return
			query = """
				SELECT
				 COUNT(DISTINCT(json.directory)) AS num,
				 GROUP_CONCAT(DISTINCT(json.user_name)) AS followed_by,
				 follow.*,
				 json_suggested.avatar
				FROM follow
				 LEFT JOIN json USING (json_id)
				 LEFT JOIN json AS json_suggested ON (json_suggested.directory = 'data/users/' || follow.auth_address AND json_suggested.avatar IS NOT NULL)
				WHERE
				 json.directory IN #{Text.sqlIn(followed_user_directories)} AND
				 auth_address NOT IN #{Text.sqlIn(followed_user_addresses)} AND
				 auth_address != '#{Page.user.auth_address}' AND
				 date_added < #{Time.timestamp()+120}
				GROUP BY follow.auth_address
				ORDER BY num DESC
				LIMIT #{@limit}
			"""
		else if @type == "active"
			query = """
				SELECT
				 json.*,
				 json.site AS json_site,
				 json.directory AS json_directory,
				 json.file_name AS json_file_name,
				 json.cert_user_id AS json_cert_user_id,
				 json.hub AS json_hub,
				 json.user_name AS json_user_name,
				 json.avatar AS json_avatar,
				 COUNT(*) AS posts
				FROM
				 post LEFT JOIN json USING (json_id)
				WHERE
				 post.date_added > #{Time.timestamp() - 60*60*24*7}
				GROUP BY json_id
				ORDER BY posts DESC
				LIMIT #{@limit}
			"""
		else
			query = """
				SELECT
				 user.*,
				 json.site AS json_site,
				 json.directory AS json_directory,
				 json.file_name AS json_file_name,
				 json.cert_user_id AS json_cert_user_id,
				 json.hub AS json_hub,
				 json.user_name AS json_user_name,
				 json.avatar AS json_avatar
				FROM
				 user LEFT JOIN json USING (json_id)
				WHERE
				 date_added < #{Time.timestamp()+120}
				 #{search_where}
				ORDER BY date_added DESC
				LIMIT #{@limit}
			"""
		Page.cmd "dbQuery", [query, params], (rows) =>
			rows_by_user = {}  # Deduplicating
			followed_by_displayed = {}
			for row in rows
				if row.json_cert_user_id  # File in user directory
					row.cert_user_id = row.json_cert_user_id
					row.auth_address = row.json_directory.replace("data/userdb/", "").replace("data/users/", "")

				if not row.auth_address  # Just created user, no content.json yet
					continue

				if row.followed_by

					row.followed_by = (username for username in row.followed_by.split(",") when not followed_by_displayed[username])[0]
					followed_by_displayed[row.followed_by] = true  # Only display every user once

				row.key = row.hub+"/"+row.auth_address
				if not rows_by_user[row.hub+row.auth_address]
					rows_by_user[row.hub+row.auth_address] = row

			user_rows = (val for key, val of rows_by_user)
			@item_list.sync(user_rows)

			@loading = false
			Page.projector.scheduleRender()

	render: (type="normal") =>
		if @need_update
			@need_update = false
			setTimeout ( => @update() ), 100  # Low prioriy
		if not @users.length
			return null

		h("div.UserList.users"+type+"."+@type, {afterCreate: Animation.show}, @users.map (user) =>
			user.renderList(type)
		)

window.UserList = UserList
