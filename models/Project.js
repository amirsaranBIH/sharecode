var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  language: String,
  code: String,
  contributors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  created: {
    type: Date,
    default: Date.now
  }
});

var Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
