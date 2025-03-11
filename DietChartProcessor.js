import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

class DietChartProcessor {
    constructor() {
        if (!process.env.HF_API_KEY) {
            throw new Error('HF_API_KEY is not set in environment variables');
        }
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // this.openai = new OpenAI({
        //     baseURL: 'https://api.deepseek.com',
        //     apiKey: process.env.GEMINI_API_KEY
        // });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async extractMeals(dietText, maxRetries = 5) {


        const prompt = `You are a helpful assistant that extracts meals from diet charts, search for recipes, get ingredients and gives final list of grocery items needed for the duration of diet chart.
            If Salt is being used multiple times with different food items then in the array it'll come only once but the quantity will depend on it's usage.
            If suggested water intake is 4 liters a day then it should be 40 liters in total.
            If item is Seasonal Vegetables or Salad then check the seasonal vegetable and Salad options as per the current date and season in India and add in the list.
            If it's Dal then add options of Dal as differne options like Arhar Dal, Moon Dal etc. as seperate item in array with quantity.
            If it's option like Beetroot Rice or Paneer Pulao or Bhel Puri then get ingredients and don't give something like Beetroot Rice Ingredients (Rice, Beetroot, etc)
            If it's X food options then give proper ingrdients in the array with quantity and not X Ingredients (A, B, C). So for example, Palak Soup Ingredients (Spinach, Vegetables, Spices) or Paneer Thecha Ingredients (Paneer, Spices, etc.) or similar pattern is not acceptable.
            In the output item should not be Masala oats ingredients (spices, etc.) but Salt, Chilli, Oats, Peas or whatever is there in the ingrdients list of receipe.
            Task: This is a diet chart which has diet plan for 10 days in a table format. Give me the list of ingredients required for the whole duration of diet plan so that I can order groceries and format them as JSON array.
            Output format must be: [{"item":"", "quantity":"", "category":"", requiredFor:""}]
            Quantity should be in grams or millilitre or kilogram or liter and not in the format of tsp or bunch or cup or bowl etc.
            Minimum quantity should be 50 g and not less than that. If quantity is more then 1000 g then covert it to 1 kg and if more than 1000 ml then 1 lt.
            Here is the diet chart:
            ${dietText}
            Don't add any additional text or disclaimer or warning in the final output. Give only array of items with quantity.`;


        try {
            const response = await this.model.generateContent(prompt);
            console.log("❌response", response)
            console.log("❌response", response?.response?.text())
            const cleanedReponse = response?.response?.text()?.replace(/```(json)?\n?/g, '')?.replace(/```/g, ''); //remove the ``` and optional json and newline.
            // const cleanedReponse = response?.response?.text().replace(/^\`\`\`json|\`\`\`$/g, '').trim();

            if (!cleanedReponse) {
                throw new Error(`HTTP error!`);
            }
            return JSON.parse(cleanedReponse)
        } catch (error) {
            console.error('failed:', error);
        }


        return null;
    }
    async processDietChart(dietText) {
        const processor = new DietChartProcessor();

        try {
            // Your PDF text from previous example
            const groceryList = await processor.extractMeals(dietText);
            console.log('Extracted groceryList:', groceryList);
            return groceryList;
        } catch (error) {
            console.error('Processing failed:', error);
        }
    }
}

export default DietChartProcessor;