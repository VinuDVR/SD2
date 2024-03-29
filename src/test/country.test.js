const express = require('express');
const request = require('supertest');
const indexRouter = require('../index');

const app = express();
const testPort = 4000; // Define a different port for testing

// Set the port for the express app
app.set('port', testPort);

describe('GET /country', () => {
    test('should return status 404 and render country view', async () => {
        const response = await request(app).get('/country');
        expect(response.status).toBe(404);
        expect(response.text).toContain('country');
    });

    // Add more test cases for different scenarios
});