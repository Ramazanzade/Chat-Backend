const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
});

const File = mongoose.model('File', fileSchema);

module.exports = File;