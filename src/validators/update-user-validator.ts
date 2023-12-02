import { checkSchema } from 'express-validator';

export default checkSchema({
    firstName: {
        errorMessage: 'First Name is Required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last Name is Required',
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: 'Role is Required',
        notEmpty: true,
        trim: true,
    },
});
