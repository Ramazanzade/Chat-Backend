const { check, validationResult } = require('express-validator');

exports.validateUserSignUp = [
    check('email').normalizeEmail().isEmail().withMessage('Invalid email!'),
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('password is empty!')
        .isLength({ min: 8, max: 15})
        .withMessage('password must be 8 to 15 characters long!'),

];

exports.userVlidation = (req, res, next) => {
    const result = validationResult(req).array();
    if (!result.length) return next();

    const error = result[0].msg;
    res.json({ success: false, message: error });
};

exports.validateUserSignIn = [
    check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('password is required!'),
];