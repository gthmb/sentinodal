(function() {
  var TwitterStream, app, creds, express, fs, sentiment, sys;
  express = require('express');
  sys = require('sys');
  app = module.exports = express.createServer();
  TwitterStream = require('evented-twitter').TwitterStream;
  sentiment = require('viralheat-sentiment')('[vh key]');
  fs = require('fs');
  creds = JSON.parse(fs.readFileSync('./credentials.json'));
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express.static(__dirname + '/public'));
  });
  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.configure('production', function() {
    return app.use(express.errorHandler());
  });
  app.get('/', function(req, res) {
    var title;
    title = 'Sentinodal';
    return res.render('index', {
      title: 'Sentinodal'
    });
  });
  app.get('/q/*', function(req, res) {
    var params, stream, t;
    if (req.params[0]) {
      t = new TwitterStream(creds.username, creds.password);
      params = {
        track: req.params[0]
      };
      stream = t.filter('json', params);
      stream.addListener('ready', function() {
        stream.addListener('tweet', function(tweet) {
          if (!String(tweet).trim()) {
            return;
          }
          try {
            t = JSON.parse(tweet);
            return sentiment.get(t.text, function(err, data, status) {
              var returnable;
              if (err) {
                ;
              } else {
                data = JSON.parse(data);
                returnable = {
                  text: t.text,
                  user: t.user.screen_name,
                  mood: data.mood,
                  probability: data.prob
                };
                return res.write(JSON.stringify(returnable) + "\r\n");
              }
            });
          } catch (e) {
            return sys.debug('\nProblem parsing: ' + tweet);
          }
        });
        return stream.addListener('complete', function(response) {
          return stream.close();
        });
      });
      stream.addListener('error', function(err) {
        sys.debug(err.message);
        throw err;
      });
      return stream.start();
    } else {
      return res.redirect('/');
    }
  });
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}).call(this);
