import { checkSchema } from 'express-validator';

export default checkSchema({
    search: {
        customSanitizer: {
            options: (searchValue: unknown) => {
                return searchValue ? searchValue : '';
            },
        },
    },
    role: {
        customSanitizer: {
            options: (roleValue: unknown) => {
                return roleValue ? roleValue : '';
            },
        },
    },
    page: {
        customSanitizer: {
            options: (pageValue) => {
                const pageParsedValue = Number(pageValue);
                return Number.isNaN(pageParsedValue) ? 1 : pageParsedValue;
            },
        },
    },
    limit: {
        customSanitizer: {
            options: (limitValue) => {
                const limitParsetValue = Number(limitValue);
                return Number.isNaN(limitParsetValue) ? 6 : limitParsetValue;
            },
        },
    },
});
