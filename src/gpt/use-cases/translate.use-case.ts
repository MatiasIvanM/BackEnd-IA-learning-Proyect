import OpenAI from "openai";

interface Options {
  prompt: string;
  lang: string;
}

export const translateUseCase = async (openai: OpenAI, { prompt, lang }: Options) => {
  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Traduce el siguiente texto al idioma ${lang}:${prompt}`, //comportamiento inicial
      },
    ],
    temperature: 0.2,

  });

};
