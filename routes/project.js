var router = require('express').Router(),
    User = require('../models/User'),
    Project = require('../models/Project'),
    middleware = require('../middleware'),
    helper = require('../helper');

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
          contributors: [req.user],
          owner: req.user
        });

        newProject.save((err, project) => {
          helper.handleError(err, '/project/new');

          user.projects.push(project);
          user.save((err) => {
            helper.handleError(err, '/project/new');
            req.flash('success', `Successfully created a new project named ${project.name}.`);
            res.redirect(`/project/${project._id}`);
          });
        });
      });
    });

// View the project
router.route('/:id')
    .get((req, res) => {
      Project.findById(req.params.id).populate('contributors').exec((err, project) => {
        helper.handleError(err, '/');

        var canChangeCode = false;

        // Checks if the user is logged in
        if (req.user) {

          // Checks if the user is in the list of contributors
          var isContributor = project.contributors.some(contributor => {
            return helper.compareIds(contributor._id, req.user._id);
          });

          // If the user is a contributor give the permission to change code
          if (isContributor) canChangeCode = true;
        }

        res.render('project/code', {project, canChangeCode, helper});
      });
    });

// Saves/updates the code in the DB
router.put('/:id/save', middleware.isLoggedIn, middleware.isContributor, (req, res) => {
  Project.findByIdAndUpdate(req.params.id, {code: req.body.code}, (err, project) => {
    helper.handleError(err, 'back');

    req.flash('success', 'Successfully saved project.');
    res.redirect('back');
  });
});

// Adds a new contributor
router.route('/:id/contributor/add')
    .get(middleware.isLoggedIn, middleware.isContributor, (req, res) => {
      Project.findById(req.params.id, (err, project) => {
        helper.handleError(err, 'back');

        res.render('project/add-contributor', {project});
      });
    })
    .put(middleware.isLoggedIn, middleware.isContributor, (req, res) => {
      Project.findById(req.params.id, (err, project) => {
        helper.handleError(err, 'back');

        User.findOne({username: req.body.username}, (err, user) => {
          // Check is the user with the given name exist
          if (!user) {
            req.flash('error', 'There is no user with that username');
            return res.redirect('back');
          }

          helper.handleError(err, 'back');

          // Checks if user is already in the contributors list
          var isAlreadyContributing = project.contributors.some(contributor => {
            return helper.compareIds(contributor, user._id);
          });

          if (isAlreadyContributing) {
            // User is already contributing
            req.flash('error', 'User is already contributing to this project.');
            res.redirect(`/project/${project._id}`);
          } else {
            // Push the user to contributors list
            project.contributors.push(user);
            project.save(err => {
              helper.handleError(err, `/project/${project._id}`);

              user.projects.push(project);
              user.save(err => {
                helper.handleError(err, `/project/${project._id}`);

                // Redirect to project
                req.flash('success', `Successfully added ${user.username} to list of contributors for this project.`);
                res.redirect(`/project/${project._id}`);
              });
            });
          }
        })
      });
    });

// Remove contributor from list of contributors
router.delete('/:id/contributor/:contributorId/remove', middleware.isLoggedIn, middleware.isContributor, (req, res) => {
  Project.findById(req.params.id).populate('contributors').exec((err, project) => {
    helper.handleError(err, 'back');

    // Finds the position of the contributor
    var contributorPos = project.contributors.findIndex(contributor => {
      return helper.compareIds(contributor._id, req.params.contributorId);
    });

    // If it finds something remove it
    if (contributorPos !== -1) {
      var removedContributor = project.contributors.splice(contributorPos, 1);
      User.findById(removedContributor[0]._id, (err, user) => {
        helper.handleError(err, `/project/${project._id}`);

        if (helper.compareIds(removedContributor[0]._id, req.user._id)) {
          req.flash('error', 'You can\'t remove yourself from the contributor list.');
          return res.redirect(`/project/${project._id}`);
        }

        // Finds the position of the project in the contributors list of projects
        var projectPos = user.projects.findIndex(project => {
          return helper.compareIds(project, req.params.id);
        });

        // Removes the project from the list
        user.projects.splice(projectPos, 1);
        user.save(err => {
          helper.handleError(err, 'back');

          project.save(err => {
            helper.handleError(err, 'back');

            req.flash('success', `Successfully removed contributor ${removedContributor[0].username} from project.`);
            res.redirect(`/project/${project._id}`);
          });
        });
      });
    // If it doesn't find a contributor redirect with flash message
    } else {
      req.flash('error', 'Can\'t find contributor.');
      return res.redirect('back');
    }
  });
});

// Update the project, remove contributor and delete project
router.route('/:id/settings')
    .get(middleware.isLoggedIn, middleware.isContributor, (req, res) => {
      Project.findById(req.params.id).populate('contributors').exec((err, project) => {
        helper.handleError(err, `/project/${project._id}`);

        res.render('project/settings', {project});
      });
    });

// Update a project
router.put('/:id/update', middleware.isLoggedIn, middleware.isContributor, (req, res) => {
  Project.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    language: req.body.language,
    description: req.body.description
  }, (err, project) => {
    helper.handleError(err, `/project/${project._id}`);

    req.flash('success', 'Successfully updated project.');
    res.redirect(`/project/${project._id}`);
  });
});

// Delete a project
router.delete('/:id/delete', middleware.isLoggedIn, middleware.isContributor, (req, res) => {
  Project.findByIdAndRemove(req.params.id, (err, project) => {
    helper.handleError(err, `/profile/${req.user._id}`);

    project.contributors.forEach(contributor => {
      User.findById(contributor, (err, user) => {
        helper.handleError(err, `/profile/${req.user._id}`);

        var deletedProjectPos = user.projects.some(projectId => {
          return helper.compareIds(projectId, project._id);
        });
        user.projects.splice(deletedProjectPos, 1);
        user.save();
      });
    });

    req.flash('success', 'Successfully removed project named ' + project.name);
    return res.redirect(`/profile/${req.user._id}`);
  });
});

module.exports = router;
