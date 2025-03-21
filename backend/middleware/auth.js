const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      req.userId = user._id;
      req.userRole = user.role; // pass the user's role along
      next();
    } catch (error) {
      return res
        .status(403)
        .json({ error: error.message, msg: "Failed to authenticate token." });
    }
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

module.exports = authenticate;