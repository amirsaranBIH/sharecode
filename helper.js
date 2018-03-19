var helper = {};

helper.compareIds = function(id1, id2) {
  return JSON.stringify(id1) === JSON.stringify(id2);
}

helper.handleError = function(err, redirectUrl) {
  if (err) {
    req.flash('error', err.toString());
    return res.redirect(redirectUrl);
  }
}

module.exports = helper;
