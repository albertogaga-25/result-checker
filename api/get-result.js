const { MongoClient } = require('mongodb');

module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ message: 'MONGODB_URI environment variable is not configured.' });
  }

  let client;
  try {
    const { matricNumber, password, session, semester } = req.body || {};

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('mciu_portal');
    const collection = db.collection('results');

    // Search for student result record
    const result = await collection.findOne({ matricNumber, session, semester });

    if (!result) {
      return res.status(404).json({ message: 'No result found for these credentials.' });
    }

    // Check portal password if stored
    if (result.portalPassword && result.portalPassword !== password) {
      return res.status(401).json({ message: 'Invalid Password / PIN.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ message: err.message || 'Database error occurred.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};