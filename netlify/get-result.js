const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
    const matricNumber = event.queryStringParameters ? event.queryStringParameters.matricNumber : null;

    if (!matricNumber) {
        return { statusCode: 400, body: JSON.stringify({ message: "Matric number required" }) };
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("mciu_db");

        const resultRecord = await db.collection("results").findOne({ studentMatric: matricNumber });
        await client.close();

        if (!resultRecord) {
            return { statusCode: 404, body: JSON.stringify({ message: "No result record found." }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(resultRecord)
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
    }
};