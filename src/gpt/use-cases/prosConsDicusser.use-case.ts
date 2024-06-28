import { response } from "express";
import OpenAI from "openai";

interface Options {
  prompt: string;
}

export const prosConsDicusserUseCase = async ( openai: OpenAI, { prompt }: Options ) => {

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Se te dará una pregunta y tu tarea es dar una respuesta con pros y contras,
                la respuesta debe de ser en formato markdown,
                los pros y contras deben de estar en una lista,

        `, //comportamiento inicial
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-4o",
    temperature: 0.8,
    max_tokens: 500,

  });
  // console.log("🚀 ~ prosConsDicusserUseCase ~ completion:", completion)

  return completion.choices[0].message;

};
