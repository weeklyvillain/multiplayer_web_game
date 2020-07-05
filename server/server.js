var path = require('path');
var express = require('express');
var cors = require('cors')

var app = express();
const server = require('http').createServer(app);

app.use(express.static(path.join(__dirname, 'public')))
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.options('*', cors())
app.use(cors(corsOptions))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
  
var http = require('http').createServer(app);

var server_listen = http.listen(3000, function(){
    console.log('listening on *:3000');
});

const io = require('socket.io')(server_listen);
io.on('connection', client => {
  console.log('a user connected');

  client.on('join', data => {
    client.broadcast.emit('add player', data);
  });
  
  client.on('update player', data => { 
    client.broadcast.emit('player update', data); 
  });

  client.on('update pos', data => { 
    client.broadcast.emit('update player pos', data); 
  });

  client.on('new shot', data => { 
    client.broadcast.emit('add shot', data); 
  });

  client.on('remove player', data => { 
    console.log('user disconnected');
    console.log(data)
    client.broadcast.emit('remove object', data);
  });

});