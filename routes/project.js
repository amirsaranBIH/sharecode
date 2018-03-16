var router = require('express').Router(),
    User = require('../models/User'),
    Project = require('../models/Project'),
    middleware = require('../middleware');

router.route('/new')
    .get(middleware.isLoggedIn, (req, res) => {
      res.render('project/new');
    })
    .post(middleware.isLoggedIn, (req, res) => {
      var newProject = new Project({
        name: req.body.name,
        language: req.body.language
      });

      newProject.save((err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('/project/new');
        }

        req.flash('success', `Successfully created a new project named ${project.name}.`);
        res.redirect('/project/' + project._id);
      });
    });

router.route('/:id')
    .get(middleware.isLoggedIn, (req, res) => {
      Project.findById(req.params.id, (err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('/');
        }

        res.render('project/code', {project});
      });
    });

router.put('/:id/save', middleware.isLoggedIn, (req, res) => {
  Project.findByIdAndUpdate(req.params.id, {code: req.body.code}, (err, project) => {
    if (err) {
      req.flash('error', err.toString());
      return res.redirect('back');
    }
  });
});

module.exports = router;
