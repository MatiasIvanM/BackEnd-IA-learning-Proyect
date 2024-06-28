import { response } from "express";
import OpenAI from "openai";

interface Options {
  prompt: string;
}

export const prosConsDicusserStreamUseCase = async ( openai: OpenAI, { prompt }: Options ) => {

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:  `
          Se te dará una pregunta y tu tarea es dar una respuesta con pros y contras,
          la respuesta debe de ser en formato markdown,
          los pros y contras deben de estar en una lista,

        `, //comportamiento inicial
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.8,
    max_tokens: 500,
  });

};
