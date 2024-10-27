var express = require('express');
var router = express.Router();
var validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

router.post('/api/users/login-user', async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    await client.connect();
    const usersCollection = client.db("techperks").collection("users");

    // Find the user by email
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      // Do not reveal if the email is incorrect
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Do not reveal if the password is incorrect
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the user's status is Active
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'User account is not active' });
    }

    // Generate JWT token
    const tokenPayload = {
      record_id: user.record_id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Send the token and user info to the client
    res.json({
      status: 'success',
      token: token,
      user: {
        record_id: user.record_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({
      response: error.message || 'Internal Server Error',
    });
  } finally {
    await client.close();
  }
});

module.exports = router;