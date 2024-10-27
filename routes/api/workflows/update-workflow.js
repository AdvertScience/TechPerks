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

router.post('/api/workflows/update-workflow/:id', validate, async function(req, res, next) {

    const record_id = req.params.id;

    try{

        await client.connect();

        // Check if the workflow exists
        let workflowExists = await client.db("techperks").collection("workflows").findOne({ record_id: record_id });

        if(!workflowExists) {
            return res.status(400).json({ message: 'Workflow not found!' });
        }

        // Build the updatedWorkflow object dynamically
        let updatedWorkflow = {};

        if (req.body.created_by !== undefined) updatedWorkflow.created_by = req.body.created_by;

        if (req.body.workflow_name !== undefined) {
            // Check if another workflow with the same name exists
            let nameExists = await client.db("techperks").collection("workflows").findOne({ 
                workflow_name: req.body.workflow_name, 
                record_id: { $ne: record_id }
            });
            if (nameExists) {
                return res.status(400).json({ message: 'Workflow name already exists' });
            }
            updatedWorkflow.workflow_name = req.body.workflow_name;
        }

        if (req.body.workflow_description !== undefined) updatedWorkflow.workflow_description = req.body.workflow_description;

        if (req.body.status !== undefined) {
            if(req.body.status !== 'Active' && req.body.status !== 'Inactive') {
                return res.status(400).json({ message: 'Invalid status' });
            }
            updatedWorkflow.status = req.body.status;
        }

        // Check if there are fields to update
        if (Object.keys(updatedWorkflow).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Update the workflow
        let result = await client.db("techperks").collection("workflows").updateOne(
            { record_id: record_id },
            { $set: updatedWorkflow }
        );

        // Send a response back
        res.json({
            record_id: record_id,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error updating workflow:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;