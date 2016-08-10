class Promise
	@join: (tasks...) ->
		num_uncompleted = tasks.length
		args = new Array(num_uncompleted)
		promise = new Promise()

		for task, task_id in tasks
			((task_id) ->
				task.then(() ->
					args[task_id] = Array.prototype.slice.call(arguments)
					num_uncompleted--
					if num_uncompleted == 0
						for callback in promise.callbacks
							callback.apply(promise, args)
				)
			)(task_id)

		return promise

	constructor: ->
		@resolved = false
		@end_promise = null
		@result = null
		@callbacks = []

	resolve: ->
		if @resolved
			return false
		@resolved = true
		@data = arguments
		if not arguments.length
			@data = [true]
		@result = @data[0]
		for callback in @callbacks
			back = callback.apply callback, @data
		if @end_promise and back and back.then
			back.then (back_res) =>
				@end_promise.resolve(back_res)

	fail: ->
		@resolve(false)

	then: (callback) ->
		if @resolved == true
			return callback.apply callback, @data

		@callbacks.push callback

		@end_promise = new Promise()
		return @end_promise

window.Promise = Promise

###
s = Date.now()
log = (text) ->
	console.log Date.now()-s, Array.prototype.slice.call(arguments).join(", ")

log "Started"

cmd = (query) ->
	p = new Promise()
	setTimeout ( ->
		p.resolve query+" Result"
	), 100
	return p


back = cmd("SELECT * FROM message").then (res) ->
	log res
	p = new Promise()
	setTimeout ( ->
		p.resolve("DONE parsing SELECT")
	), 100
	return p
.then (res) ->
	log "Back of messages", res
	return cmd("SELECT * FROM users")
.then (res) ->
	log "End result", res

log "Query started", back


q1 = cmd("SELECT * FROM anything")
q2 = cmd("SELECT * FROM something")

Promise.join(q1, q2).then (res1, res2) ->
  log res1, res2
###