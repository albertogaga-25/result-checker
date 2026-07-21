import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ message: 'MongoDB connection string (MONGODB_URI) is missing.' });
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db('mciu_portal');
    const collection = db.collection('results');

    const data = req.body;

    await collection.updateOne(
      { matricNumber: data.matricNumber, session: data.session, semester: data.semester },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Student record saved successfully!' });
  } catch (error) {
    console.error('Error saving record:', error);
    return res.status(500).json({ message: error.message || 'Database error occurred.' });
  } finally {
    if (client) await client.close();
  }
}