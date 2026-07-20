const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
    }

    try {
        const { role, username, password } = JSON.parse(event.body || "{}");
        
        // Admin credentials fallback
        if (role === 'admin' && username === 'admin' && password === 'admin123') {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, role: 'admin', name: 'System Admin' })
            };
        }

        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db("mciu_db");

        // Locate student record
        const student = await db.collection("students").findOne({ matricNumber: username });
        if (!student) {
            await client.close();
            return { statusCode: 401, body: JSON.stringify({ message: "Invalid Matric Number or Password" }) };
        }

        // Compare encrypted password
        const match = await bcrypt.compare(password, student.password);
        await client.close();

        if (!match) {
            return { statusCode: 401, body: JSON.stringify({ message: "Invalid Matric Number or Password" }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                role: 'student',
                student: { name: student.name, matricNumber: student.matricNumber }
            })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
    }
};