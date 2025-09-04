const axios = require('axios');

module.exports = async (req, res) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to get public IP from external service
    const response = await axios.get('https://api.ipify.org?format=json');
    const ip = response.data.ip;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ip });
  } catch (error) {
    console.error('IP detection error:', error);
    // Fallback to request IP
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ip: ip.replace('::ffff:', '') });
  }
};
