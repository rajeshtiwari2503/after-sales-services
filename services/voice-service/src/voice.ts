import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function speechToText(
  audioFile: File
) {
  return openai.audio.transcriptions.create({
    file: audioFile,

    model: "whisper-1",
  });
}