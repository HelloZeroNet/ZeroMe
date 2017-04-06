class ContentSettings extends Class
	constructor: ->
		@loaded = true
		@need_update = false

	render: =>
		if Page.user and Page.user.applyBackground
			Page.user.applyBackground()
		else
			window.defaultBackground()

		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()
		if @need_update
			@log "Updating"
			@need_update = false
			Page.changeTitle "Settings"

		h("div#Content.center", [
			h("h1","Soon...")
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentSettings = ContentSettings
