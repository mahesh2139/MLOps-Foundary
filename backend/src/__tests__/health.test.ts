import request from 'supertest';
import app from '../app';

describe('health', () => {
  it('returns healthy', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
  });
});

