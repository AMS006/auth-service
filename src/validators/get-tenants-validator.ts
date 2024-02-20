import { checkSchema } from 'express-validator';

export default checkSchema({
    search: {
        customSanitizer: {
            options: (searchValue: unknown) => {
                return searchValue ? searchValue : '';
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
                const limitParsedValue = Number(limitValue);
                return Number.isNaN(limitParsedValue) ? 6 : limitParsedValue;
            },
        },
    },
});
