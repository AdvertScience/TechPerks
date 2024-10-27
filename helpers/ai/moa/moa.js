const workflowCrud = require("../workflows/crud");
const modelCrud = require('../models/crud');
var tadaApiCall = require('../../tbApiService');
const agents = {
    "DVWQWRNZ49": require('../agents/openai'),
    "4MXQJdrZ6v": require('../agents/groq'),
    "5m9N0njzqk": require('../agents/anthropic'),
    "4PzQ4GNJGV": require('../agents/openrouter')
};

async function getAgentFunction(agentId) {
    const agent = agents[agentId];
    if (!agent) {
        throw new Error(`No agent found for ID: ${agentId}`);
    }
    return agent;
}

async function executeAgentFunction(agentFunction, role, prompt, temperature, maxTokens, modelId, apiKey) {
    try {
        return await agentFunction(role, prompt, parseFloat(temperature), parseInt(maxTokens), modelId, apiKey);
    } catch (error) {
        throw new Error(`Agent execution failed: ${error.message}`);
    }
}

async function processWorkflow(user, company, workflowId, initialInput) {
    try {
        const workflow = await workflowCrud.readWorkflow(workflowId);
        let currentInput = initialInput;
        let globalSteps = [];

        for (const step of workflow) {
            const stepData = {
                stepId: step.id,
                stepTitle: step.field_72,
                agent: step.field_75_val[0].id,
                model: step.field_107,
                apiKeys: step.field_106,
                systemRole: step.field_74,
                userRole: step.field_91,
                temperature: step.field_78,
                maxTokens: step.field_79,
                helpers: step.field_104.split(","),
                mainModel: step.field_76[0]
            };

            console.log(`Processing step: ${stepData.stepTitle}`);

            // Process helper agents
            const helperResponses = await Promise.all(stepData.helpers.map(async (helperId, index) => {
                const helperModel = await modelCrud.readModel(helperId);
                const helperAgent = await getAgentFunction(helperModel.field_45[0]);
                const helperPrompt = `
                    Previous Steps: ${JSON.stringify(globalSteps)}
                    Current Input: ${currentInput}
                    User Role: ${stepData.userRole}
                    System Role: ${stepData.systemRole}
                `;
                console.log(`Executing helper agent ${index + 1}`);
                return executeAgentFunction(helperAgent, stepData.userRole, helperPrompt, stepData.temperature, stepData.maxTokens, helperModel.field_46, helperModel.field_113);
            }));

            console.log(`Helper responses received: ${helperResponses.length}`);

            // Process main agent to select best helper response
            const mainModel = await modelCrud.readModel(stepData.mainModel);
            const mainAgent = await getAgentFunction(mainModel.field_45[0]);
            const mainPrompt = `
                Previous Steps: ${JSON.stringify(globalSteps)}
                Current Input: ${currentInput}
                System Role: ${stepData.systemRole}
                Helper Responses:
                ${helperResponses.map((resp, index) => `Helper ${index + 1}: ${resp}`).join('\n')}
                
                Based on the helper responses and previous steps, select or combine the best content for this step.
            `;
            console.log('Executing main agent');
            const mainResponse = await executeAgentFunction(mainAgent, stepData.systemRole, mainPrompt, stepData.temperature, stepData.maxTokens, mainModel.field_46, mainModel.field_113);

            globalSteps.push({
                title: stepData.stepTitle,
                helperResponses: helperResponses,
                selectedResponse: mainResponse
            });

            // Update currentInput for the next step
            currentInput = mainResponse;
            console.log(`Step completed. Current input updated.`);
        }

        const url = `https://api.tadabase.io/api/v1/data-tables/6b1rAKQKkA/records`;
        const tbData = {
            field_119: user,
            field_118: workflowId,
            field_115: initialInput,
            field_117: currentInput,
            field_120: "Testing"
        };
        try {
            await tadaApiCall('POST', url, tbData);
            console.log('Tadabase API call completed');
        } catch (apiError) {
            console.error('Error calling Tadabase API:', apiError);
            // Continue execution even if API call fails
        }

        console.log("Final output:", currentInput);  

        if (!currentInput) {
            throw new Error('Workflow completed but produced no output');
        }

        return currentInput;
    } catch (error) {
        console.error('Error in processWorkflow:', error);
        throw error; // Throw the original error for more detailed debugging
    }
}

function validateInput(user, company, workflowId, input) {
    if (!user || typeof user !== 'string') throw new Error('Invalid user');
    if (!company || typeof company !== 'string') throw new Error('Invalid company');
    if (!workflowId || typeof workflowId !== 'string') throw new Error('Invalid workflowId');
    if (!input || typeof input !== 'string') throw new Error('Invalid input');
}

module.exports = async function generateContent(user, company, workflowId, input) {
    try {
        console.log('Starting content generation for:', { user, company, workflowId });
        validateInput(user, company, workflowId, input);
        const result = await processWorkflow(user, company, workflowId, input);
        console.log('Content generation completed. Result:', result);
        return result;  // This will be the final output of the entire workflow
    } catch (error) {
        console.error('Error in generateContent:', error);
        throw error; // Throw the original error for more detailed debugging
    }
}