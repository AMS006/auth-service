import { checkSchema } from 'express-validator';

export default checkSchema({
    search: {
        customSanitizer: {
            options: (value: unknown) => {
                return value ? value : '';
            },
        },
    },
    role: {
        customSanitizer: {
            options: (value: unknown) => {
                return value ? value : '';
            },
        },
    },
    page: {
        customSanitizer: {
            options: (value) => {
                const parsedValue = Number(value);
                return Number.isNaN(parsedValue) ? 1 : parsedValue;
            },
        },
    },
    limit: {
        customSanitizer: {
            options: (value) => {
                const parsedValue = Number(value);
                return Number.isNaN(parsedValue) ? 6 : parsedValue;
            },
        },
    },
});
