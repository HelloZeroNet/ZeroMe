class MarkedRenderer extends marked.Renderer
	image: (href, title, text) ->
		return ("<code>![#{text}](#{href})</code>")

class Text
	toColor: (text, saturation=30, lightness=50) ->
		hash = 0
		for i in [0..text.length-1]
			hash += text.charCodeAt(i)*i
			hash = hash % 1777
		return "hsl(" + (hash % 360) + ",#{saturation}%,#{lightness}%)";


	renderMarked: (text, options={}) =>
		if not text
			return ""
		options["gfm"] = true
		options["breaks"] = true
		options["sanitize"] = true
		options["renderer"] = marked_renderer
		text = @fixReply(text)
		text = marked(text, options)
		text = text.replace(/(@[^\x00-\x1f^\x21-\x2f^\x3a-\x40^\x5b-\x60^\x7b-\x7f]{1,16}):/g, '<b class="reply-name">$1</b>:')  # Highlight usernames
		return @fixHtmlLinks text

	renderLinks: (text) =>
		text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')  # Sanitize html tags
		text = text.replace /(https?:\/\/[^\s)]+)/g, (match) ->
			return "<a href=\"#{match.replace(/&amp;/g, '&')}\">#{match}</a>"  # UnSanitize &amp; -> & in links
		text = text.replace(/\n/g, '<br>')
		text = text.replace(/(@[^\x00-\x1f^\x21-\x2f^\x3a-\x40^\x5b-\x60^\x7b-\x7f]{1,16}):/g, '<b class="reply-name">$1</b>:')
		text = @fixHtmlLinks(text)

		return text

	emailLinks: (text) ->
		return text.replace(/([a-zA-Z0-9]+)@zeroid.bit/g, "<a href='?to=$1' onclick='return Page.message_create.show(\"$1\")'>$1@zeroid.bit</a>")

	# Convert zeronet html links to relaitve
	fixHtmlLinks: (text) ->
		# Fix site links
		text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110\/(Me.ZeroNetwork.bit|1MeFqFfFFGQfa1J3gJyYYUvb5Lksczq7nH)\/\?/gi, 'href="?')
		if window.is_proxy
			text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/gi, 'href="http://zero')
			text = text.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1")
		else
			text = text.replace(/href="http:\/\/(127.0.0.1|localhost):43110/g, 'href="')
		# Add no-refresh linking to local links
		text = text.replace(/href="\.\/\?/g, 'href="?')
		text = text.replace(/href="\?/g, 'onclick="return Page.handleLinkClick(window.event)" href="?')
		return text


	# Convert a single link to relative
	fixLink: (link) ->
		if window.is_proxy
			back = link.replace(/http:\/\/(127.0.0.1|localhost):43110/, 'http://zero')
			return back.replace(/http:\/\/zero\/([^\/]+\.bit)/, "http://$1")  # Domain links
		else
			return link.replace(/http:\/\/(127.0.0.1|localhost):43110/, '')

	toUrl: (text) ->
		return text.replace(/[^A-Za-z0-9]/g, "+").replace(/[+]+/g, "+").replace(/[+]+$/, "")

	getSiteUrl: (address) ->
		if window.is_proxy
			if "." in address # Domain
				return "http://"+address+"/"
			else
				return "http://zero/"+address+"/"
		else
			return "/"+address+"/"


	fixReply: (text) ->
		return text.replace(/(>.*\n)([^\n>])/gm, "$1\n$2")

	toBitcoinAddress: (text) ->
		return text.replace(/[^A-Za-z0-9]/g, "")


	jsonEncode: (obj) ->
		return unescape(encodeURIComponent(JSON.stringify(obj)))

	jsonDecode: (obj) ->
		return JSON.parse(decodeURIComponent(escape(obj)))

	fileEncode: (obj) ->
		if typeof(obj) == "string"
			return btoa(unescape(encodeURIComponent(obj)))
		else
			return btoa(unescape(encodeURIComponent(JSON.stringify(obj, undefined, '\t'))))

	utf8Encode: (s) ->
		return unescape(encodeURIComponent(s))

	utf8Decode: (s) ->
		return decodeURIComponent(escape(s))


	distance: (s1, s2) ->
		s1 = s1.toLocaleLowerCase()
		s2 = s2.toLocaleLowerCase()
		next_find_i = 0
		next_find = s2[0]
		match = true
		extra_parts = {}
		for char in s1
			if char != next_find
				if extra_parts[next_find_i]
					extra_parts[next_find_i] += char
				else
					extra_parts[next_find_i] = char
			else
				next_find_i++
				next_find = s2[next_find_i]

		if extra_parts[next_find_i]
			extra_parts[next_find_i] = ""  # Extra chars on the end doesnt matter
		extra_parts = (val for key, val of extra_parts)
		if next_find_i >= s2.length
			return extra_parts.length + extra_parts.join("").length
		else
			return false


	queryParse: (query) ->
		params = {}
		parts = query.split('&')
		for part in parts
			[key, val] = part.split("=")
			if val
				params[decodeURIComponent(key)] = decodeURIComponent(val)
			else
				params["url"] = decodeURIComponent(key)
				params["urls"] = params["url"].split("/")
		return params

	queryEncode: (params) ->
		back = []
		if params.url
			back.push(params.url)
		for key, val of params
			if not val or key == "url"
				continue
			back.push("#{encodeURIComponent(key)}=#{encodeURIComponent(val)}")
		return back.join("&")

	highlight: (text, search) ->
		parts = text.split(RegExp(search, "i"))
		back = []
		for part, i in parts
			back.push(part)
			if i < parts.length-1
				back.push(h("span.highlight", {key: i}, search))
		return back

	sqlIn: (values) ->
		return "("+("'#{value}'" for value in values).join(',')+")"

	formatSize: (size) ->
		size_mb = size/1024/1024
		if size_mb >= 1000
			return (size_mb/1024).toFixed(1)+" GB"
		else if size_mb >= 100
			return size_mb.toFixed(0)+" MB"
		else if size/1024 >= 1000
			return size_mb.toFixed(2)+" MB"
		else
			return (size/1024).toFixed(2)+" KB"


window.is_proxy = (document.location.host == "zero" or window.location.pathname == "/")
window.marked_renderer = new MarkedRenderer()
window.Text = new Text()
