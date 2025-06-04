
const express = require('express');
const compression = require('compression');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const fs = require('fs');
const nconf = require('nconf');
const bodyParser = require('body-parser');
const passport = require('passport');
const expressSession = require('express-session');
const { v4: uuidv4 } = require('uuid'); 
const databaseController = require('./controllers/database_controller.js');
const websocketController = require('./controllers/websocket_controller.js');
const config = require('./config/app_config.js');

require('dotenv').config();
const mongoSessionStore = require('connect-mongo')(expressSession);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.allowedOrigins || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Compress all HTTP responses
app.use(compression());

app.locals.pretty = true;
app.set('views', __dirname + '/app/server/views');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
//app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));

// remove initialisation for the database for now
//databaseController.init();

nconf.file('./config/app_config.json');

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), {flags: 'a'});
let logFormat = ':remote-addr [:date[clf]] <:userid> ":method :url HTTP/:http-version" :status - :res[content-length] b - :response-time ms - [:user-agent]';
app.use(morgan(logFormat, {stream: accessLogStream}));
morgan.token('remote-addr', function (req) {
    return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});
morgan.token('userid', function (req) {
  let id = "";
  if ((req.hasOwnProperty('user')) && (req.user.hasOwnProperty('uid'))) {
    id = req.user.uid;
  }
  return id;
});

app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret: 'completely-different',
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/*', function(req, res, next) {
  //console.log("req.headers " + req.headers.host);
  /*if (req.headers != null && req.headers.host != null && !req.headers.host.includes("www") && (req.headers.host.includes("jamjamprojects.com") || req.headers.host.includes("localhost") || req.headers.host.includes("18.168.254.31"))) {
    next();  
  } else {
    res.redirect('https://' + req.headers.host.replace(/^www\./, '') + req.url);    
  }*/
  next();
});

websocketController.init(io);

require('./app/server/main-routes')(app, passport);

const port = process.env.PORT || nconf.get('port') || '80';
app.set('port', port);


server.listen(port, () => console.log(`API running on localhost:${port}`));


app.all('*', function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
    //res.sendFile(__dirname + '/app/server/views/demo/error.html');
  }
});


