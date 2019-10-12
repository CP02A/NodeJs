const app = require('express')();
const http = require('http').createServer(app);
const socketio = require('socket.io');
const io = socketio.listen(http);
const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');
const favicon = require('serve-favicon');

app.use(favicon(__dirname + '/favicon.ico'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var last = [];
var lines = [];
var points = [];
var points_old = [];
var names = [];

http.listen(3000);

//
//  Configuring Routes
//

var paint = require('./paint/app_paint');
app.use('/paint', paint);

var insy = require('./insy/app_insy');
app.use('/insy', insy);

var paint_old = require('./paint_old/app_paint_old');
app.use('/paint_old', paint_old);

var optimizedpaint = require('./optimizedpaint/app_optimizedpaint');
app.use('/optimizedpaint', optimizedpaint);

var optimizedpaint_old = require('./optimizedpaint_old/app_optimizedpaint_old');
app.use('/optimizedpaint_old', optimizedpaint_old);

var api_github = require('./api/github/app_api_github');
app.use('/api/github', api_github);



app.get('/', function(req, res){
	console.log("Somebody went to '/'!");
	res.sendFile(__dirname + '/index.html');
});

app.get('/projects', function(req, res){
	console.log("Somebody went to '/'!");
	res.sendFile(__dirname + '/projects.html');
});

app.get('/aboutme', function(req, res){
	console.log("Somebody went to '/aboutme'!");
	res.sendFile(__dirname + '/aboutme.html');
});

app.get('/chat', function(req, res){
	console.log("Somebody went to '/chat'!");
	if(req.query.name != null && req.query.name.trim() !== "")
		res.sendFile(__dirname + '/chat/index.html');
	else
		res.sendFile(__dirname + '/chat/register.html');
});

app.get('*', function(req, res){
	console.log("Somebody went to a non existing route!");
	res.sendFile(__dirname + '/notfound.html');
});

const io_paint_old = io.of('/paint_old');
io_paint_old.on('connection', function(socket){
	last[socket.id] = {"x": "", "y": ""};
	
	socket.on('update', function(msg){
		var data = JSON.parse(msg);
		socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y});
		last[socket.id] = data;
	});
	
	socket.on('setlast', function(msg){
		var data = JSON.parse(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
});

const io_paint = io.of('/paint');
io_paint.on('connection', function(socket){
	last[socket.id] = {"x": "", "y": ""};
	lines.forEach(function(value){
		io_paint.to(socket.id).emit('update', value);
	});
	
	socket.on('update', function(msg){
		console.log(msg);
		var data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			lines.push({"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			last[socket.id] = data;
		} else {
			
		}
	});
	
	socket.on('setlast', function(msg){
		var data = JSON.parse(msg);
		console.log(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
	
	socket.on('clear', function(){
		lines = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const io_optimizedpaint = io.of('/optimizedpaint');
io_optimizedpaint.on('connection', function(socket){
	last[socket.id] = {"x": "", "y": ""};
	points.forEach(function(value){
		io_optimizedpaint.to(socket.id).emit('update', value);
	});
	
	socket.on('update', function(msg){
		console.log(msg);
		var data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			points.push({"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			last[socket.id] = data;
		} else {
			
		}
	});
	
	socket.on('setlast', function(msg){
		var data = JSON.parse(msg);
		console.log(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
	
	socket.on('clear', function(){
		points = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const io_optimizedpaint_old = io.of('/optimizedpaint_old');
io_optimizedpaint_old.on('connection', function(socket){
	points_old.forEach(function(value){
		io_optimizedpaint_old.to(socket.id).emit('update', value);
	});
	
	socket.on('update', function(msg){
		console.log(msg);
		var data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			optimizedpaint_old.emit('update', {"x": data.x, "y": data.y, "color": data.color, "size": data.size});
			points_old.push({"x": data.x, "y": data.y, "color": data.color, "size": data.size});
		} else {
			
		}
	});
	
	socket.on('clear', function(){
		lines = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const io_chat = io.of('/chat');
io_chat.on('connection', function(socket){
	socket.broadcast.emit('broadcast', "A user joined!");
	names[socket.id] = socket.handshake.url.split("?name=")[1];
	
	socket.on('chat', function(msg){
		socket.broadcast.emit('chat', names[socket.id] + ": " + msg);
	});
});
