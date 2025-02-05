const express = require('express');
const bcrypt = require('bcryptjs'); // ✅ Use bcryptjs for better stability
const User = require('../models/User');
const router = express.Router();

// ✅ Signup Route
router.post('/signup', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    try {
        if (!username || !firstname || !lastname || !password) {
            return res.status(400).json({ success: false, msg: "All fields are required" });
        }

        // ✅ Convert username to lowercase for case-insensitive storage
        const trimmedUsername = username.trim().toLowerCase();

        let user = await User.findOne({ username: trimmedUsername });
        if (user) return res.status(400).json({ success: false, msg: "Username already exists" });

        // ✅ Log raw password before hashing (for debugging)
        console.log(`Raw Password: ${password}`);

        // ✅ Ensure password is hashed correctly (hash it only once)
        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        // ✅ Log hashed password for debugging
        console.log(`Hashed Password: ${hashedPassword}`);

        user = new User({
            username: trimmedUsername,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            password: hashedPassword // ✅ Save only the hashed password
        });

        await user.save();
        console.log("User registered successfully:", user.username);

        res.status(201).json({ success: true, msg: "User registered successfully" });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false, msg: "Server error", error: err.message });
    }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
    console.log("Login Request Received:", req.body);

    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, msg: "Username and password are required" });
        }

        // ✅ Convert username to lowercase to match stored format
        const trimmedUsername = username.trim().toLowerCase();

        let user = await User.findOne({ username: trimmedUsername });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ success: false, msg: "Invalid credentials" });
        }

        console.log(`Stored Hash in DB: ${user.password}`);
        console.log(`Entered Password: ${password}`);

        // ✅ Compare passwords correctly using bcrypt
        const isMatch = await bcrypt.compare(password.trim(), user.password);
        console.log(`Password Match: ${isMatch}`);  // Debugging log

        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ success: false, msg: "Invalid credentials" });
        }

        console.log("Login successful for:", user.username);
        res.json({ success: true, msg: "Login successful", username: user.username });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ success: false, msg: "Server error", error: err.message });
    }
});


module.exports = router;
