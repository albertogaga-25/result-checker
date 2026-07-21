const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  let regNumber, session, term;

  // Accept both GET query parameters and POST body
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    regNumber = params.regNumber || params.matricNumber;
    session = params.session;
    term = params.term;
  } else if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      regNumber = body.regNumber || body.matricNumber;
      session = body.session;
      term = body.term;
    } catch (e) {
      // JSON parse fallback
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (!regNumber) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Registration number is required' }),
    };
  }

  try {
    const { db } = await connectToDatabase();

    // Match registration number case-insensitively
    const query = {
      regNumber: { $regex: new RegExp(`^${regNumber.trim()}$`, 'i') }
    };

    // Only add session/term filter if explicitly provided
    if (session) query.session = session;
    if (term) query.term = term;

    // Search results collection
    const result = await db.collection('results').findOne(query);

    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No result uploaded for this student yet.' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        studentName: result.studentName || result.name,
        regNumber: result.regNumber,
        courses: result.courses || result.subjects || [],
        totalUnits: result.totalUnits,
        totalPoints: result.totalPoints,
        gpa: result.gpa
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error retrieving result', details: error.message }),
    };
  }
};