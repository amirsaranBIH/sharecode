var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    expressSession = require('express-session'),
    User = require('./models/User'),
    flash = require('connect-flash'),
    methodOverride = require('method-override'),
    socket = require('socket.io'),
	dotenv = require('dotenv').config(),
	helmet = require('helmet');
	
if (process.env.NODE_ENV === 'production') {
	mongoose.connect(`mongodb+srv://${process.env.MLAB_USER}:${process.env.MLAB_PASS}@${process.env.MLAB_DEPLOYMENT}`);
} else if (process.env.NODE_ENV === 'development') {
	mongoose.connect(`mongodb://localhost:27017/sharecode`, { useNewUrlParser: true });
} else {
	console.error('**process.env.NODE_ENV is not set!**');
	return;
}

var app = express();

// Passport setup
app.use(expressSession({
  secret: 'This is the secret sentence',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// App setup
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(flash());
app.use(methodOverride('_method'));
app.use(helmet());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use(require('./routes/auth'));
app.use('/project', require('./routes/project'));
app.use(require('./routes/index'));

var port = process.env.PORT || 3000;

mongoose.connection.once('open', () => {
  console.log('MongoDB server up and running...');
}).on('error', (err) => {
  console.log('Error: ' + err);
});

var server = app.listen(port, () => {
  console.log('Server started and running on port 3000...');
});

// Socket setup
var io = socket(server);

io.on('connection', (socket) => {
  socket.on('code', (data) => {
    socket.broadcast.emit('code', data);
  });
});
