import request from 'supertest';
import app from './src/app';
import { calculteSum } from './src/utils';

describe.skip('it shoudl work', () => {
    it('should return correct sum of two numbers', () => {
        const res = calculteSum(1, 2);
        expect(res).toBe(3);
    });
    it('should return 200 statusCode', async () => {
        const response = await request(app).get('/').send();
        expect(response.status).toBe(200);
    });
});
