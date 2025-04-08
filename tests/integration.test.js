const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { sampleHtmlWithYale } = require('./test-utils');
const request = require('supertest');
const app = require('../app');

jest.mock('axios');

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('GET / serves index.html', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
  });

  test('POST /fetch requires URL', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });

  test('POST /fetch validates URL format', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'not-a-valid-url' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid URL format');
  });

  test('POST /fetch replaces Yale with Fale', async () => {
    const mockHtml = `
      <html>
        <head><title>Yale University</title></head>
        <body><p>Welcome to Yale</p></body>
      </html>
    `;

    axios.get.mockResolvedValue({ data: mockHtml });

    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://test.yale.edu/' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.content).toContain('Fale University');
    expect(response.body.content).toContain('Welcome to Fale');
  });

  test('POST /fetch handles network errors', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://test.yale.edu/' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to fetch content: Network error');
  });
});
