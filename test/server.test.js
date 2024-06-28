const request = require('supertest');
const express = require('express');

const app = express();
app.get('/hello', (req, res) => {
    res.send('<p>Hello, World!</p>');
});

describe('GET /hello', () => {
    it('responds with Hello, World!', (done) => {
        request(app)
            .get('/hello')
            .expect('Content-Type', /html/)
            .expect(200, '<p>Hello, World!</p>', done);
    });
});