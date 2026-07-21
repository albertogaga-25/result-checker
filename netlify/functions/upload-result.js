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

    // Extract fields matching both possible payload naming conventions
    const studentName = data.studentName || data.name;
    const regNumber = data.regNumber || data.matricNumber;
    const password = data.password;
    const courseList = data.courses || data.subjects || [];
    const session = data.session || '2025/2026';
    const term = data.term || '1st Semester';

    if (!regNumber || !studentName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Registration number and student name are required' }),
      };
    }

    const { db } = await connectToDatabase();

    // 1. Save or update the student profile (for student login access)
    if (password) {
      await db.collection('students').updateOne(
        { regNumber },
        { $set: { regNumber, name: studentName, password, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    // 2. Insert or update the student results record
    await db.collection('results').updateOne(
      { regNumber, session, term },
      { $set: { studentName, regNumber, session, term, courses: courseList, updatedAt: new Date() } },
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