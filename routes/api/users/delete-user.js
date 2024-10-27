var express = require('express');
var router = express.Router();
var validate = require("../../../helpers/validate");

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

router.post('/api/users/delete-user/:id', validate, async (req, res) => {
    const userId = req.params.id;

    try {
        await client.connect();
        const usersCollection = client.db("techperks").collection("users");

        // Check if the user exists
        let user = await usersCollection.findOne({ record_id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await usersCollection.deleteOne({ record_id: userId });

        // Send a response back
        res.json({
            record_id: userId,
            status: 'success',
            message: 'User deleted successfully'
        });

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error deleting user:', error);
        res.status(500).send({
            response: error.message || 'Internal Server Error'
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

module.exports = router;