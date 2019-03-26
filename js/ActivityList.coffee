class ActivityList extends Class
	constructor: ->
		@activities = null
		@directories = []
		@need_update = true
		@limit = 10
		@found = 0
		@loading = true
		@update_timer = null

	queryActivities: (cb) ->
		if @directories == "all"
			where = "WHERE date_added > #{Time.timestamp()-60*60*24*2} AND date_added < #{Time.timestamp()+120} "
		else
			where = "WHERE json.directory IN #{Text.sqlIn(@directories)} AND date_added < #{Time.timestamp()+120} "

		query = """
			SELECT
			 'comment' AS type, json.*,
			 json.site || "/" || post_uri AS subject, body, date_added,
			 NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name
			FROM
			 json
			LEFT JOIN comment USING (json_id)
			 #{where}

			UNION ALL

			SELECT
			 'post_like' AS type, json.*,
			 json.site || "/" || post_uri AS subject, '' AS body, date_added,
			 NULL AS subject_auth_address, NULL AS subject_hub, NULL AS subject_user_name
			FROM
			 json
			LEFT JOIN post_like USING (json_id)
			 #{where}
		"""

		if @directories != "all"  # Dont show follows in all users activity feed
			query += """
				UNION ALL

				SELECT
				 'follow' AS type, json.*,
				 follow.hub || "/" || follow.auth_address AS subject, '' AS body, date_added,
				 follow.auth_address AS subject_auth_address, follow.hub AS subject_hub, follow.user_name AS subject_user_name
				FROM
				 json
				LEFT JOIN follow USING (json_id)
				 #{where}
			"""

		query += """

			ORDER BY date_added DESC
			LIMIT #{@limit+1}
		"""
		@logStart("Update")

		Page.cmd "dbQuery", [query, {directories: @directories}], (rows) =>
			# Resolve subject's name
			directories = []
			rows = (row for row in rows when row.subject)  # Remove deleted users activities
			for row in rows
				row.auth_address = row.directory.replace("data/users/", "")
				subject_address = row.subject.replace(/_.*/, "").replace(/.*\//, "")  # Only keep user's address
				row.post_id = row.subject.replace(/.*_/, "").replace(/.*\//, "")
				row.subject_address = subject_address
				directory = "data/users/#{subject_address}"
				if directory not in directories
					directories.push directory

			Page.cmd "dbQuery", ["SELECT * FROM json WHERE ?", {directory: directories}], (subject_rows) =>
				# Add subject node to rows
				subject_db = {}
				for subject_row in subject_rows
					subject_row.auth_address = subject_row.directory.replace("data/users/", "")
					subject_db[subject_row.auth_address] = subject_row
				for row in rows
					row.subject = subject_db[row.subject_address]
					row.subject ?= {}
					row.subject.auth_address ?= row.subject_auth_address
					row.subject.hub ?= row.subject_hub
					row.subject.user_name ?= row.subject_user_name

				# Merge same activities from same user to one line
				last_row = null
				row_group = []
				row_groups = []
				for row in rows
					if not last_row or (row.auth_address == last_row?.auth_address and row.type == last_row?.type and row.type in ["post_like", "follow"])
						row_group.push row
					else
						row_groups.push row_group
						row_group = [row]
					last_row = row
				if row_group.length
					row_groups.push row_group

				@found = rows.length
				@logEnd("Update")
				cb(row_groups)

	handleMoreClick: =>
		@limit += 20
		@update(0)
		return false

	renderActivity: (activity_group) ->
		back = []
		now = Time.timestamp()
		activity = activity_group[0]
		if not activity.subject.user_name
			return back
		activity_user_link = "?Profile/#{activity.hub}/#{activity.auth_address}/#{activity.cert_user_id}"
		subject_user_link = "?Profile/#{activity.subject.hub}/#{activity.subject.auth_address}/#{activity.subject.cert_user_id or ''}"
		subject_post_link = "?Post/#{activity.subject.hub}/#{activity.subject.auth_address}/#{activity.post_id}"
		if activity.type == "post_like"
			body = [
				h("a.link", {href: activity_user_link, onclick: @Page.handleLinkClick}, activity.user_name), " liked ",
				h("a.link", {href: subject_user_link, onclick: @Page.handleLinkClick}, activity.subject.user_name), "'s ",
				h("a.link", {href: subject_post_link, onclick: @Page.handleLinkClick}, _("post", "like post"))
			]
			# Add more target
			if activity_group.length > 1
				for activity_more in activity_group[1..10]
					subject_user_link = "?Profile/#{activity_more.subject.hub}/#{activity_more.subject.auth_address}/#{activity_more.subject.cert_user_id or ''}"
					subject_post_link = "?Post/#{activity_more.subject.hub}/#{activity_more.subject.auth_address}/#{activity_more.post_id}"
					body.push ", "
					body.push h("a.link", {href: subject_user_link, onclick: @Page.handleLinkClick}, activity_more.subject.user_name)
					body.push "'s "
					body.push h("a.link", {href: subject_post_link, onclick: @Page.handleLinkClick}, _("post", "like post"))
		else if activity.type == "comment"
			body = [
				h("a.link", {href: activity_user_link, onclick: @Page.handleLinkClick}, activity.user_name), " commented on ",
				h("a.link", {href: subject_user_link, onclick: @Page.handleLinkClick}, activity.subject.user_name), "'s ",
				h("a.link", {href: subject_post_link, onclick: @Page.handleLinkClick}, _("post", "comment post")), ": #{activity.body[0..100]}"
			]
		else if activity.type == "follow"
			body = [
				h("a.link", {href: activity_user_link, onclick: @Page.handleLinkClick}, activity.user_name), " started following ",
				h("a.link", {href: subject_user_link, onclick: @Page.handleLinkClick}, activity.subject.user_name)
			]
			# Add more target
			if activity_group.length > 1
				for activity_more in activity_group[1..10]
					subject_user_link = "?Profile/#{activity_more.subject.hub}/#{activity_more.subject.auth_address}/#{activity_more.subject.cert_user_id or ''}"
					body.push ", "
					body.push h("a.link", {href: subject_user_link, onclick: @Page.handleLinkClick}, activity_more.subject.user_name)
		else
			body = activity.body

		# opacity = Math.max(0.5, 1 - (now - activity.date_added) / 10000)
		if activity.body
			title = Time.since(activity.date_added) + " - " + if activity.body.length > 500 then activity.body[0..500] + "..." else activity.body
		else
			title = Time.since(activity.date_added)
		back.push h("div.activity", {key: "#{activity.cert_user_id}_#{activity.date_added}_#{activity_group.length}", title: title, classes: {latest: now - activity.date_added < 600}, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, [
			h("div.circle"),
			h("div.body", body)
		])
		return back

	render: =>
		if @need_update
			@need_update = false
			@queryActivities (res) =>
				@activities = res
				Page.projector.scheduleRender()

		if @activities == null # Not loaded yet
			return null

		h("div.activity-list", [
			if @activities.length > 0
				h("h2", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, "Activity feed")
			h("div.items", [
				h("div.bg-line"),
				@activities[0..@limit-1].map(@renderActivity)
			]),
			if @found > @limit
				h("a.more.small", {href: "#More", onclick: @handleMoreClick, enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, "Show more...")
			# if @loading
			# 	h("span.more.small", {enterAnimation: Animation.slideDown, exitAnimation: Animation.slideUp}, "Loading...", )

		])

	update: (delay=600) =>
		clearInterval @update_timer
		if not @need_update
			@update_timer = setTimeout ( =>
				@need_update = true
				Page.projector.scheduleRender()
			), delay

window.ActivityList = ActivityList
