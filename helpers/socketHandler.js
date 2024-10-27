var path = require('path');
// const workflowCrud = require("./ai/workflows/crud");
// const modelCrud = require('./ai/models/crud');
var tadaApiCall = require(path.join(__dirname, 'tbApiService'));
const agents = {
    "DVWQWRNZ49": require('./ai/agents/openai'),
    "4MXQJdrZ6v": require('./ai/agents/groq'),
    "5m9N0njzqk": require('./ai/agents/anthropic'),
    "4PzQ4GNJGV": require('./ai/agents/openrouter')
};

async function getAgentFunction(agentId) {var path = require('path');
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

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Confirm the connection with the client
    socket.emit('connection-success', {
      message: 'Connection established successfully',
    });

    // Handle custom events from clients
    // socket.on('client-event', (data) => {
    //   console.log('Received from client: ', data + ' Socket: ' + socket.id);

    //   // Emit an event back to the client as a response
    //   socket.emit('server-response', { message: 'Data received', data: data });
    // });

    // // Handle 'generate-content' event
    // socket.on('generate-content', async (data) => {
    //   // Validate input function
    //   function validateInput(user, company, workflowId, input) {
    //     if (!user || typeof user !== 'string') {
    //       socket.emit('server-response', { message: 'Error', data: 'Invalid user' });
    //       return false;
    //     }
    //     if (!company || typeof company !== 'string') {
    //       socket.emit('server-response', { message: 'Error', data: 'Invalid company' });
    //       return false;
    //     }
    //     if (!workflowId || typeof workflowId !== 'string') {
    //       socket.emit('server-response', { message: 'Error', data: 'Invalid workflowId' });
    //       return false;
    //     }
    //     if (!input || typeof input !== 'string') {
    //       socket.emit('server-response', { message: 'Error', data: 'Invalid input' });
    //       return false;
    //     }
    //     return true;
    //   }

    //   // Check if the input is valid
    //   if (!validateInput(data.user, data.company, data.workflowId, data.input)) {
    //     return; // Stop execution if input is invalid
    //   }

    //   socket.emit('server-response', { message: 'Success', data: 'Valid Data' });

    //   // Process workflow function
    //   async function processWorkflow(socket, user, company, workflowId, initialInput) {

    //     socket.emit('server-response', { message: 'Processing workflow', data: workflowId });

    //     try {

    //       const workflow = await workflowCrud.readWorkflow(workflowId);

    //       let currentInput = initialInput;
    //       let globalSteps = [];

    //       for (const step of workflow) {
    //         const stepData = {
    //           stepId: step.id,
    //           stepTitle: step.field_72,
    //           agent: step.field_75_val[0].id,
    //           model: step.field_107,
    //           apiKeys: step.field_106,
    //           systemRole: step.field_74,
    //           userRole: step.field_91,
    //           temperature: step.field_78,
    //           maxTokens: step.field_79,
    //           helpers: step.field_104.split(","),
    //           mainModel: step.field_76[0]
    //         };

    //         // Emit progress to client
    //         socket.emit('server-response', { message: `Processing step: ${stepData.stepTitle}` });

    //         // Process helper agents
    //         const helperResponses = await Promise.all(stepData.helpers.map(async (helperId, index) => {
    //           const helperModel = await modelCrud.readModel(helperId);
    //           const helperAgent = await getAgentFunction(helperModel.field_45[0]);
    //           const helperPrompt = `
    //             Previous Steps: ${JSON.stringify(globalSteps)}
    //             Company Profile: ["..."]
    //             Current Input: ${currentInput}
    //             User Role: ${stepData.userRole}
    //             System Role: ${stepData.systemRole}
    //           `;
    //           // Emit progress to client
    //           socket.emit('server-response', { message: `Executing helper agent ${index + 1}` });
    //           return executeAgentFunction(helperAgent, stepData.userRole, helperPrompt, stepData.temperature, stepData.maxTokens, helperModel.field_46, helperModel.field_113);
    //         }));

    //         // Emit progress to client
    //         socket.emit('server-response', { message: `Helper responses received: ${helperResponses.length}` });

    //         // Process main agent to select best helper response
    //         const mainModel = await modelCrud.readModel(stepData.mainModel);
    //         const mainAgent = await getAgentFunction(mainModel.field_45[0]);
    //         const mainPrompt = `
    //           Previous Steps: ${JSON.stringify(globalSteps)}
    //           Current Input: ${currentInput}
    //           System Role: ${stepData.systemRole}
    //           Helper Responses:
    //           ${helperResponses.map((resp, index) => `Helper ${index + 1}: ${resp}`).join('\n')}
              
    //           Based on the helper responses and previous steps, select or combine the best content for this step.
    //         `;
    //         // Emit progress to client
    //         socket.emit('server-response', { message: 'Executing main agent' });
    //         const mainResponse = await executeAgentFunction(mainAgent, stepData.systemRole, mainPrompt, stepData.temperature, stepData.maxTokens, mainModel.field_46, mainModel.field_113);
    //         socket.emit('server-response', { message: `Main response: ${mainResponse}` });
    //         globalSteps.push({
    //           title: stepData.stepTitle,
    //           helperResponses: helperResponses,
    //           selectedResponse: mainResponse
    //         });

    //         // Update currentInput for the next step
    //         currentInput = mainResponse;
    //         // Emit progress to client
    //         socket.emit('server-response', { message: `Step completed. Current input updated.` });
    //       }

    //       const url = `https://api.tadabase.io/api/v1/data-tables/6b1rAKQKkA/records`;
    //       const tbData = {
    //         field_119: user,
    //         field_118: workflowId,
    //         field_115: initialInput,
    //         field_117: currentInput,
    //         field_120: "Testing"
    //       };
    //       try {
    //         await tadaApiCall('POST', url, tbData);
    //         // Emit progress to client
    //         socket.emit('server-response', { message: 'Tadabase API call completed' });
    //       } catch (apiError) {
    //         // Emit error to client but continue execution
    //         socket.emit('server-response', { message: 'Error calling Tadabase API', data: apiError.message });
    //       }

    //       // Emit final output to client
    //       socket.emit('server-response', { message: 'Workflow completed successfully', data: currentInput });

    //       if (!currentInput) {
    //         throw new Error('Workflow completed but produced no output');
    //       }

    //       return currentInput;
    //     } catch (error) {
    //       // Emit error to client
    //       socket.emit('server-response', { message: 'Error in processWorkflow', data: error.message });
    //       throw error; // Re-throw the error to be caught in the calling function
    //     }
    //   }

    //   processWorkflow(socket, data.user, data.company, data.workflowId, data.input);

    // });

    // // Handle client disconnection
    // socket.on('disconnect', (reason) => {
    //   console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    // });

    // // Handle socket errors
    // socket.on('error', (err) => {
    //   console.error('Socket error:', err);
    // });
  });
};