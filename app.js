const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to replace Yale with Fale
function replaceYaleWithFale(text) {
  return text
    .replace(/Yale/g, 'Fale')
    .replace(/YALE/g, 'FALE')
    .replace(/yale/g, 'fale');
}

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to fetch and modify content
app.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      // Validate URL
      new URL(url);
      
      // Fetch the content from the provided URL
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Process text nodes
      $('*').contents().each(function() {
        if (this.type === 'text') {
          const newText = replaceYaleWithFale($(this).text());
          $(this).replaceWith(newText);
        }
      });

      // Send modified content
      return res.json({
        success: true,
        content: $.html(),
        originalUrl: url
      });
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL') {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
      console.error('Error fetching URL:', error.message);
      return res.status(500).json({ 
        error: `Failed to fetch content: ${error.message}` 
      });
    }
  } catch (error) {
    console.error('Error fetching URL:', error.message);
    return res.status(500).json({ 
      error: `Failed to fetch content: ${error.message}` 
    });
  }
});

// Export app for testing
module.exports = app;

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Fale Proxy server running at http://localhost:${PORT}`);
  });
}
