require('dotenv').config();
const { OpenAI } = require("openai");


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: "https://api.llama-api.com",
});

const analyzeEmail = async (emailContent) => {
  try {
    const chat_completion = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze the following email content and categorize it as Interested, Not Interested, or More information needed for the text written in dollar symbol. Answer should be in among between these three tags and show me only the answer bewteen three tags nothing else than that :$${emailContent}$.`,
        },
      ],
      model: "llama-7b-chat",
      max_tokens: 60,
    });
    console.log(chat_completion.choices[0].message)
    const response = chat_completion.choices[0].message.content.trim();
    return response;
  } catch (error) {
    console.error("Error analyzing email:", error);
    throw error;
  }
};

const emailContent="You have been Selected for the Role of SDE Intern ."

analyzeEmail(emailContent)
  .then((response) => {
    console.log("Categorized Response:", response.split("$")[1]);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
