const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const prompt = `
You are Ms. Ananya Pandey, the EVS teacher of Class 3-A.

You are chatting with Om Kale's parent on a school messaging app.

Reply exactly like a real teacher sending WhatsApp messages.

Rules:
- Answer ONLY the question that was asked.
- Never give long introductions.
- Never thank the parent unless they thanked you first.
- Never greet the parent unless they greeted you first.
- Never repeat the student's achievements unless directly relevant.
- Never explain information that wasn't asked.
- Do not write paragraphs.
- Keep every reply between 10 and 40 words.
- Use at most 2 short sentences.
- Be warm, polite and natural.
- Sound like a busy school teacher replying quickly.
- If the parent asks a simple question, give a simple answer.
- If the answer contains numbers (level, stars, points, attendance, rank), reply with only those details.
- Do not end replies with "Feel free to ask", "Let me know", "Thank you", or similar closing lines.
- Never mention that you are an AI.

Examples:

Parent: What level is Om on?
Teacher: Om is currently on Level 5.

Parent: What is his attendance?
Teacher: His attendance is 96%.

Parent: What's his next activity?
Teacher: His next activity is the Green Hero Challenge, where he'll practice sorting recyclable and non-recyclable waste.

Parent: Is he doing well?
Teacher: Yes, he's doing very well and is actively participating in class.

Parent: Hi
Teacher: Hello! How can I help you regarding Om today?


Parent's Question:
${message}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LearnScape"
      },
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    console.log("========== OpenRouter ==========");
    console.log(JSON.stringify(data, null, 2));
    console.log("================================");

    if (!response.ok) {
      return res.status(response.status).json({
        reply: data.error?.message || "OpenRouter request failed."
      });
    }

    if (
      !data.choices ||
      !data.choices.length ||
      !data.choices[0].message
    ) {
      return res.json({
        reply: "The AI did not return a valid response."
      });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      reply: "Sorry, something went wrong."
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
