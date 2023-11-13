import { checkSchema } from 'express-validator';

// export default [
//     body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email is not valid'),
// ]

export default checkSchema({
    email: {
        errorMessage: 'Email is Required',
        notEmpty: true,
    },
});
