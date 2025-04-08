const cheerio = require('cheerio');

describe('Yale to Fale replacement', () => {
  const replaceYaleWithFale = ($, selector) => {
    $(selector).contents().each(function() {
      if (this.type === 'text') {
        const text = $(this).text();
        const newText = text
          .replace(/Yale/g, 'Fale')
          .replace(/YALE/g, 'FALE')
          .replace(/yale/g, 'fale');
        $(this).replaceWith(newText);
      }
    });
  };

  test('should replace Yale with Fale in text content', () => {
    const html = `
      <html>
        <head><title>Yale University</title></head>
        <body>
          <h1>Welcome to Yale</h1>
          <p>Yale is a university.</p>
          <a href="https://www.yale.edu">Yale Website</a>
        </body>
      </html>
    `;
    
    const $ = cheerio.load(html);
    
    replaceYaleWithFale($, '*');
    
    const result = $.html();
    
    // Check text replacements
    expect(result).toContain('Fale University');
    expect(result).toContain('Welcome to Fale');
    expect(result).toContain('Fale is a university');
    
    // Check that URLs remain unchanged
    expect(result).toContain('href="https://www.yale.edu"');
  });

  test('should handle text without Yale references', () => {
    const html = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Hello World</h1>
          <p>This is a test page.</p>
        </body>
      </html>
    `;
    
    const $ = cheerio.load(html);
    
    replaceYaleWithFale($, '*');
    
    const result = $.html();
    
    // Content should remain unchanged
    expect(result).toContain('Test Page');
    expect(result).toContain('Hello World');
    expect(result).toContain('This is a test page');
  });

  test('should handle different cases of Yale', () => {
    const html = '<p>YALE University, Yale College, yale school</p>';
    
    const $ = cheerio.load(html);
    
    replaceYaleWithFale($, '*');
    
    const result = $.html();
    
    expect(result).toContain('FALE University');
    expect(result).toContain('Fale College');
    expect(result).toContain('fale school');
  });
});
