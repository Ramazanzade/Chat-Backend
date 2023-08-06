const express = require('express');
const User = require('../../models/usermodel');
const cors = require('cors');

const router = express.Router();
const {
    createUser,
    userSignIn,
    uploadProfile,
    signOut,
    GetAll,
    Delete,
    
} = require('../contruler/usercontruler');
const { isAuth } = require('../../Middlewares/auht');
const {
    validateUserSignUp,
    userVlidation,
    validateUserSignIn,
} = require('../../Middlewares/validation/uservalidation');

const multer = require('multer');

const storage = multer.diskStorage({});

const fileFilter = ( file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb('invalid image file!', false);
    }
};
const uploads = multer({ storage, fileFilter });

router.post('/create-user', validateUserSignUp, userVlidation, createUser);
router.post('/sign-in', validateUserSignIn, userVlidation, userSignIn);
router.post('/sign-out', isAuth, signOut);
router.get('/',GetAll);
router.post(
    '/upload-profile',
    isAuth,
    uploads.single('profile'),
    uploadProfile
);
router.delete('/delete/:id',Delete);
router.get('/users/:id', async (req, res) => {
  const result =await User.findOne({_id:req.params.id})
  if(result){
    res.send(result)
  }else{
    res.send({"result":"Not update"})
  }

  });

  router.use(cors());
  router.options('/users/:id', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send();
  });
  router.put('/users/:id', async (req, res) => {
   
      const updatedUser = await User.updateOne({_id:req.params.id},{$set:req.body})
      res.send(updatedUser)
   
  });
  


module.exports = router;