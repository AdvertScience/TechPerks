const Groq = require("groq-sdk");

module.exports = async function groqAi(systemPrompt, userPrompt, temperature, tokens, modelUrl, apiKey) {
    const groq = new Groq({ apiKey: apiKey });
    
    try {
        const chatCompletion = await getGroqChatCompletion(groq, systemPrompt, userPrompt, temperature, tokens, modelUrl);
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
        return error.message || "An error occurred while processing the request.";
    }
};

const getGroqChatCompletion = async (groq, systemPrompt, userPrompt, temperature, tokens, model) => {
    try {
        return await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: model,
            temperature: temperature,
            max_tokens: tokens
        });
    } catch (error) {
        throw new Error(error.message || "Failed to get completion from Groq API.");
    }
};