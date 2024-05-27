const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 255
  },
  location: {
    type: String,
    required: true
  },
  contactNo: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  librarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;
