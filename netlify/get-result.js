const { connectToDatabase } = require('./db');

exports.handler = async (event) => {
  // Support both GET (query parameters) and POST (JSON body)
  let regNumber, session, term;

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
      body: JSON.stringify({ error: 'Registration or matriculation number is required' }),
    };
  }

  try {
    const { db } = await connectToDatabase();

    // Construct query — filter by session/term if provided, otherwise fetch the latest record for regNumber
    const query = {
      regNumber: { $regex: new RegExp(`^${regNumber.trim()}$`, 'i') }
    };
    if (session) query.session = session;
    if (term) query.term = term;

    // Find the record matching regNumber (sorted by newest updated)
    const result = await db.collection('results')
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(1)
      .toArray();

    if (!result || result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Result not found. Please check your details.' }),
      };
    }

    const resultData = result[0];

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        studentName: resultData.studentName,
        regNumber: resultData.regNumber,
        courses: resultData.courses || resultData.subjects || [],
        totalUnits: resultData.totalUnits,
        totalPoints: resultData.totalPoints,
        gpa: resultData.gpa
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error retrieving result', details: error.message }),
    };
  }
};