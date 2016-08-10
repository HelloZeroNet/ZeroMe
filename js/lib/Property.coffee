Function::property = (prop, desc) ->
	Object.defineProperty @prototype, prop, desc
