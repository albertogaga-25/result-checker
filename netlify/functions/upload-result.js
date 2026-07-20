const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;

function calculateGradeAndQP(score, unit) {
    let grade = 'F';
    let point = 0;
    if (score >= 70) { grade = 'A'; point = 5; }
    else if (score >= 60) { grade = 'B'; point = 4; }
    else if (score >= 50) { grade = 'C'; point = 3; }
    else if (score >= 45) { grade = 'D'; point = 2; }
    else if (score >= 40) { grade = 'E'; point = 1; }
    
    return { grade, qualityPoint: point * unit };
}

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
    }

    try {
        const { name, matricNumber, password, courses } = JSON.parse(event.body || "{}");

        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db("mciu_db");

        const hashedPassword = await bcrypt.hash(password, 10);

        // Store or update student profile
        await db.collection("students").updateOne(
            { matricNumber: matricNumber },
            { $set: { name, matricNumber, password: hashedPassword, role: "student" } },
            { upsert: true }
        );

        // Process courses and calculate GPA metrics
        let totalUnits = 0;
        let totalPoints = 0;

        const processedCourses = courses.map(c => {
            const { grade, qualityPoint } = calculateGradeAndQP(c.score, c.unit);
            totalUnits += Number(c.unit);
            totalPoints += qualityPoint;
            return { ...c, grade, qualityPoint };
        });

        const gpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";

        // Store result summary
        await db.collection("results").updateOne(
            { studentMatric: matricNumber },
            { $set: { studentMatric: matricNumber, courses: processedCourses, totalUnits, totalPoints, gpa } },
            { upsert: true }
        );

        await client.close();
        return { statusCode: 200, body: JSON.stringify({ message: "Student record saved successfully!" }) };

    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
    }
};