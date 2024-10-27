var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var socketIo = require('socket.io');
const socketHandler = require('./helpers/socketHandler');
const cors = require('cors');
const helmet = require('helmet');

var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIo(server, {
  path: '/api/socket.io',
  cors: {
    origin: [
      'https://test-61546-8vivqxqizv.tadabase.io',
      'https://techperks.advertscience.com',
      'http://localhost:3000',
      'https://webhook.site'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

socketHandler(io);
app.set('socketio', io);

// Use Helmet for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'wss://techperks.advertscience.com/socket.io', 'ws://localhost:3000/socket.io'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'", 'https://test-61546-8vivqxqizv.tadabase.io', 'https://techperks.advertscience.com', 'http://localhost:3000', 'https://webhook.site'],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: false,
    hidePoweredBy: true,
    ieNoOpen: true,
    noSniff: true,
    dnsPrefetchControl: { allow: false },
  })
);

// Simplify CORS setup
const allowedOrigins = [
  'https://test-61546-8vivqxqizv.tadabase.io',
  'https://techperks.advertscience.com',
  'http://localhost:3000',
  'https://webhook.site'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Server Stats
app.post('/api/ping', require('./routes/api/ping'));

// User routes
app.post('/api/users/new-user', require('./routes/api/users/new-user'));
app.get('/api/users/read-users', require('./routes/api/users/read-users'));
app.post('/api/users/update-user/:id', require('./routes/api/users/update-user'));
app.post('/api/users/delete-user/:id', require('./routes/api/users/delete-user'));
app.post('/api/users/login-user', require('./routes/api/users/login-user'));

// Agent routes
app.post('/api/agents/new-agent', require('./routes/api/agents/new-agent'));
app.get('/api/agents/read-agents', require('./routes/api/agents/read-agents'));
app.post('/api/agents/update-agent/:id', require('./routes/api/agents/update-agent'));
app.post('/api/agents/delete-agent/:id', require('./routes/api/agents/delete-agent'));

// Models routes
app.post('/api/models/new-model', require('./routes/api/models/new-model'));
app.get('/api/models/read-models', require('./routes/api/models/read-models'));
app.post('/api/models/update-model/:id', require('./routes/api/models/update-model'));
app.post('/api/models/delete-model/:id', require('./routes/api/models/delete-model'));
app.post('/api/models/model-chat/:id', require('./routes/api/models/model-chat'));

// Workflows routes
app.post('/api/workflows/new-workflow', require('./routes/api/workflows/new-workflow'));
app.get('/api/workflows/read-workflows', require('./routes/api/workflows/read-workflows'));
app.post('/api/workflows/update-workflow/:id', require('./routes/api/workflows/update-workflow'));

// Workflows Steps routes
app.post('/api/workflows/steps/new-workflow-step', require('./routes/api/workflows/steps/new-workflow-step'));

// Helpers routes
app.post('/helpers/sync-helper', require('./routes/api/helpers/sync-helper'));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port, () => {
  console.log(`TechPerks App listening on port ${port}`);
});

module.exports = app;
