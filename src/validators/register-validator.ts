import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is Required',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    password: {
        errorMessage: 'Password is Required',
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long',
        },
    },
    firstName: {
        errorMessage: 'First Name is Required',
        notEmpty: true,
    },
    lastName: {
        errorMessage: 'Last Name is Required',
        notEmpty: true,
    },
});
