const request = require('supertest');
const chai = require('chai');
const app = require('../server/main.js');
const { getMockUser } = require('./utils');
const db = require('../server/database/connection');
const { User } = require('../server/database/models');

const agent = request.agent(app);
const { expect } = chai;

describe('Routes', () => {
  describe('Auth routes', () => {
    describe('Registeration', () => {
      it('/register should be able to successfully create a user', async () => {
        const user = getMockUser();
        const res = await agent
          .post('/api/auth/register')
          .send(user)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.username).to.equal(user.username);
        expect(res.body.email).to.equal(user.email);
      });

      it('/register should throw error when user attempts to register without required fields', async () => {
        const invalidRequest = {
          username: 'test',
        };

        await agent
          .post('/api/auth/register')
          .send(invalidRequest)
          .expect('Content-Type', /json/)
          .expect(400);
      });
    });

    describe('User', () => {
      before(() => db.sync({ force: true }));

      it('/user/:id should be able to get a user by id', async () => {
        const user = await User.create(getMockUser());
        const res = await agent
          .get('/api/auth/user/1')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.username).to.equal(user.username);
        expect(res.body.firstName).to.equal(user.firstName);
      });

      it('/user/:id should have an error message when user not found', async () => {
        const res = await agent
          .get('/api/auth/user/100')
          .expect('Content-Type', /json/)
          .expect(404);
        expect(res.body.error).to.equal('User not found');
      });

      it('/user/:id should have an error type', async () => {
        const res = await agent
          .get('/api/auth/user/shouldfail')
          .expect('Content-Type', /json/)
          .expect(400);

        expect(res.body.error).to.equal('Invalid Request');
      });
    });

    describe('Session', () => {
      it('/session should be able to get a session', async () => {
        const res = await agent
          .get('/api/auth/session')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(res.body.id).to.not.equal(null);
        expect(res.body.SID).to.not.equal(null);
        expect(res.body.userId).to.equal(null);
      });
    });
  });
});
