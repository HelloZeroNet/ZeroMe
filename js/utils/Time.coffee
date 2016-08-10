class Time
	since: (timestamp) ->
		now = +(new Date)/1000
		if timestamp > 1000000000000  # In ms
			timestamp = timestamp/1000
		secs = now - timestamp
		if secs < 60
			back = "Just now"
		else if secs < 60*60
			back = "#{Math.round(secs/60)} minutes ago"
		else if secs < 60*60*24
			back = "#{Math.round(secs/60/60)} hours ago"
		else if secs < 60*60*24*3
			back = "#{Math.round(secs/60/60/24)} days ago"
		else
			back = "on "+@date(timestamp)
		back = back.replace(/^1 ([a-z]+)s/, "1 $1") # 1 days ago fix
		return back


	date: (timestamp, format="short") ->
		if timestamp > 1000000000000  # In ms
			timestamp = timestamp/1000
		parts = (new Date(timestamp*1000)).toString().split(" ")
		if format == "short"
			display = parts.slice(1, 4)
		else
			display = parts.slice(1, 5)
		return display.join(" ").replace(/( [0-9]{4})/, ",$1")


	timestamp: (date="") ->
		if date == "now" or date == ""
			return parseInt(+(new Date)/1000)
		else
			return parseInt(Date.parse(date)/1000)


window.Time = new Time