class Editable extends Class
	constructor: (@type, @handleSave, @handleDelete) ->
		@node = null
		@editing = false
		@render_function = null
		@empty_text = "Click here to edit this field"

	storeNode: (node) =>
		@node = node

	handleEditClick: (e) =>
		@editing = true
		@field_edit = new Autosize({focused: 1, style: "height: 0px"})
		return false

	handleCancelClick: =>
		@editing = false
		return false

	handleDeleteClick: =>
		Page.cmd "wrapperConfirm", ["Are you sure?", "Delete"], =>
			@field_edit.loading = true
			@handleDelete (res) =>
				@field_edit.loading = false
		return false

	handleSaveClick: =>
		@field_edit.loading = true
		@handleSave @field_edit.attrs.value, (res) =>
			@field_edit.loading = false
			if res
				@editing = false
		return false

	render: (body) =>
		if @editing
			return h("div.editable.editing", {exitAnimation: Animation.slideUp},
				@field_edit.render(body),
				h("div.editablebuttons",
					h("a.link", {href: "#Cancel", onclick: @handleCancelClick, tabindex: "-1"}, "Cancel"),
					if @handleDelete
						h("a.button.button-submit.button-small.button-outline", {href: "#Delete", onclick: @handleDeleteClick, tabindex: "-1"})
					h("a.button.button-submit.button-small", {href: "#Save", onclick: @handleSaveClick}, "Save")
				)
			)
		else
			return h("div.editable", {enterAnimation: Animation.slideDown},
				h("a.icon.icon-edit", {key: @node, href: "#Edit", onclick: @handleEditClick}),
				if not body
					h(@type, h("span.empty", {onclick: @handleEditClick}, @empty_text))
				else if @render_function
					h(@type, {innerHTML: @render_function(body)})
				else
					h(@type, body)
			)

window.Editable = Editable