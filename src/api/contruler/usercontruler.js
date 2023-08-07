const jwt = require('jsonwebtoken');
const User = require('../../models/usermodel');
require('dotenv').config();
exports.createUser = async (req, res) => {
    const {  email, password,name , type, url} = req.body;
    const isNewUser = await User.isThisEmailInUse(email);
    if (!isNewUser)
        return res.json({
            success: false,
            message: 'This email is already in use, try sign-in',
        });
    const user = await User({
        email,
        password,
        name,
        url,
        type  
    });
    await user.save();
    res.json({ success: true, user });
};

exports.userSignIn = async (req, res) => {
    const { email, password,name, url,type} = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found with the given email!',
      });
    }
    const isMatch = await user.comparepassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'password does not match!',
      });
    }
    let token;
    try { 
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', {
        expiresIn: '1d',
      });
    } catch (error) {
      console.error('Error signing JWT:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to sign JWT.',
      });
    }
  
    let oldTokens = user.tokens || [];
  
    oldTokens = oldTokens.filter((t) => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      return timeDiff < 86400;
    });
  
    await User.findByIdAndUpdate(user._id, {
      tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });
  
    const userInfo = {
      email: user.email,
      password: user.password,
      name:user.name,
      url:user.url,
      type:user.type
    };
  
    res.json({ success: true, user: userInfo, token });
  };


exports.signOut = async (req, res) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Authorization fail!' });
        }

        const tokens = req.user.tokens;

        const newTokens = tokens.filter(t => t.token !== token);

        await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
        res.json({ success: true, message: 'Sign out successfully!' });
    }
};


exports.GetAll = async(req,res)=>{
  const users= await User.find()
  res.send(users);
}


exports.Delete = async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}



require('dotenv').config();
const path = require('path');
const multer = require('multer');
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

      const savedFiles = await User.insertMany(files);
      res.json(savedFiles);
    } catch (err) {
      console.error('Error saving files:', err);
      res.status(500).json({ message: 'Error saving files', error: err });
    }
  });
};

exports.filesget = async (req, res) => {
  try {
    const files = await User.find();

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
    const file = await User.findByIdAndDelete(fileId);

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






