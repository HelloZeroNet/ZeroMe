class Menu
	constructor: ->
		@visible = false
		@items = []
		@node = null

	show: =>
		window.visible_menu?.hide()
		@visible = true
		window.visible_menu = @

	hide: =>
		@visible = false

	toggle: =>
		if @visible
			@hide()
		else
			@show()
		Page.projector.scheduleRender()


	addItem: (title, cb, selected=false) ->
		@items.push([title, cb, selected])


	storeNode: (node) =>
		@node = node
		# Animate visible
		if @visible
			node.className = node.className.replace("visible", "")
			setTimeout (->
				node.className += " visible"
			), 10

	handleClick: (e) =>
		keep_menu = false
		for item in @items
			[title, cb, selected] = item
			if title == e.target.textContent
				keep_menu = cb(item)
		if keep_menu != true
			@hide()
		return false

	renderItem: (item) =>
		[title, cb, selected] = item
		if typeof(selected) == "function"
			selected = selected()
		if title == "---"
			h("div.menu-item-separator")
		else
			if typeof(cb) == "string"  # Url
				href = cb
				onclick = true
			else  # Callback
				href = "#"+title
				onclick = @handleClick
			h("a.menu-item", {href: href, onclick: onclick, key: title, classes: {"selected": selected}}, [title])

	render: (class_name="") =>
		if @visible or @node
			h("div.menu#{class_name}", {classes: {"visible": @visible}, afterCreate: @storeNode}, @items.map(@renderItem))

window.Menu = Menu

# Hide menu on outside click
document.body.addEventListener "mouseup", (e) ->
	if not window.visible_menu or not window.visible_menu.node
		return false
	if e.target != window.visible_menu.node.parentNode and e.target.parentNode != window.visible_menu.node and e.target.parentNode != window.visible_menu.node.parentNode and e.target.parentNode != window.visible_menu.node and e.target.parentNode.parentNode != window.visible_menu.node.parentNode
		window.visible_menu.hide()
		Page.projector.scheduleRender()