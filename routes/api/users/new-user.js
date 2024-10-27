var express = require('express');
var router = express.Router();
var validator = require('validator');
var validate = require("../../../helpers/validate");
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

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

router.post('/api/users/new-user', validate, async (req, res) => {
    
    const { first_name, last_name, email, phone, status, role, password } = req.body;

    if (!first_name || !last_name || !email || !phone || !status || !role || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(status !== 'Active' && status !== 'Inactive' && status !== 'Not Verified') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    if(role !== 'Management' && role !== 'User' && role !== 'Editor') {
        return res.status(400).json({ message: 'Invalid role' });
    }

    if(!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    try{

        await client.connect();

        let emailExists = await client.db("techperks").collection("users").findOne({ email: email });

        if(emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const recordID = randomstring.generate(10);
        let hashedPassword = await hashPassword(password);

        let newUser = {
            record_id: recordID,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email,
            phone: phone,
            status: status.trim(),
            role: role.trim(),
            password: hashedPassword
        };

        let result = await client.db("techperks").collection("users").insertOne(newUser);

        // Send a response back
        res.json({
            record_id: recordID,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error creating user:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;