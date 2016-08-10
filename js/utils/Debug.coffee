class Debug
	formatException: (err) ->
		if typeof err == 'object'
			if err.message
				console.log('Message: ' + err.message)
			if err.stack
				console.log('Stacktrace:')
				console.log('====================')
				console.log(err.stack)
		else
			console.log(err)

window.Debug = new Debug()