var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    expressSession = require('express-session'),
    User = require('./models/User');

mongoose.connect('mongodb://localhost/sharecode');

var app = express();

// Passport config
app.use(expressSession({
  secret: 'This is the secret sentence',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// App config
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/auth'));

var port = process.env.PORT || 3000;

mongoose.connection.once('open', () => {
  console.log('MongoDB server up and running...');
}).on('error', (err) => {
  console.log('Error: ' + err);
});

app.listen(port, () => {
  console.log('Server started and running on port 3000...');
});
