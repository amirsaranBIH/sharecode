var router = require('express').Router(),
    passport = require('passport'),
    User = require('../models/User');

// Login routes
router.route('/login')
    .get((req, res) => {
      res.render('login');
    })
    .post(passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

// Sign up routes
router.route('/signup')
    .get((req, res) => {
      res.render('signup');
    })
    .post((req, res) => {
      var newUser = {
        username: req.body.username,
        email: req.body.email
      };

      User.register(newUser, req.body.password, (err, user) => {
        if (err) {
          console.log('Error: ' + err);
          return res.redirect('/signup');
        }

        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      });
    });

// Logout route
router.route('/logout')
    .get((req, res) => {
      req.logout();
      req.flash('success', 'Successfully logged out.');
      res.redirect('/');
    });

module.exports = router;
