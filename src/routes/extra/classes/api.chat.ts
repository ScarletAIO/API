import { Configuration, OpenAIApi } from 'openai';
import { saveError } from '../../../functions/logger';
import dbHandler from '../../../database/db.handler';

export default new class GPTChatAPI {
    async processMessage(message: string, user: string): Promise<string> {
        const config = new Configuration({
            apiKey: process.env.OPENAI_API_KEY as string,
        });

        const messageHistory = dbHandler.getUserMessageHistory(user);

        const openai = new OpenAIApi(config);

        let prompt = `The following is a conversation with an AI assistant. The AI can assist with various requests.\n\n${messageHistory}\nHuman:${message}\nAI:`

        const response = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.9,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: ["Human:", "AI:"]
        });

        if (response.status !== 200) {
            console.error(`[GPTChatAPI] Error processing message: ${response.data}`);
            saveError(response.data);
            return "Error processing message";
        } else {
            // @ts-ignore
            const data = response.data.choices[0].text;
            prompt += `AI:${data}\nHuman:`;
            dbHandler.updateUserMessageHistory(user, prompt);
            return data as string;
        }
    }
}