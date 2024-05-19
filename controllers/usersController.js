const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("password").lean();
    if (!users.length) {
      return res.status(400).json({ message: "No users found" });
    }
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = {
  getAllUsers,
};
