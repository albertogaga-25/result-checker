const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { regNumber, session, term } = JSON.parse(event.body || '{}');

    if (!regNumber || !session || !term) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Registration number, session, and term are required' }),
      };
    }

    const { db } = await connectToDatabase();
    
    // Case-insensitive match for regNumber
    const result = await db.collection('results').findOne({
      regNumber: { $regex: new RegExp(`^${regNumber}$`, 'i') },
      session,
      term,
    });

    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Result not found. Please check your details.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error retrieving result', details: error.message }),
    };
  }
};