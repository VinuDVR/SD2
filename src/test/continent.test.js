const express = require('express');
const request = require('supertest');
const indexRouter = require('../index');

const app = express();

describe('GET /continent', () => {
    test('should return status 404 and render continent view', async () => {
        const response = await request(app).get('/continent');
        expect(response.status).toBe(404);
        expect(response.text).toContain('continent');
    });

    // Add more test cases for different scenarios
});