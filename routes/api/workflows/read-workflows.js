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

router.get('/api/workflows/read-workflows', validate, async (req, res) => {
    try {
        await client.connect();

        // Build a query object from req.query
        let query = {};

        // Iterate over req.query to build the query object
        for (let key in req.query) {
            let value = req.query[key];

            // Parse numeric or boolean values where applicable
            if (!isNaN(value)) {
                value = Number(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                value = value.toLowerCase() === 'true';
            }

            query[key] = value;
        }

        // Find workflows based on the query
        let workflows = await client.db("techperks").collection("workflows").find(query).toArray();

        if (!workflows || workflows.length === 0) {
            return res.status(404).json({ message: 'Workflows not found' });
        }

        // Send the filtered workflows back
        res.json(workflows);

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error reading workflow:', error);
        res.status(500).send({
            response: error
        });
    } finally {
        // Ensure the client will close when finished or on error
        await client.close();
    }
});

module.exports = router;