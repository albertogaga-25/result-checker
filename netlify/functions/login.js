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

    // Clean up input by removing accidental leading/trailing spaces
    const cleanUsername = username ? username.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    if (!cleanUsername || !cleanPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username and password required' }),
      };
    }

    const { db } = await connectToDatabase();

    // --- ADMIN LOGIN ---
    if (role === 'admin') {
      const admin = await db.collection('admins').findOne({ 
        username: cleanUsername, 
        password: cleanPassword 
      });

      if (!admin) {
        console.log(`Failed admin login attempt for username: "${cleanUsername}"`);
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
      const student = await db.collection('students').findOne({ 
        regNumber: cleanUsername, 
        password: cleanPassword 
      });

      if (!student) {
        console.log(`Failed student login attempt for regNumber: "${cleanUsername}"`);
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
    console.error("Database connection or login error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error during login', details: error.message }),
    };
  }
};