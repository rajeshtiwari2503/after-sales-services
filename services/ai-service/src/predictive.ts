import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function predictFailure(
  machineData: any
) {
  const response =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content:
            "Predict equipment failure risk.",
        },

        {
          role: "user",
          content: JSON.stringify(
            machineData
          ),
        },
      ],
    });

  return response.choices[0].message.content;
}