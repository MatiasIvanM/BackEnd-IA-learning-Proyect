import OpenAI from "openai";
import * as fs from 'fs'

interface Options {
    prompt:string;
    audioFile: Express.Multer.File;
}


export const audioToTextUseCase = async( openAI: OpenAI, Options: Options) => {
    const { prompt, audioFile } = Options

    const response = await openAI.audio.transcriptions.create({
        model:'whisper-1',
        file: fs.createReadStream(audioFile.path),
        prompt:prompt, // ! Mismo idioma del file
        language:'es',
        response_format:'verbose_json',
        // response_format:'vtt','json','srt', 'text'
    })

    console.log(response)
    
    return response
    
}

