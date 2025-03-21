const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Log = require("../models/logModel");


const registerUser = async (req, res) => {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(400).send('Email already exists');
    }
    try {
        const saltRounds = Number(process.env.SALT_ROUNDS);
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({ name:req.body.name, email:req.body.email, password: hashedPassword });
        await newUser.save();
        res.send({ user: newUser._id });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// User Login
const loginUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Email is not found');
    }

    // Check if the password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    await Log.create({
        userId: user._id,
        action: "login",
        ipAddress: req.ip, // or req.headers['x-forwarded-for']
        timestamp: new Date()
      });

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header('auth-token', token).send(token);
    
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.password) {
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const salt = await bcrypt.genSalt(saltRounds);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json(updatedUser);
    }catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });       
    }
}
module.exports = { registerUser, loginUser, getUserById, updateUser};
