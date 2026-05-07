import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function classifyTicket(
  text: string
) {
  const response =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content:
            "Classify support ticket into categories.",
        },

        {
          role: "user",
          content: text,
        },
      ],
    });

  return response.choices[0].message.content;
}