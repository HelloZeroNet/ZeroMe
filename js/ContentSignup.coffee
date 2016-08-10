class ContentSignup
	constructor: ->
		@loaded = true

	render: =>
		if @loaded and not Page.on_loaded.resolved then Page.on_loaded.resolve()

		h("div#Content.center.content-signup", [
			h("h1", "Create new profile"),
			h("a.button.button-submit.button-certselect.certselect", {href: "#Select+ID"}, [
				h("div.icon.icon-profile"),
				"Select ID..."
			])
			h("div.hubselect", [
				h("h2", "Join HUB")
				h("div.hubs", [
					h("div.hub.card", [
						h("a.button.button-join", {href: "#"}, "Join!"),
						h("div.avatars", [
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar.empty", {href: "#"}, "+120")
						]),
						h("div.name", "ZeroHub #1"),
						h("div.intro", "Welcome to ZeroMe! Runner: Nofish"),
					]),
					h("div.hub.card", [
						h("a.button.button-join", {href: "#"}, "Join!"),
						h("div.avatars", [
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar", {href: "#", style: "background-image: url('img/1.png')"}),
							h("a.avatar.empty", {href: "#"}, "+120")
						]),
						h("div.name", "ZeroHub #1"),
						h("div.intro", "Welcome to ZeroMe! Runner: Nofish"),
					])
				])
			])

		])

window.ContentSignup = ContentSignup