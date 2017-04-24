window.stripMarkdown=(str) ->
  return entities.decode(striptags Text.renderMarked str)
