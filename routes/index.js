var router = require('express').Router(),
    User = require('../models/User'),
    Project = require('../models/Project'),
    middleware = require('../middleware'),
    helper = require('../helper');

// Landing page
router.get('/', (req, res) => {
  res.render('landing');
});

// Profile page of an user
router.route('/profile/:id')
    .get((req, res) => {
      User.findById(req.params.id).populate('projects').exec((err, user) => {
        if (err) {
          res.redirect('back');
        }
        res.render('profile', {user});
      });
    });

// Displays all projects from users
router.get('/projects', (req, res) => {
  Project.find({}).populate('contributors').exec((err, projects) => {
    helper.handleError(err, '/');

    res.render('project/index', {projects});
  });
});

// If the user visits a page that does not exist
router.get('*', (req, res) => {
  res.status(404).send('Error 404 - Page Not Found!');
});

module.exports = router;
