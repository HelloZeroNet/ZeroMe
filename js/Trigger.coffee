class Trigger extends Class
	constructor: ->
		@trigger_off = true

	handleTitleClick: =>
		if @trigger_off
		  @trigger_off = false
		  document.body.classList.add("trigger-on")
		else
		  document.body.classList.remove("trigger-on")
		  @trigger_off = true
		return false

	render: =>
		h("div.Trigger", {classes: { "trigger-off": @trigger_off }}, [
			h("a.icon", {"href": "#Trigger", onclick: @handleTitleClick})
		])
window.Trigger = Trigger
