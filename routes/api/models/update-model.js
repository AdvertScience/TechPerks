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

router.post('/api/models/update-model/:id', validate, async function(req, res, next) {

    const record_id = req.params.id;

    try{

        await client.connect();

        let aiModelExists = await client.db("techperks").collection("ai_models").findOne({ record_id: record_id });

        if(!aiModelExists) {
            return res.status(400).json({ message: 'AI model not found!' });
        }

        // Build the updatedModel object dynamically
        let updatedModel = {};

        if (req.body.ai_agent !== undefined) updatedModel.ai_agent = req.body.ai_agent;
        if (req.body.ai_model !== undefined) updatedModel.ai_model = req.body.ai_model;
        if (req.body.ai_model_description !== undefined) updatedModel.ai_model_description = req.body.ai_model_description;
        if (req.body.ai_model_id !== undefined) updatedModel.ai_model_id = req.body.ai_model_id;
        if (req.body.temperature !== undefined) updatedModel.temperature = req.body.temperature;
        if (req.body.max_tokens !== undefined) updatedModel.max_tokens = req.body.max_tokens;

        // Check if there are fields to update
        if (Object.keys(updatedModel).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        let result = await client.db("techperks").collection("ai_models").updateOne(
            { record_id: record_id },
            { $set: updatedModel }
        );

        // Send a response back
        res.json({
            record_id: record_id,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error updating ai model:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;