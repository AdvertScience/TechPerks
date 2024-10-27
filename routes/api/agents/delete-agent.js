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

router.get('/api/agents/delete-agent/:id', validate, async (req, res) => {
    const agentId = req.params.id;

    try {
        await client.connect();
        const agentsCollection = client.db("techperks").collection("ai_agents");

        // Check if the agent exists
        let agent = await agentsCollection.findOne({ record_id: agentId });

        if (!user) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        // Delete the agent
        await agentsCollection.deleteOne({ record_id: agentId });

        // Send a response back
        res.json({
            record_id: agentId,
            status: 'success',
            message: 'Agent deleted successfully'
        });

    } catch (error) {
        // Log error and send a generic error response
        console.error('Error deleting agent:', error);
        res.status(500).send({
            response: error.message || 'Internal Server Error'
        });
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
});

module.exports = router;