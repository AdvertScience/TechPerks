var express = require('express');
var router = express.Router();

const openai = require('../../../helpers/ai/agents/openai');
const groqAi = require('../../../helpers/ai/agents/groq');
const anthropic = require('../../../helpers/ai/agents/anthropic');
const openrouter = require('../../../helpers/ai/agents/openrouter');

const validate = require('../../../helpers/validate');

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

router.post('/api/models/model-chat/:id', validate, async function(req, res, next) {

    const { systemPrompt, userPrompt, temperature, tokens } = req.body;

    const modelId = req.params.id;

    if (!systemPrompt || !userPrompt || !temperature || !tokens) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    if (!modelId) {
        return res.status(400).json({ message: 'Model ID is required!' });
    }

    try{

        await client.connect();

        let aiModelExists = await client.db("techperks").collection("ai_models").findOne({ record_id: modelId });

        if(!aiModelExists) {
            return res.status(400).json({ message: 'AI model not found!' });
        }

        let aiAgentData = await client.db("techperks").collection("ai_agents").findOne({ record_id: aiModelExists.ai_agent });

        switch (aiAgentData.record_id) {
            case "YyeTpzYYwt":
                agentFunction = openai;
                break;
            case "yqZAkZWr4r":
                agentFunction = groqAi;
                break;
            case "igng6SZSIV":
                agentFunction = anthropic;
                break;
            case "wAdT7MCyMf":
                agentFunction = openrouter;
                break;
            default:
                return res.status(400).send('No agent found');
        }

        const response = await agentFunction(systemPrompt, userPrompt, parseFloat(temperature), parseInt(tokens), aiModelExists.ai_model_id, aiAgentData.api_key);

        res.status(200).send({
            ai_agent: aiAgentData.ai_agent,
            ai_model: aiModelExists.ai_model,
            response: response
        });

    } catch (error) {   
        res.status(500).send({
            response: error
        });
    } finally {
        await client.close();
    }

});

module.exports = router;