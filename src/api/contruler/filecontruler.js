require('dotenv').config();
const path = require('path');
const multer = require('multer');
const File = require("../../models/filemodel");
const fs = require('fs');
const express = require('express');
const app = express();

const uploadDirectory = path.resolve(__dirname, '../../uploads/');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileName = `${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|mp4|avi)$/i;
  if (!allowedExtensions.test(file.originalname.toLowerCase())) {
    return cb(new Error('Only image and video files are allowed!'), false);
  }
  cb(null, true);
};

app.use('/file', express.static(uploadDirectory));
const upload = multer({ storage, fileFilter });

exports.fileadd = async (req, res, next) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(500).json({ message: 'Error uploading files', error: err });
    }

    try {
      const files = req.files.map(file => ({
        url: `${req.protocol}://${req.get('host')}/file/${file.filename}`,
        type: file.mimetype.startsWith('image') ? 'image' : 'video',
        filename: file.filename,
      }));

      const savedFiles = await File.insertMany(files);
      res.json(savedFiles);
    } catch (err) {
      console.error('Error saving files:', err);
      res.status(500).json({ message: 'Error saving files', error: err });
    }
  });
};

exports.filesget = async (req, res) => {
  try {
    const files = await File.find();

    if (files.length === 0) {
      return res.status(404).send('No files found');
    }

    res.json(files);
  } catch (err) {
    console.error('Error retrieving files:', err);
    res.status(500).json({ message: 'Error retrieving files', error: err });
  }
};






exports.fileget2 = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDirectory, filename);

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    res.sendFile(filePath);
  } catch (err) {
    console.error('Error retrieving file:', err);
    res.status(500).json({ message: 'Error retrieving file', error: err });
  }
};










exports.filedelet = async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await File.findByIdAndDelete(fileId);

    if (!file) {
      return res.status(404).send('File not found');
    }

    const filePath = path.join(uploadDirectory, file.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file from the file system:', err);
      }
    });

    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).send('Error deleting file');
  }
};


