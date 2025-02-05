const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, firstname, lastname, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        res.json({ msg: "Login successful", username: user.username });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

module.exports = router;
