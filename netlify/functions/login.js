const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password required' }),
      };
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ username, password });

    if (!admin) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid username or password' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Login successful' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error during login', details: error.message }),
    };
  }
};