import OpenAI from "openai";

interface Options {
  prompt: string;
}

export const orthographyChecUseCase = async (
  openai: OpenAI,
  options: Options
) => {
  const { prompt } = options;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Te seran proveídos texto en español con posibles errores ortogrpáficos y gramaticales,
        Las palabras usadas deben de existir en el español, no se permiten palabras inventadas.
        Debes responder en formato JSON,
        Tu tarea es corregir y retornar información de las soluciones y el texto original con sus correcciones,
        También debes de dar un porcentaje de aciertos por el usuario,
        
        Si no hay errreos, debes retornar un mensaje de felicitaciones.
        
        Ejemplo de salida:
        {
            userScore: number,
            errors:string[], // ['error -> solución']
            prompCorregida:string
            message: string, // Usa emojis y texto para felicitar al usuario
        }

        `, //comportamiento inicial
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 100,
    // Formatea las trspuestas y asegura de que siempre sean json pero no todos los modelos soportan esta forma de enviar las respuestas 
    // response_format: {
    //     type: "json_object"
    // }
  });

  return JSON.parse(completion.choices[0].message.content);
};
