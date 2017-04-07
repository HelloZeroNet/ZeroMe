class ContentSettings extends Class
	constructor: ->
		@loaded = true
		@need_update = false

	fncs: {}

	renderCheck: (key,name,desc="",attrs={}) =>
		@fncs[key]?=(item) =>
			if attrs.disabled_by and Page.local_storage.settings[attrs.disabled_by]
				return false
			Page.local_storage.settings[key] = not Page.local_storage.settings[key]
			Page.projector.scheduleRender()
			Page.saveLocalStorage()
			Page.content.need_update = true
			return false

		h("div.checkbox.setting", {classes: {checked: Page.local_storage.settings[key], disabled: attrs.disabled_by and Page.local_storage.settings[attrs.disabled_by]}, onclick: @fncs[key]},
			h("div.checkbox-skin"),
			h("div.title", name)
			if desc
				if not Array.isArray(desc)
					desc=[desc]
				desc.map (d) =>
					if d.startsWith "!WARN"
						h("div.desc.red",d.replace("!WARN","WARNING:"))
					else
						h("div.desc",d)
			h("br",key)
		)

	render: =>
		window.otherPageBackground()

		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()
		if @need_update
			@log "Updating"
			@need_update = false
			Page.changeTitle "Settings"

		h("div#Content.center", [
			if Page.local_storage_loaded
				h("div.post.settings",{style:"border-radius: 16px"},[
					h("br","top") #make it "unique"
					h("h1","Settings")
					h("h2.sep","")
					@renderCheck("hide_hello_zerome",'Hide "Hello ZeroMe!" messages',"This actually just hides a user's first post")
					@renderCheck("autoload_media","Autoload images",["This will automatically load images in posts","!WARN This might also autoload images you don't want to see or seed!"])
					@renderCheck("gimme_stars","I want my stars back","Replace the heart with a star")
					h("h2.sep","Background")
					@renderCheck("disable_background","Disable the background feature entierly")
					@renderCheck("load_others_background_disabled","Don't load other users backgrounds","",{disabled_by:"disable_background"})
					@renderCheck("hide_background_timeline","Don't show background on the feed/timeline and other pages","",{disabled_by:"disable_background"})
					h("br","bottom") #make it "unique"
				])
			else
				h("h1","Loading Settings...")
				@need_update = true
		])

	update: =>
		@need_update = true
		Page.projector.scheduleRender()

window.ContentSettings = ContentSettings
