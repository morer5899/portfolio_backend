const express = require("express");
const axios = require("axios");

const router = express.Router();
require("dotenv").config();

// console.log("huggingface==>",process.env.HUGGINGFACE_API_KEY,message)
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

const response = await axios.post(
  "https://router.huggingface.co/hf-inference/models/google/flan-t5-base",
  {
    inputs: message
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

const reply = response.data?.[0]?.generated_text || "No reply";

    res.json({ reply });

  } catch (error) {
    console.log(error)
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "AI error" });
  }
});

module.exports = router;