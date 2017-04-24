class ContentSettings extends Class
	constructor: ->
		@loaded = true
		@need_update = false

	fncs: {}

	section: (name,ar) =>
		if ar.filter(((e) => !e.properties.classes.invisible)).length
			h("div.setting"+name, [
				h("h2.sep",name)
				for e in ar
					e
				h("br",name)
			])

	renderCheck: (key,name,desc="",attrs={}) =>
		@fncs[key]?=(item) =>
			if attrs.disabled_by and Page.local_storage.settings[attrs.disabled_by]
				return false
			Page.local_storage.settings[key] = not Page.local_storage.settings[key]
			if attrs.postRun
				attrs.postRun(Page.local_storage.settings[key])
			document.body.className = "loaded"+Page.otherClasses()
			Page.projector.scheduleRender()
			Page.saveLocalStorage()
			Page.content.need_update = true
			return false

		h("div.checkbox.setting", {classes: {invisible: (if not @search or (name.toLowerCase().indexOf(@search.toLowerCase())!=-1) then false else true),checked: Page.local_storage.settings[key], disabled: attrs.disabled_by and Page.local_storage.settings[attrs.disabled_by]}, onclick: @fncs[key]},
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

	handleSearchInput: (e=null) =>
		@search = e.target.value
		Page.projector.scheduleRender()
		Page.content.need_update = true
		return false

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
					h("div",{style:"display:flex;"},[
						h("h1",{style:"margin:6px;"},"Settings")
						h("input.text.search",{value:@search,placeholder:"Search in settings...", oninput: @handleSearchInput})
					])
					@section("", [
						@renderCheck("autoload_media","Autoload images",["This will automatically load images in posts","!WARN This might also autoload images you don't want to see or seed!"])
						@renderCheck("gimme_stars","I want my stars back","Replace the heart with a star")
						@renderCheck("transparent","Enable transparency")
					])
					@section("Background", [
						@renderCheck("disable_background","Disable the background feature entierly")
						@renderCheck("load_others_background_disabled","Don't load other users backgrounds","",{disabled_by:"disable_background"})
						@renderCheck("hide_background_timeline","Don't show background on the feed/timeline and other pages","",{disabled_by:"disable_background"})
					])
					@section("Header", [
						@renderCheck("not_sticky_header","Disable Sticky Header")
						@renderCheck("logo_left","Move logo to the left")
					])
					@section("Feed", [
						@renderCheck("hide_hello_zerome","Hide \"Hello ZeroMe!\" messages","This actually just hides a user's first post")
						@renderCheck("two_column","Show two columns instead of one")
					])
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
