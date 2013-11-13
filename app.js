
/**
 * Module dependencies
 */
 var express= require('express');
 var crypto = require('crypto');
 var app = express()
 , server = require('http').createServer(app), io = require('socket.io').listen(server);

 routes = require('./routes'),
 api = require('./routes/api'),
 http = require('http'),
 path = require('path');

var databaseUrl = "mydb"; // "username:password@example.com/mydb"
var collections = ["users", "reports"]
var db = require("mongojs").connect(databaseUrl, collections);
/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
	app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
};


/**
 * Routes 
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

server.listen(3000, function () {
	console.log('Express server listening on port ' + app.get('port'));
});


io.sockets.on('connection', function (socket) {
	socket.on('mongo:get', function(data) {
		console.log(data.title, data.user); 
		var hash= crypto.createHash('md5').update(data.title+data.user).digest("hex");
		db.users.findOne({_id: hash}, function(err, user) {
			if(user!=null){
				console.log("Emit Record")
				socket.emit('mongo:haveRecord', user);
			}

		})
	});

	socket.on('mongo:save', function(data) {
		console.log(data.title,	data.time, data.user); 
		var hash= crypto.createHash('md5').update(data.title+data.user).digest("hex");
		db.users.findOne({_id: hash}, function(err, user) {
			if(user!=null){
				console.log("AlreadyExists - update")
				db.users.update(
					{_id: ""+hash},
					{ $set:{
						time: data.time
					}}
					)
			}
			else{
				console.log("Create record")
				db.users.save({
					_id:""+hash,
					title: data.title, time: data.time, user: data.user}, function(err, saved) {
						if( err || !saved ) console.log(err);
						else console.log("Position saved");
					});}
			});
	})


});