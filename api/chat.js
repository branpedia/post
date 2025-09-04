const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo purposes (in production, use a database)
let chatRooms = new Map();

module.exports = async (req, res) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const { roomId } = req.query;
    
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Initialize room if it doesn't exist
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, {
        messages: [],
        users: new Set()
      });
    }

    const room = chatRooms.get(roomId);

    if (req.method === 'GET') {
      // Get messages for a room
      return res.status(200).json(room.messages);
    } else if (req.method === 'POST') {
      // Add a new message to a room
      const { message, userIP, type = 'message', screenshotData } = req.body;
      
      if (!message && !screenshotData) {
        return res.status(400).json({ error: 'Message or screenshot data is required' });
      }

      const messageData = {
        id: uuidv4(),
        senderIP: userIP,
        message: message,
        type: type,
        screenshot: screenshotData,
        timestamp: new Date().toISOString(),
        roomId: roomId
      };

      room.messages.push(messageData);
      
      // Keep only the last 100 messages to prevent memory issues
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      return res.status(200).json(messageData);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
