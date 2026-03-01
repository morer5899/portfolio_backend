const openai=require("openai");

const OpenAI = new openai({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports=OpenAI;