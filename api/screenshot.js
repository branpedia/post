const axios = require('axios');

module.exports = async (req, res) => {
  // Handle preflight request for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, device = 'desktop' } = req.body;

    if (!url) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Fungsi ssweb dari kode plugin Anda
    const result = await ssweb(url, device);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="screenshot.png"');
    
    // Kirim gambar sebagai response
    res.send(Buffer.from(result.result));
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    
    // Set CORS headers for error response too
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Failed to capture screenshot',
        details: error.response.data
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to capture screenshot',
        details: error.message
      });
    }
  }
};

async function ssweb(url, device = 'desktop') {
  return new Promise((resolve, reject) => {
    const base = 'https://www.screenshotmachine.com';
    const param = {
      url: url,
      device: device,
      cacheLimit: 0
    };
    
    axios({
      url: base + '/capture.php',
      method: 'POST',
      data: new URLSearchParams(Object.entries(param)),
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }).then((response) => {
      const cookies = response.headers['set-cookie'];
      if (response.data.status == 'success') {
        axios.get(base + '/' + response.data.link, {
          headers: {
            'cookie': cookies.join('')
          },
          responseType: 'arraybuffer'
        }).then(({ data }) => {
          let result = {
            status: 200,
            author: 'Ryzn',
            result: data
          };
          resolve(result);
        }).catch(reject);
      } else {
        reject({ status: 404, author: 'Ryzn', message: response.data });
      }
    }).catch(reject);
  });
}
