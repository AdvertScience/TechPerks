var express = require('express');
var router = express.Router();
var validate = require("../../../../helpers/validate");
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

router.post('/api/workflows/steps/new-workflow-step', validate, async function(req, res, next) {

    const { created_by, parent_workflow_id, workflow_step_name, workflow_step_description, ai_model, system_role, user_role, status } = req.body;

    if(!created_by || !parent_workflow_id || !workflow_step_name || !workflow_step_description || !ai_model || !system_role || !user_role || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(status !== 'Active' && status !== 'Inactive') {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try{

        await client.connect();

        let workflowStepExists = await client.db("techperks").collection("workflows_steps").findOne({ workflow_step_name: workflow_step_name });

        if(workflowStepExists) {
            return res.status(400).json({ message: 'Workflow Step already exists' });
        }

        const recordID = randomstring.generate(10);

        let newWorkflowStep = {
            record_id: recordID,
            created_by: created_by,
            parent_workflow_id: parent_workflow_id,
            workflow_step_name: workflow_step_name,
            workflow_step_description: workflow_step_description,
            ai_model: ai_model,
            system_role: system_role,
            user_role: user_role,
            status: status
        };

        let result = await client.db("techperks").collection("workflows_steps").insertOne(newWorkflowStep);

        // Send a response back
        res.json({
            record_id: recordID,
            status: 'success'
        });

    } catch (error) {

        // Log error and send a generic error response
        console.error('Error creating workflow step:', error);
        res.status(500).send({
            response: error
        });

    } finally {

        // Ensures that the client will close when you finish/error
        await client.close();

    }

});

module.exports = router;