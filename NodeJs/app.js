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

http.listen(3000);

var last = [];
var lines = [];
var points = [];
var points_old = [];
var names = [];



//
//	Configuring Base Routes
//
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html') );
app.get('/projects', (req, res) => res.sendFile(__dirname + '/projects.html') );
app.get('/aboutme', (req, res) => res.sendFile(__dirname + '/aboutme.html') );
app.get('*', (req, res) => res.sendFile(__dirname + '/notfound.html') );



//
//  Configuring Extra Routes
//
const paint = require('./paint/app_paint');
app.use('/paint', paint);
const insy = require('./insy/app_insy');
app.use('/insy', insy);
const paint_old = require('./paint_old/app_paint_old');
app.use('/paint_old', paint_old);
const optimizedpaint = require('./optimizedpaint/app_optimizedpaint');
app.use('/optimizedpaint', optimizedpaint);
const optimizedpaint_old = require('./optimizedpaint_old/app_optimizedpaint_old');
app.use('/optimizedpaint_old', optimizedpaint_old);
const chat = require('./chat/app_chat');
app.use('/chat', chat);
const api_github = require('./api/github/app_api_github');
app.use('/api/github', api_github);



//
//	Socket Handlers
//
//	Old Paint
const io_paint_old = io.of('/paint_old');
io_paint_old.on('connection', socket => {
	last[socket.id] = {"x": "", "y": ""};
	
	socket.on('update', msg => {
		const data = JSON.parse(msg);
		socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y});
		last[socket.id] = data;
	});
	
	socket.on('setlast', msg => {
		const data = JSON.parse(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
});
//	Paint
const io_paint = io.of('/paint');
io_paint.on('connection', socket => {
	last[socket.id] = {"x": "", "y": ""};
	lines.forEach(value => {
		io_paint.to(socket.id).emit('update', value);
	});
	
	socket.on('update', msg => {
		const data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			lines.push({"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			last[socket.id] = data;
		}
	});
	
	socket.on('setlast', msg => {
		const data = JSON.parse(msg);
		console.log(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
	
	socket.on('clear', () => {
		lines = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});
//	Optimized Paint
const io_optimizedpaint = io.of('/optimizedpaint');
io_optimizedpaint.on('connection', socket => {
	last[socket.id] = {"x": "", "y": ""};
	points.forEach(value => {
		io_optimizedpaint.to(socket.id).emit('update', value);
	});
	
	socket.on('update', msg => {
		console.log(msg);
		const data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			socket.broadcast.emit('update', {"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			points.push({"x1": last[socket.id].x, "y1": last[socket.id].y, "x2": data.x, "y2": data.y, "color": data.color, "size": data.size});
			last[socket.id] = data;
		}
	});
	
	socket.on('setlast', msg => {
		const data = JSON.parse(msg);
		console.log(msg);
		last[socket.id].x = data.x;
		last[socket.id].y = data.y;
	});
	
	socket.on('clear', () => {
		points = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});
//	Old Optimized Paint
const io_optimizedpaint_old = io.of('/optimizedpaint_old');
io_optimizedpaint_old.on('connection', socket => {
	points_old.forEach(value => {
		io_optimizedpaint_old.to(socket.id).emit('update', value);
	});
	
	socket.on('update', msg => {
		console.log(msg);
		const data = JSON.parse(msg);
		if(data.size <= 50 && data.size > 0){
			optimizedpaint_old.emit('update', {"x": data.x, "y": data.y, "color": data.color, "size": data.size});
			points_old.push({"x": data.x, "y": data.y, "color": data.color, "size": data.size});
		}
	});
	
	socket.on('clear', () => {
		lines = [];
		console.log('Somebody cleared Paint');
		socket.emit('clear');
	});
});
//	Chat
const io_chat = io.of('/chat');
io_chat.on('connection', socket => {
	socket.broadcast.emit('broadcast', "A user joined!");
	names[socket.id] = socket.handshake.url.split("?name=")[1];
	
	socket.on('chat', msg => {
		socket.broadcast.emit('chat', names[socket.id] + ": " + msg);
	});
});
