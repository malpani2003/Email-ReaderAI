require('dotenv').config();
const { OpenAI } = require("openai");

const OPENAI_API_KEY = process.env.OPENAPI_KEY;

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
          content:`Analyze the following email content and categorize it as Interested, Not Interested, or More information needed for the text written in dollar symbols: $${emailContent}$. Also, generate a suitable polite reply and a concise subject for an email based on the provided content. Provide your response in JSON format, structured like this: { "category": "Interest", "reply": "Thank you for your email. We are interested in discussing this further. Best regards.", "subject": "Discussion on [Topic]" }`
          
          // content: `Analyze the following email content and categorize it as Interested, Not Interested, or More information needed for the text written in dollar symbol. Answer should be in among between these three tags and show me only the answer bewteen three tags nothing else than that :$${emailContent}$ and also please generate the best suitable polite reply and subject of email that I can give to them in 10-15 words for that content given to you between the dollar symbol. and write category in which you decide mail content should lie.There should be only three entry one category , reply, subject of email and the content should be in correct Object format Provide your response in JSON format like I have given to you but details should according to text given to you : '{ "category": "More information needed","reply": "Thank you for your email. Could you please provide more details on the information marked with the dollar symbol? This will help us assist you better.Best regards","subject": "Request for Additional Information" }' with closing curly brackets` ,
          
          // content:`Analyze the email content below and categorize it as Interested, Not Interested, or More information needed for the text written in dollar symbol. Respond with one of these tags :$${emailContent}$$ Also, generate a polite reply and a concise subject line for an email based on the provided content (20-30 words). Provide your response in JSON format like I have given to you but details should according to text given to you :
          // {
          //   "category": "More information needed",
          //   "reply": "Thank you for your email. Could you please provide more details on the information marked with the dollar symbol? This will help us assist you better.\n\nBest regards",
          //   "subject": "Request for Additional Information"
          // }`
        },
      ],
      model: "llama-7b-chat",
      max_tokens: 60,
    });
    console.log(chat_completion.choices[0].message.content);
    let response = JSON.parse(chat_completion.choices[0].message.content);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
};


const callFunction = async (emailContent) => {
  try {
    const response = await analyzeEmail(emailContent);
    return response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// const string="Dear Applicant,Thank you for your interest in the Software Developer position at Hiremi and for taking the time to go through our recruitment process.We appreciate the effort you invested in your application. After careful consideration, we regret to inform you that your candidacy was not successful on this occasion.";
// callFunction(string)

module.exports={callFunction}