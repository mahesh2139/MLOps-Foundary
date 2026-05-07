import request from 'supertest';
import app from '../app';

describe('auth (demo)', () => {
  it('issues a token for demo credentials', async () => {
    process.env.AUTH_MODE = 'demo';
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@mlops.com', password: 'demo123' })
      .expect(200);

    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.token).toBeTruthy();
    expect(res.body?.data?.user?.role).toBe('admin');
  });
});

