class Scrollwatcher extends Class
	constructor: ->
		@log "Scrollwatcher"
		@items = []
		window.onscroll = =>
			RateLimit 200, @checkScroll
		@

	checkScroll: =>
		if not @items.length
			return
		view_top = window.scrollY
		view_bottom = window.scrollY + window.innerHeight
		for [item_top, tag, cb], i in @items by -1
			if item_top + 900 > view_top and item_top - 400 < view_bottom
				@items.splice(i, 1)
				cb(tag)

	add: (tag, cb) ->
		@items.push([tag.getBoundingClientRect().top + window.scrollY, tag, cb])
		RateLimit 200, @checkScroll

window.Scrollwatcher = Scrollwatcher