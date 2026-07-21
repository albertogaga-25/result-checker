import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Your MongoDB Connection String

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!uri) {
    return res.status(500).json({ message: 'MongoDB connection string missing in Environment Variables.' });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('mciu_portal'); // DB Name
    const resultsCollection = db.collection('results');

    const { fullName, matricNumber, portalPassword, session, semester, courses } = req.body;

    if (!matricNumber || !courses) {
      return res.status(400).json({ message: 'Missing required student fields.' });
    }

    // Save or update the record in MongoDB
    await resultsCollection.updateOne(
      { matricNumber: matricNumber, session: session, semester: semester },
      { 
        $set: { 
          fullName, 
          portalPassword, 
          session, 
          semester, 
          courses, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    await client.close();
    return res.status(200).json({ message: 'Record saved successfully!' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Failed to save to database: ' + error.message });
  }
}