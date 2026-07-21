const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { regNumber, studentName, session, term, subjects } = data;

    if (!regNumber || !studentName || !session || !term || !subjects) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    const { db } = await connectToDatabase();

    // Insert or update result based on regNumber, session, and term
    await db.collection('results').updateOne(
      { regNumber, session, term },
      { $set: { studentName, regNumber, session, term, subjects, updatedAt: new Date() } },
      { upsert: true }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Result uploaded successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error uploading result', details: error.message }),
    };
  }
};