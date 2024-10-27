const OpenAI = require('openai');

module.exports = async function openrouter(systemPrompt, userPrompt, temperature, tokens, modelUrl, apiKey) {

    // Initialize the OpenAI client with the dynamic API key
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey
    });

    try {
        const completion = await openai.chat.completions.create({
            model: modelUrl, // Corrected to use modelUrl
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: temperature,
            max_tokens: tokens
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        return error.message || "An error occurred while processing the request.";
    }
};