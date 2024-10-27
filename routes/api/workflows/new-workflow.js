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

router.post('/api/workflows/new-workflow', validate, async function(req, res, next) {

    const { created_by, workflow_name, workflow_description, status } = req.body;

    if (!created_by || !workflow_name || !workflow_description || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(status !== 'Active' && status !== 'Inactive') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try{

        await client.connect();

        let workflowExists = await client.db("techperks").collection("workflows").findOne({ workflow_name: workflow_name });

        if(workflowExists) {
            return res.status(400).json({ message: 'Workflow already exists' });
        }

        const recordID = randomstring.generate(10);

        let newWorkflow = {
            record_id: recordID,
            created_by: created_by,
            workflow_name: workflow_name,
            workflow_description: workflow_description,
            status: status
        };

        let result = await client.db("techperks").collection("workflows").insertOne(newWorkflow);

        // Send a response back
        res.json({
            record_id: recordID,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error creating workflow:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;