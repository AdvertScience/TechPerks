var express = require('express');
var router = express.Router();
var validator = require('validator');
var validate = require("../../../helpers/validate");
const bcrypt = require('bcrypt');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function hashPassword(plainPassword) {
  const saltRounds = 10; // Adjust the cost factor as needed
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

router.post('/api/users/update-user/:id', validate, async (req, res) => {
    const userId = req.params.id;

    // Build an object of fields to update
    let updatedUserFields = {};

    try {
        await client.connect();
        const usersCollection = client.db("techperks").collection("users");

        // Check if the user exists
        let user = await usersCollection.findOne({ record_id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { first_name, last_name, email, phone, status, role, password } = req.body;

        // Handle first_name
        if (first_name !== undefined) {
            updatedUserFields.first_name = first_name.trim();
        }

        // Handle last_name
        if (last_name !== undefined) {
            updatedUserFields.last_name = last_name.trim();
        }

        // Handle email
        if (email !== undefined) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({ message: 'Invalid email' });
            }

            // Check if the email already exists in another user
            let emailExists = await usersCollection.findOne({ email: email, record_id: { $ne: userId } });

            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            updatedUserFields.email = email;
        }

        // Handle phone
        if (phone !== undefined) {
            updatedUserFields.phone = phone;
        }

        // Handle status
        if (status !== undefined) {
            if(status !== 'Active' && status !== 'Inactive' && status !== 'Not Verified') {
                return res.status(400).json({ message: 'Invalid status' });
            }
            updatedUserFields.status = status.trim();
        }

        // Handle role
        if (role !== undefined) {
            if(role !== 'Management' && role !== 'User' && role !== 'Editor') {
                return res.status(400).json({ message: 'Invalid role' });
            }
            updatedUserFields.role = role.trim();
        }

        // Handle password
        if (password !== undefined) {
            let hashedPassword = await hashPassword(password);
            updatedUserFields.password = hashedPassword;
        }

        // Check if there are fields to update
        if (Object.keys(updatedUserFields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Update the user
        await usersCollection.updateOne(
            { record_id: userId },
            { $set: updatedUserFields }
        );

        // Send a response back
        res.json({
            record_id: userId,
            status: 'success'
        });

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error updating user:', error);
        res.status(500).send({
            response: error.message || 'Internal Server Error'
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

module.exports = router;