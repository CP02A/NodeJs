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

app.get('/insy', function(req, res){
	console.log("Somebody went to '/insy'!");
	res.sendFile(__dirname + '/insy/index.html');
});

app.get('/insy/:dir', function(req, res){
	res.sendFile(__dirname + '/insy/' + req.params.dir);
});

app.get('/insy/:dir/:subdir', function(req, res){
	console.log("Somebody downloaded '" + req.params.subdir + "'!");
	res.sendFile(__dirname + '/insy/' + req.params.dir + '/' + req.params.subdir);
});

app.get('/paint_old', function(req, res){
	console.log("Somebody went to '/paint_old'!");
	res.sendFile(__dirname + '/paint_old/index.html');
});

app.get('/paint', function(req, res){
	console.log("Somebody went to '/paint'!");
	res.sendFile(__dirname + '/paint/index.html');
});

app.get('/optimizedpaint', function(req, res){
	console.log("Somebody went to '/optimizedpaint'!");
	res.sendFile(__dirname + '/optimizedpaint/index.html');
});

app.get('/optimizedpaint_old', function(req, res){
	console.log("Somebody went to '/optimizedpaint'!");
	res.sendFile(__dirname + '/optimizedpaint_old/index.html');
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

const paint_old = io.of('/paint_old');
paint_old.on('connection', function(socket){
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

const paint = io.of('/paint');
paint.on('connection', function(socket){
	last[socket.id] = {"x": "", "y": ""};
	lines.forEach(function(value){
		paint.to(socket.id).emit('update', value);
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
		lines = new Array();
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const optimizedpaint = io.of('/optimizedpaint');
optimizedpaint.on('connection', function(socket){
	last[socket.id] = {"x": "", "y": ""};
	points.forEach(function(value){
		optimizedpaint.to(socket.id).emit('update', value);
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
		points = new Array();
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const optimizedpaint_old = io.of('/optimizedpaint_old');
optimizedpaint_old.on('connection', function(socket){
	points_old.forEach(function(value){
		optimizedpaint_old.to(socket.id).emit('update', value);
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
		lines = new Array();
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});

const chat = io.of('/chat');
chat.on('connection', function(socket){
	socket.broadcast.emit('broadcast', "A user joined!");
	names[socket.id] = socket.handshake.url.split("?name=")[1];
	
	socket.on('chat', function(msg){
		socket.broadcast.emit('chat', names[socket.id] + ": " + msg);
	});
});
