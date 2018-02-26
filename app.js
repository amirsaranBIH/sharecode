var express = require('express'),
    bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Routes
app.use(require('./routes/index'));

app.listen(3000, () => {
  console.log('Server started and running on port 3000...');
});
