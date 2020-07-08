var path = require('path');
var fs = require('fs');
var express = require('express');
var cors = require('cors')
var Handlebars = require('handlebars');
var bodyParser = require('body-parser');


var app = express();
const server = require('http').createServer(app);

let rooms = [];

function render(filename, data)
{
  var source   = fs.readFileSync('./public/' + filename,'utf8').toString();
  var template = Handlebars.compile(source);
  var output = template(data);
  return output;
}

app.use(express.static(path.join(__dirname, 'public')))
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.options('*', cors())
app.use(cors(corsOptions))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.post('/createRoom', function(req, res) {
  let roomId = Math.random().toString(36).substring(7);
  req.body.playerName
  rooms.push(roomId);
  res.redirect('/room/' + roomId + '/' + req.body.playerName);
});

app.get('/room/:id/(:playerName)?', function(req, res) {
  if(!rooms.includes(req.params.id)) {
    res.send('404 Room Not Found')
  } else {
    var data = {"roomId": req.params.id};
    var renderOutput = render('./room.html', data);
    res.send(renderOutput);
  }
});
  
var http = require('http').createServer(app);

var server_listen = http.listen(3000, function(){
    console.log('listening on *:3000');
});

const io = require('socket.io')(server_listen);
io.on('connection', client => {
  console.log('a user connected');

  client.on('join', data => {
    var player = JSON.parse(data);
    //console.log(player)
    client.join(player.roomId);  
    console.log('Player: ' + player.id + " Joined Room: " + player.roomId);
    client.to(player.roomId).emit('add player', data);
  });
  
  client.on('update player', data => {
    var player = JSON.parse(data);
    client.to(player.roomId).emit('player update', data); 
  });

  client.on('update pos', data => {
    var player = JSON.parse(data);
    client.to(player.roomId).emit('update player pos', data); 
  });

  client.on('new shot', data => {
    var player = JSON.parse(data);    
    client.to(player.roomId).emit('add shot', data); 
  });

  client.on('damage player', data => {
    var player = JSON.parse(data);
    client.to(player.roomId).emit('player took damage', data); 
  });

  client.on('remove player', data => { 
    console.log('user disconnected');
    var player = JSON.parse(data);
    client.to(player.roomId).emit('remove object', data);
  });

});