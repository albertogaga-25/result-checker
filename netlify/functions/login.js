const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { role, username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username and password required' }),
      };
    }

    const { db } = await connectToDatabase();

    // --- ADMIN LOGIN ---
    if (role === 'admin') {
      const admin = await db.collection('admins').findOne({ username, password });

      if (!admin) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid admin credentials' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, role: 'admin' }),
      };
    } 
    
    // --- STUDENT LOGIN ---
    else {
      // Matches 'username' from form to 'regNumber' in MongoDB
      const student = await db.collection('students').findOne({ regNumber: username, password });

      if (!student) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid registration number or password' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, role: 'student', student }),
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error during login', details: error.message }),
    };
  }
};