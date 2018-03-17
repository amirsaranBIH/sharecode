var router = require('express').Router(),
    User = require('../models/User'),
    Project = require('../models/Project'),
    middleware = require('../middleware');

router.route('/new')
    .get(middleware.isLoggedIn, (req, res) => {
      res.render('project/new');
    })
    .post(middleware.isLoggedIn, (req, res) => {

      User.findById(req.user._id, (err, user) => {
        var newProject = new Project({
          name: req.body.name,
          languages: [...req.body.languages.split(',')],
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
            res.redirect(`/project/${project._id}/code`);
          });
        });
      });
    });

router.route('/:id')
    .get((req, res) => {
      Project.findById(req.params.id, (err, project) => {
        if (err) {
          req.flash('error', err.toString());
          return res.redirect('/');
        }

        var canCode = false;

        if (req.user) {
          var isContributor = project.contributors.some(contributor => {
            return JSON.stringify(contributor) === JSON.stringify(req.user._id);
          });

          if (isContributor) canCode = true;
        }

        res.render('project/code', {project, canCode});
      });
    });

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
