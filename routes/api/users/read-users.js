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

router.get('/api/users/read-users', validate, async (req, res) => {

    try {
        await client.connect();

        // Build a query object from req.query
        let query = {};

        // Iterate over req.query and build the query object
        for (let key in req.query) {
            let value = req.query[key];

            // Try to parse value to number or boolean if applicable
            if (!isNaN(value)) {
                value = Number(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                value = (value.toLowerCase() === 'true');
            }

            query[key] = value;
        }

        let readUser = await client.db("techperks").collection("users").find(query).toArray();

        if (!readUser || readUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the filtered users back
        res.send(readUser);

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error reading user:', error);
        res.status(500).send({
            response: error
        });

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }

});

module.exports = router;