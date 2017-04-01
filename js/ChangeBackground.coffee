window.bgString=(color, image) ->
  if not color
    color="#FFFFF"
  if image
    return "background: url('#{image}') no-repeat fixed center;background-size:150%;background-color: #{color}"
  else
    return "background-color: #{color}"

window.setBackground=(color, image) ->
  document.body.style=window.bgString(color, image)
