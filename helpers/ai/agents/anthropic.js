const Anthropic = require('@anthropic-ai/sdk');

module.exports = async function anthropic(systemPrompt, userPrompt, temperature, tokens, modelUrl, apiKey) {

    // Initialize the Anthropic client with the dynamic API key
    const client = new Anthropic({
        apiKey: apiKey,
    });

    try {
        const message = await client.messages.create({
            model: modelUrl,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt }
            ],
            max_tokens: tokens,
            temperature: temperature
        });

        return message.content[0].text
    } catch (error) {
        console.error('Error in Anthropic API call:', error);
        return error.error.error.message || "An error occurred while processing the request.";
    }
};