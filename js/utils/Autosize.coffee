class Autosize extends Class
	constructor: (@attrs={}) ->
		@node = null

		@attrs.classes ?= {}
		@attrs.classes.loading ?= false
		@attrs.oninput ?= @handleInput
		@attrs.onkeydown ?= @handleKeydown
		@attrs.afterCreate ?= @storeNode
		@attrs.rows ?= 1
		@attrs.disabled ?= false
		@attrs.value ?= null
		@attrs.title_submit ?= null

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
			node.setSelectionRange(0,0)
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
		if e.which == 13 and e.ctrlKey and @attrs.onsubmit and @attrs.value.trim()
			@submit()

	submit: =>
		@attrs.onsubmit()
		setTimeout ( =>
			@autoHeight()
		), 100
		return false

	render: (body=null) =>
		if body and @attrs.value == null
			@setValue(body)
		if @loading
			attrs = clone(@attrs)
			#attrs.value = "Submitting..."
			attrs.disabled = true
			tag_textarea = h("textarea.autosize", attrs)
		else
			tag_textarea = h("textarea.autosize", @attrs)

		return [
			tag_textarea,
			if @attrs.title_submit
				h(
					"a.button.button.button-submit.button-small",
					{href: "#Submit", onclick: @submit, classes: @attrs.classes},
					@attrs.title_submit
				)
		]

window.Autosize = Autosize
