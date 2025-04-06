const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Log = require("../models/logModel");
const { checkFailedLogins } = require("./anomalyController");
const Site = require("../models/siteModel");

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
    // 1. Find the user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Log the failed attempt (no user found)
      await Log.create({
        userId: user._id,
        action: "login",
        ipAddress: req.ip, // or req.headers["x-forwarded-for"]
        timestamp: new Date(),
        site: user.site ? user.site._id : null
      });
      return res.status(400).send("Email not found");
    }
  
    // 2. Compare password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      // Log the failed attempt
      await Log.create({
        userId: user._id,
        action: "failed_login",
        ipAddress: req.ip,
        timestamp: new Date()
      });
  
      // Check if user has too many failed attempts
      const isSuspicious = await checkFailedLogins(user._id, req.ip);
      if (isSuspicious) {
        console.log("Suspicious activity detected for user:", user._id);
        return res.status(429).send("Too many failed attempts, please try again later.");
      }
  
      return res.status(400).send("Invalid password");
    }
  
    // 3. If password is valid, generate token & log success
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.header("auth-token", token).send(token);
  
    await Log.create({
      userId: user._id,
      action: "login",
      ipAddress: req.ip, // or req.headers["x-forwarded-for"]
      timestamp: new Date(),
      site: user.site ? user.site._id : null
    });
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

const assignSiteToUser = async (req, res) => {
  try {
    const { userId, siteId } = req.body;
    // Validate that the site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    // Update the user document to include the site reference
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { site: site._id },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User assigned to site successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserById, updateUser, assignSiteToUser};
