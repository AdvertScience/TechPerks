var express = require('express');
var router = express.Router();
var validate = require("../../../helpers/validate");
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

router.post('/api/agents/update-agent/:id', validate, async function(req, res, next) {

    const record_id = req.params.id;

    try{

        await client.connect();

        let aiAgentExists = await client.db("techperks").collection("ai_agents").findOne({ record_id: record_id });

        if(!aiAgentExists) {
            return res.status(400).json({ message: 'AI agent not found!' });
        }

        // Build the updatedAgent object dynamically
        let updatedAgent = {};

        if (req.body.ai_agent !== undefined) {
            updatedAgent.ai_agent = req.body.ai_agent;
        }

        if (req.body.api_key !== undefined) {
            updatedAgent.api_key = req.body.api_key;
        }

        if (req.body.status !== undefined) {
            if(req.body.status !== 'Active' && req.body.status !== 'Inactive') {
                return res.status(400).json({ message: 'Invalid status' });
            }
            updatedAgent.status = req.body.status;
        }

        // Check if there are fields to update
        if (Object.keys(updatedAgent).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        let result = await client.db("techperks").collection("ai_agents").updateOne(
            { record_id: record_id },
            { $set: updatedAgent }
        );

        // Send a response back
        res.json({
            record_id: record_id,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error updating ai agent:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;