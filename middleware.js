var User = require('./models/User'),
    Project = require('./models/Project');

var middleware = {};

// Checks if the user is logged in
middleware.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You need to be logged in to do that.');
  res.redirect('/login');
}

// Checks if the user is a contributor to the project
middleware.isContributor = (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      req.flash('error', err.toString());
      return res.redirect('back');
    }

    // Checks the id to see if the user is a contributor
    var isContributorOfProject = user.projects.some(project => {
      return JSON.stringify(project) === JSON.stringify(req.params.id);
    });
    // If the user is a contributor then it gives permission
    if (isContributorOfProject) return next();

    req.flash('error', 'You are not a contributor to this project.');
    return res.redirect('back');
  });
}

module.exports = middleware;
