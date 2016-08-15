class Autosize extends Class
	constructor: (@attrs={}) ->
		@node = null

		@attrs.classes ?= {}
		@attrs.classes.loading = false
		@attrs.oninput = @handleInput
		@attrs.onkeydown = @handleKeydown
		@attrs.afterCreate = @storeNode
		@attrs.rows = 1
		@attrs.disabled = false

	@property 'loading',
		get: -> @attrs.classes.loading
		set: (loading) ->
			@attrs.classes.loading = loading
			@node.value = @attrs.value
			@autoHeight()
			Page.projector.scheduleRender()

	storeNode: (node) =>
		@node = node
		if @attrs.focused
			node.focus()
		setTimeout =>
			@autoHeight()

	setValue: (value=null) =>
		@attrs.value = value
		if @node
			@node.value = value
			@autoHeight()
		Page.projector.scheduleRender()

	autoHeight: =>
		height_before = @node.style.height
		if height_before
			@node.style.height = "0px"
		h = @node.offsetHeight
		scrollh = @node.scrollHeight
		@node.style.height = height_before
		if scrollh > h
			anime({targets: @node, height: scrollh, scrollTop: 0})
		else
			@node.style.height = height_before

	handleInput: (e=null) =>
		@attrs.value = e.target.value
		RateLimit 300, @autoHeight

	handleKeydown: (e=null) =>
		if e.which == 13 and not e.shiftKey and @attrs.onsubmit and @attrs.value.trim()
			@attrs.onsubmit()
			setTimeout ( =>
				@autoHeight()
			), 100
			return false

	render: (body=null) =>
		if body and @attrs.value == undefined
			@setValue(body)
		if @loading
			attrs = clone(@attrs)
			#attrs.value = "Submitting..."
			attrs.disabled = true
			h("textarea.autosize", attrs)
		else
			h("textarea.autosize", @attrs)

window.Autosize = Autosize