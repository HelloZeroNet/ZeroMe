window.bgString=(color, image) ->
  if not color
    color="#FFFFF"
  if image
    return "background: url('#{image}') no-repeat fixed center;background-size:150%;background-color: #{color}"
  else
    return "background-color: #{color}"

window.setBackground=(color, image) ->
  console.log "[Background] color=%c#{color}%c"+(if image then ", image=#{image}" else ""),"color:#{color}",""
  document.body.style=window.bgString(color, image)

window.defaultBackground= ->
  window.setBackground window.defaultBackground.color,window.defaultBackground.image

window.defaultBackground.color="#D30C37"
window.defaultBackground.image="img/default-bg.jpg"
