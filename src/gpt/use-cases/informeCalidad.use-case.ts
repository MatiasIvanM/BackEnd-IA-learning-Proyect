import OpenAI from 'openai';
import * as fs from 'fs';

interface Options {
  prompt: string;
  audioFile: Express.Multer.File;
}

export const informeCalidadUseCase = async (openAI: OpenAI, options: Options) => {
  const { prompt, audioFile } = options;

  const transcription = await openAI.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(audioFile.path),
    prompt: prompt,
    language: 'es',
    response_format: 'verbose_json',
  });

  const transcribedText = transcription.text;

  const analysisStream = await openAI.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `Sos un auditor experto en calidad de llamadas en frío de un contact center BPO. Tu enfoque combina análisis técnico, criterio comercial y comprensión humana del contexto.

Tu tarea es analizar transcripciones de llamadas entre asesores comerciales y clientes potenciales. Evaluá los siguientes 10 ítems de calidad, interpretando no solo lo que se dice literalmente, sino también el tono, la intención y la dinámica general de la conversación.

1. **Apertura**: ¿El asesor se presenta de forma clara, atractiva y comercial?
2. **Indagación**: ¿Hace preguntas relevantes para comprender las necesidades reales del cliente?
3. **Argumentación**: ¿Utiliza la información del cliente para justificar la oferta con sentido?
4. **Negociación**: ¿Presenta el producto de manera persuasiva, resaltando beneficios?
5. **Manejo de objeciones**: ¿Responde con seguridad, empatía y persistencia ante rechazos?
6. **Cierre**: ¿Busca avanzar con seguridad hacia el cierre de venta y la verificación?
7. **Empatía/Calidez**: ¿Demuestra escucha activa, cordialidad y conexión humana?
8. **Seguridad de datos**: ¿Solicita correctamente los datos clave, con estructura y cuidado?
9. **Repaso**: ¿Recapitula claramente condiciones comerciales, entrega y próximos pasos?
10. **Proceso sin demoras**: ¿Evita pausas innecesarias, dudas o desorganización en la gestión?

Para cada ítem:
- Indica si **se cumple**, **no se cumple** o **no aplica**.
- Si algún ítem **no puede evaluarse**, asignale **"no aplica"** y consideralo como un cumplimiento del **100%** para el promedio.
- Asigna un **puntaje entre 0% y 100%**, sin extremos automáticos.
- Justificá brevemente el puntaje con fragmentos representativos o descripciones de lo observado.

Al final, generá un **resumen general** que incluya:
- ✅ Promedio general de cumplimiento (%).
- 🟢 Fortalezas detectadas.
- ⚠️ Oportunidades de mejora.
- 📌 Recomendaciones concretas para mejorar futuras llamadas.

⚠️ Si hay ambigüedad o falta de datos, priorizá la interpretación contextual. Evitá ser excesivamente literal. Sé profesional, claro y objetivo, pero también humano.
      `,
      },
      {
        role: 'user',
        content: `Transcripción:\n\n${transcribedText}${prompt ? `\n\nInstrucciones adicionales del analista:\n${prompt}` : ''}`,
      },
    ],
    temperature: 0.3,
  });

  return {
    transcription,
    analysisStream, // 🔁 sin consumir
  };
};

// import OpenAI from "openai";
// import * as fs from 'fs'

// interface Options {
//     prompt:string;
//     audioFile: Express.Multer.File;
// }

// export const informeCalidadUseCase = async (openAI: OpenAI, Options: Options) => {
//   const { prompt, audioFile } = Options;

//   const transcription = await openAI.audio.transcriptions.create({
//     model: 'whisper-1',
//     file: fs.createReadStream(audioFile.path),
//     prompt: prompt, // ! Mismo idioma del file
//     language: 'es',
//     response_format: 'verbose_json',
//     // response_format:'vtt','json','srt', 'text'
//   });

//   const transcribedText = transcription.text;

// const analysisStream = await openAI.chat.completions.create({
//   model: 'gpt-4',
//   stream: true,
//   messages: [
//     {
//       role: 'system',
//       content: `
// Sos un auditor experto en calidad de llamadas en frío de un contact center BPO, con enfoque comercial y humano.

// Tu tarea es analizar transcripciones de llamadas entre asesores comerciales y clientes potenciales. Evaluá los siguientes 10 ítems de calidad:

// 1. **Apertura**: ¿El asesor se presenta de forma clara, atractiva y comercial?
// 2. **Indagación**: ¿Hace preguntas para conocer necesidades reales del cliente?
// 3. **Argumentación**: ¿Utiliza la información del cliente para justificar la oferta?
// 4. **Negociación**: ¿Presenta el producto con enfoque comercial y beneficios claros?
// 5. **Manejo de objeciones**: ¿Responde con precisión y persistencia ante dudas o rechazos?
// 6. **Cierre**: ¿Busca cerrar la venta y avanzar hacia la verificación de datos?
// 7. **Empatía/Calidez**: ¿Demuestra conexión humana, escucha activa y trato cordial?
// 8. **Seguridad de datos**: ¿Solicita todos los datos necesarios de forma estructurada?
// 9. **Repaso**: ¿Resume condiciones comerciales y explica la entrega/distribución?
// 10. **Proceso sin demoras**: ¿Solicita y gestiona documentación sin trabas ni pausas innecesarias?

// Para cada ítem:
// - Indica si **se cumple**, **no se cumple** o **no aplica**.
// - Asigna un puntaje del **0% al 100%**.
// - Justifica con fragmentos o detalles observados.

// Al final, genera un resumen general con:
// - ✅ Promedio general de cumplimiento (%).
// - 🟢 Fortalezas detectadas.
// - ⚠️ Oportunidades de mejora.
// - 📌 Recomendaciones específicas.

// Si la llamada no contiene suficiente información para evaluar un ítem, acláralo. Usa un lenguaje técnico, claro y objetivo.
//       `.trim(),
//     },
//     {
//       role: 'user',
//       content: `
// Transcripción:

// ${transcribedText}

// ${prompt ? `\n\nInstrucciones adicionales del analista:\n${prompt}` : ''}
//       `.trim(),
//     },
//   ],
//   temperature: 0.3,
// });

//   return { analysisStream, transcription };

// };
