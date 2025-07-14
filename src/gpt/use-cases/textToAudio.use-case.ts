import * as path from "path";
import * as fs from "fs";
import OpenAI from "openai";

interface Options {
  prompt: string;
  voice?: string;
}

export const textToAudioUseCase = async (
  openAI: OpenAI,
  { prompt, voice }: Options
) => {
  const voices = {
    alloy: "alloy",
    ash: "ash",
    ballad: "ballad",
    coral: "coral",
    echo: "echo",
    fable: "fable",
    nova: "nova",
    onyx: "onyx",
    sage: "sage",
    shimmer: "shimmer",
  };

  const selectedVoice = voices[voice] ?? "sage";
  const folderPath = path.resolve(__dirname, "../../../generated/audios/"); //podemos guardar el user id para saber quien lo genero
  const speechFile = path.resolve(`${folderPath}/${new Date().getTime()}.mp3`); //ToDo Cambiar el nombre del path para que no sobreescriba con algun id o algo asi

  fs.mkdirSync(folderPath, { recursive: true }); // * si no hay directorio los crea

  const mp3 = await openAI.audio.speech.create({
    model: "tts-1",
    voice: selectedVoice,
    input:prompt,
    response_format: 'mp3'
  });

  const buffer = Buffer.from( await mp3.arrayBuffer())
  fs.writeFileSync( speechFile, buffer)



  return speechFile
};
