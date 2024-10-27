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

router.get('/api/models/delete-model/:id', validate, async (req, res) => {
    const modelId = req.params.id;

    try {
        await client.connect();
        const modelsCollection = client.db("techperks").collection("ai_models");

        // Check if the model exists
        let model = await modelsCollection.findOne({ record_id: modelId });

        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }

        // Delete the model
        await modelsCollection.deleteOne({ record_id: modelId });

        // Send a response back
        res.json({
            record_id: modelId,
            status: 'success',
            message: 'Model deleted successfully'
        });

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error deleting model:', error);
        res.status(500).send({
            response: error.message || 'Internal Server Error'
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

module.exports = router;