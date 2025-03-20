module.exports = function(requiredRole) {
    return (req, res, next) => {
      const userRole = req.userRole; // We'll set this in our JWT verify
      if (userRole === requiredRole) {
        return next();
      }
      return res.status(403).json({ message: "Access forbidden. Insufficient role." });
    };
  };