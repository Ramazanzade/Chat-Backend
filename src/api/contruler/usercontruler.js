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
exports.uploadProfile = async (req, res) => {
    const { user } = req;
    if (!user)
        return res
            .status(401)
            .json({ success: false, message: 'unauthorized access!' });

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${user._id}_profile`,
            width: 500,
            height: 500,
            crop: 'fill',
        });

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { url: result.url },
            { new: true }
        );
        res
            .status(201)
            .json({ success: true, message: 'Your profile has updated!' });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: 'server error, try after some time' });
        console.log('Error while uploading profile image', error.message);
    }
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







