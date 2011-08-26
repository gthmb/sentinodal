#####
# Module dependencies.
#####
express = require('express')

sys = require('sys')
app = module.exports = express.createServer()
TwitterStream = require('evented-twitter').TwitterStream
sentiment = require('viralheat-sentiment')('[vh key]');
fs = require('fs')

creds = JSON.parse(fs.readFileSync('./credentials.json'))

# Configuration

app.configure(() ->
	app.set('views', __dirname + '/views')
	app.set('view engine', 'jade')
	app.use(express.bodyParser())
	app.use(express.methodOverride())
	app.use(app.router)
	app.use(express.static(__dirname + '/public'))
)

app.configure('development', () ->
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
)

app.configure('production', () ->
	app.use(express.errorHandler());
)

# Routes
app.get('/', (req, res) ->
	title = 'Sentinodal'
	res.render('index', {
		title: 'Sentinodal'
	})
)

app.get('/q/*', (req, res) ->
	
	# res.render('index', {
	# 	title: 'Express'
	# })
	
	if req.params[0]
		t = new TwitterStream(creds.username, creds.password)
		
		params =
			track:req.params[0]
		
		# statuses/sample from streaming api
		stream = t.filter('json', params);
		
		stream.addListener('ready', () ->
			stream.addListener('tweet', (tweet) ->
				if(!String(tweet).trim())
					return
				try
					t = JSON.parse(tweet)
					# console.log(t)
					sentiment.get(t.text, (err, data, status) ->
						if(err)
							# Error
						else
							data = JSON.parse(data)
							returnable =
								text: t.text
								user: t.user.screen_name
								mood: data.mood
								probability: data.prob
							res.write(JSON.stringify(returnable)+"\r\n")
					)
				catch e
					sys.debug('\nProblem parsing: ' + tweet)
					# sys.debug(e.message)
					# sys.debug(e.stack)
			)
			
			stream.addListener('complete', (response) ->
				stream.close()
			)
		)
		
		stream.addListener('error', (err) ->
			sys.debug(err.message)
			throw err
		)
		
		stream.start()
	else
		res.redirect('/')
)

app.listen(3000)
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)