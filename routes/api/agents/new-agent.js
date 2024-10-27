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

router.post('/api/agents/new-agent', validate, async function(req, res, next) {

    const { ai_agent, api_key, status } = req.body;

    if (!ai_agent || !api_key || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(status !== 'Active' && status !== 'Inactive') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try{

        await client.connect();

        let aiAgentExists = await client.db("techperks").collection("ai_agents").findOne({ ai_agent: ai_agent });

        if(aiAgentExists) {
            return res.status(400).json({ message: 'AI agent already exists' });
        }

        const recordID = randomstring.generate(10);

        let newAgent = {
            record_id: recordID,
            ai_agent: ai_agent,
            api_key: api_key,
            status: status
        };

        let result = await client.db("techperks").collection("ai_agents").insertOne(newAgent);

        // Send a response back
        res.json({
            record_id: recordID,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error creating ai agent:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;