const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ✅ Use bcryptjs instead of bcrypt

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: [true, "Username is required"], 
        trim: true, 
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username cannot exceed 20 characters"],
        lowercase: true // ✅ Store usernames in lowercase
    },
    firstname: { 
        type: String, 
        required: [true, "First name is required"], 
        trim: true 
    },
    lastname: { 
        type: String, 
        required: [true, "Last name is required"], 
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, "Password is required"], 
        minlength: [6, "Password must be at least 6 characters long"]
    },
    created_on: { 
        type: Date, 
        default: Date.now 
    }
});

// ✅ Fix: Ensure password is only hashed if it's not already hashed
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // ✅ Avoid re-hashing an already hashed password

    try {
        if (this.password.startsWith('$2a$10$')) { // ✅ If the password is already hashed, don't hash again
            console.log("Password is already hashed, skipping re-hashing.");
            return next();
        }

        console.log(`Raw Password Before Hashing: ${this.password}`);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log(`Final Hashed Password: ${this.password}`);
        next();
    } catch (err) {
        next(err);
    }
});

// ✅ Function to compare hashed passwords correctly
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Index to ensure unique usernames at DB level
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
