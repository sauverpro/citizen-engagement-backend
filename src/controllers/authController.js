import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { models } from "../config/database.js";

export async function register(req, res) {
  try {
    const { name, email, password, role = "citizen", agencyId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if the email already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // if the role is 'agency', agencyId must be provided
    if (role === "agency" && req.body.agencyId) {
      // save the user with agencyId
      const agency = await models.Agency.findByPk(agencyId);
      if (!agency) {
        return res.status(400).json({ message: "Invalid Agency ID" });
      }
      const user = await models.User.create({
        name,
        email,
        password: hashedPassword,
        role,
        agencyId
      });
      return res.status(201).json({ user });
    } 
    const user = await models.User.create({
      name,
      email,
      password: hashedPassword,
      role
    });
    res.status(201).json({ user });
  } catch (err) {
    console.log(err);

    res
      .status(400)
      .json({ message: "Registration failed", error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await models.User.findOne({ 
      where: { email },
      include: [{
        model: models.Agency,
        as: 'agency',
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        agencyId: user.agencyId,
        agencyName: user.agency?.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        agencyName: user.agency?.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ message: "Login failed", error: err.message });
  }
}
