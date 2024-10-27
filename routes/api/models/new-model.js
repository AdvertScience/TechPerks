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

router.post('/api/models/new-model', validate, async function(req, res, next) {

    const { ai_agent, ai_model, ai_model_description, ai_model_id, temperature, max_tokens } = req.body;

    if (!ai_agent || !ai_model || !ai_model_description || !ai_model_id || !temperature || !max_tokens) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try{

        await client.connect();

        let aiModelExists = await client.db("techperks").collection("ai_models").findOne({ ai_model: ai_model });

        if(aiModelExists) {
            return res.status(400).json({ message: 'AI model already exists' });
        }

        const recordID = randomstring.generate(10);

        let newModel = {
            record_id: recordID,
            ai_agent: ai_agent,
            ai_model: ai_model,
            ai_model_description: ai_model_description,
            ai_model_id: ai_model_id,
            temperature: temperature,
            max_tokens: max_tokens
        };

        let result = await client.db("techperks").collection("ai_models").insertOne(newModel);

        // Send a response back
        res.json({
            record_id: recordID,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error creating ai model:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;