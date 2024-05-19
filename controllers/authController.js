const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
  register: async (req, res) => {
    console.log('Register endpoint hit');
    console.log('Request body:', req.body);

    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      role,
      cabinet_location,
      work_hours,
      specialty,
      patient_id,
      family_relation,
      date_of_birth,
      address,
    } = req.body;

    if (!first_name || !last_name || !email || !password || !phone_number || !role) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const foundUser = await User.findOne({ email }).exec();
      if (foundUser) {
        console.log('User already exists');
        return res.status(401).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let userFields = {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone_number,
        role,
      };

      if (role === 'doctor') {
        console.log('Registering doctor');
        if (!cabinet_location || !work_hours || !specialty) {
          console.log('Missing doctor fields');
          return res.status(400).json({ message: "Cabinet location, work hours, and specialty are required for doctors" });
        }
        userFields = {
          ...userFields,
          cabinet_location,
          work_hours,
          specialty,
        };
      } else if (role === 'patient') {
        console.log('Registering patient');
        if (!patient_id || !family_relation || !date_of_birth || !address) {
          console.log('Missing patient fields');
          return res.status(400).json({ message: "Patient ID, family relation, date of birth, and address are required for patients" });
        }
        userFields = {
          ...userFields,
          patient_id,
          family_relation,
          date_of_birth,
          address,
        };
      }

      console.log('User fields:', userFields);
      const user = await User.create(userFields);

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: user._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        {
          UserInfo: {
            id: user._id,
          },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  login: async (req, res) => {
    console.log('Login endpoint hit');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const foundUser = await User.findOne({ email }).exec();
      if (!foundUser) {
        console.log('User does not exist');
        return res.status(401).json({ message: "User does not exist" });
      }

      const match = await bcrypt.compare(password, foundUser.password);

      if (!match) {
        console.log('Wrong Password');
        return res.status(401).json({ message: "Wrong Password" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
          },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        email: foundUser.email,
        role: foundUser.role,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  refresh: (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshToken = cookies.jwt;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const foundUser = await User.findById(decoded.UserInfo.id).exec();
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.json({ accessToken });
    });
  },

  logout: (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({ message: "Cookie cleared" });
  },

  findUser: async (req, res) => {
    const { identifier } = req.params; // Peut être un email ou un ID

    try {
      let user;

      // Vérifier si l'identifiant est un email
      if (identifier.includes('@')) {
        user = await User.findOne({ email: identifier }).exec();
      } else {
        // Sinon, supposer que c'est un ID
        user = await User.findById(identifier).exec();
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { _id, first_name, last_name, email, phone_number, role } = user;
      res.json({
        _id,
        first_name,
        last_name,
        email,
        phone_number,
        role,
      });
    } catch (error) {
      console.error("Error finding user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = authController;
