const { check, validationResult } = require('express-validator');

// For user input
const signupValidationRules = () => {
    return [
        check('name')
            .isLength({ min: 4})
            .withMessage("The name must have minimum length of 8")
            .trim(),
    
        check('email')
            .isEmail()
            .withMessage("Invalid email address")
            .normalizeEmail(),
    
        check('password')
            .isLength({ min: 8 })
            .withMessage("The password must have minimum length of 3")
    ];
};

// login validation rules
const loginValidationRules = () => {
    return [
        check('email')
            .isEmail()
            .withMessage("Invalid email address")
            .normalizeEmail(),
    
        check('password')
            .isLength({ min: 8 })
            .withMessage("The password must have minimum length of 3")
    ];
};

// For every validation we will use this function          
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg}));

    return res.status(422).json({
        errors: extractedErrors
    });
};

module.exports = {
    signupValidationRules,
    loginValidationRules,
    validate
};







