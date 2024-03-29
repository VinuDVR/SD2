const express = require('express');
const request = require('supertest');
const indexRouter = require('../index');

const app = express();


describe('GET /cities', () => {
    test('should return status 404 and render cities view', async () => {
        const response = await request(app).get('/cities');
        expect(response.status).toBe(404);
        expect(response.text).toContain('cities');
    });

    // Add more test cases for different scenarios
});

