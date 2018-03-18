var router = require('express').Router(),
    User = require('../models/User'),
    Project = require('../models/Project'),
    middleware = require('../middleware');

// Creating a new project
router.route('/new')
    .get(middleware.isLoggedIn, (req, res) => {
      res.render('project/new');
    })
    .post(middleware.isLoggedIn, (req, res) => {

      User.findById(req.user._id, (err, user) => {
        var newProject = new Project({
          name: req.body.name,
          language: req.body.language,
          description: req.body.description,
          contributors: [req.user]
        });

        newProject.save((err, project) => {
          if (err) {
            req.flash('error', err.toString());
            return res.redirect('/project/new');
          }

          user.projects.push(project);
          user.save((err) => {
            if (err) {
              req.flash('error', err.toString());
              return res.redirect('/project/new');
            }
            req.flash('success', `Successfully created a new project named ${project.name}.`);
            res.redirect(`/project/${project._id}`);
          });
        });
      });
    });

// View the project
router.route('/:id')
    .get((req, res) => {
      Project.findById(req.params.id, (err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('/');
        }

        var canChangeCode = false;

        // Checks if the user is logged in
        if (req.user) {
          // Checks if the user is in the list of contributors
          var isContributor = project.contributors.some(contributor => {
            return JSON.stringify(contributor) === JSON.stringify(req.user._id);
          });

          // If the user is a contributor give the permission to change code
          if (isContributor) canChangeCode = true;
        }

        res.render('project/code', {project, canChangeCode});
      });
    });

// Saves/updates the code in the DB
router.put('/:id/save', middleware.isLoggedIn, (req, res) => {
  Project.findByIdAndUpdate(req.params.id, {code: req.body.code}, (err, project) => {
    if (err) {
      req.flash('error', err.toString());
      return res.redirect('back');
    }
    req.flash('success', 'Successfully saved project.');
    res.redirect('back');
  });
});

// Adds a new contributor
router.route('/:id/contributor/add')
    .get(middleware.isLoggedIn, (req, res) => {
      Project.findById(req.params.id, (err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('back');
        }
        res.render('project/add-contributor', {project});
      });
    })
    .put(middleware.isLoggedIn, (req, res) => {
      Project.findById(req.params.id, (err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('back');
        }
        User.findOne({username: req.body.username}, (err, user) => {
          // Check is the user with the given name exist
          if (!user) {
            req.flash('error', 'There is no user with that username');
            return res.redirect('back');
          }
          if (err) {
            req.flash('error', err.toString());
            return res.redirect('back');
          }
          // Checks if user is already in the contributors list
          var isAlreadyContributing = project.contributors.some(contributor => {
            return JSON.stringify(contributor) === JSON.stringify(user._id);
          });

          if (isAlreadyContributing) {
            // User is already contributing
            req.flash('error', 'User is already contributing to this project.');
            res.redirect(`/project/${project._id}`);
          } else {
            // Push the user to contributors list
            project.contributors.push(user);
            project.save((err) => {
              if (err) {
                req.flash('error', err.toString());
                return res.redirect('/project/new');
              }
              // Redirect to project
              req.flash('success', `Successfully added ${user.username} to list of contributors for this project.`);
              res.redirect(`/project/${project._id}`);
            });
          }
        })
      });
    });

module.exports = router;
