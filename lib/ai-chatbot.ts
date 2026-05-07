import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askAI(
  question: string
) {
  const completion =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content:
            "You are an after-sales CRM assistant.",
        },

        {
          role: "user",
          content: question,
        },
      ],
    });

  return completion.choices[0].message.content;
}