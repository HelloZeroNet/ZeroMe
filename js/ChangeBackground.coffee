window.bgString=(color, image) ->
  if not color
    color="#FFFFF"
  if image
    return "background: url('#{image}') no-repeat fixed center;background-size: cover;background-color: #{color}"
  else
    return "background-color: #{color}"

window.setBackground=(color, image) ->
  if Page.getSetting "disable_background"
    return window.stripBackground()
  console.log "[Background] color=%c#{color}%c"+(if image then ", image=#{image}" else ""),"color:#{color}",""
  document.body.style=window.bgString(color, image)

window.defaultBackground= ->
  window.setBackground window.defaultBackground.color,window.defaultBackground.image

window.defaultBackground.color="#D30C37"
window.defaultBackground.image="img/default-bg.jpg"

window.stripBackground= ->
  document.body.style=""

window.otherPageBackground= ->
	if Page.getSetting "hide_background_timeline" or Page.getSetting "disable_background"
		window.stripBackground()
	else
		if Page.user and Page.user.applyBackground
			Page.user.applyBackground()
		else
			window.defaultBackground()
