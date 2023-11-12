import app from '../../app';
import request from 'supertest';

describe('POST auth/register', () => {
    describe('Given all Fields', () => {
        it('should return 201', async () => {
            const userData = {
                email: 'anassain13@gmail.com',
                pasword: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(response.status).toBe(201);
        });
        it('should return valid json', async () => {
            const userData = {
                email: 'anassain13@gmail.com',
                pasword: '12345678',
                firstName: 'Anas',
                lastName: 'Sain',
            };
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(
                (response.headers as Record<string, string>)['content-type']
            ).toEqual(expect.stringContaining('json'));
        });
    });
});
