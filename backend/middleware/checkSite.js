const User = require('../models/userModel');

const checkSite = async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate('site');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.site) {
        return res.status(404).json({ message: 'No site associated with this user' });
      }
      
      res.json({ 
        siteId: user.site._id,
        siteName: user.site.name
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  module.exports = checkSite;