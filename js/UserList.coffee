class UserList extends Class
	constructor: (@type="recent") ->
		@item_list = new ItemList(User, "key")
		@users = @item_list.items
		@need_update = true
		@limit = 5
		@followed_by = null

	update: ->
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
				 follow.json_id = #{@followed_by.row.json_id}  AND user.json_id IS NOT NULL

				ORDER BY date_added DESC
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
				ORDER BY date_added DESC
				LIMIT #{@limit}
			"""
		Page.cmd "dbQuery", query, (rows) =>
			rows_by_user = {}  # Deduplicating
			for row in rows
				if row.json_cert_user_id  # File in user directory
					row.cert_user_id = row.json_cert_user_id
					row.auth_address = row.json_directory.replace("data/userdb/", "")
				if not row.auth_address  # Just created user, no content.json yet
					continue
				row.key = row.hub+"/"+row.auth_address
				if not rows_by_user[row.hub+row.auth_address]
					rows_by_user[row.hub+row.auth_address] = row
			user_rows = (val for key, val of rows_by_user)
			@item_list.sync(user_rows)
			Page.projector.scheduleRender()

	render: (type="normal") =>
		if @need_update
			@need_update = false
			setTimeout ( => @update() ), 100  # Low prioriy
		if not @users.length
			return null

		h("div.UserList.users"+type, {afterCreate: Animation.show}, @users.map (user) =>
			user.renderList(type)
		)

window.UserList = UserList
