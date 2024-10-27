const OpenAI = require('openai');

module.exports = async function openai(systemPrompt, userPrompt, temperature, tokens, modelUrl, apiKey) {

    // Initialize the OpenAI client with the dynamic API key
    const client = new OpenAI({
        apiKey: apiKey,
    });

    const params = {
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        model: modelUrl,
        max_tokens: tokens,
        temperature: temperature
    };

    try {
        const chatCompletion = await client.chat.completions.create(params);
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        return error.message;
    }
};