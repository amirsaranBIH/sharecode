var router = require('express').Router(),
    User = require('../models/User'),
    middleware = require('../middleware');

router.get('/', (req, res) => {
  res.render('landing');
});

router.route('/profile/:id')
    .get(middleware.isLoggedIn, (req, res) => {
      User.findById(req.params.id, (err, user) => {
        if (err) {
          res.redirect('back');
        }

        res.render('profile', {user});
      });
    });

router.get('*', (req, res) => {
  res.status(404).send('Error 404 - Page Not Found!');
});

module.exports = router;
