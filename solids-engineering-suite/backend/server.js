const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// ✅ Google Auth Verification API
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = await admin.auth().verifyIdToken(token);

        const user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
        };

        res.json({ success: true, user });

    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});