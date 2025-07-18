import { Injectable, NotFoundException } from '@nestjs/common';
import {
  audioToTextUseCase,
  informeCalidadUseCase,
  orthographyChecUseCase,
  prosConsDicusserStreamUseCase,
  prosConsDicusserUseCase,
  textToAudioUseCase,
  translateUseCase,
} from './use-cases';
import { AudioToTextDto, orthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs';
import { InformeCalidadDto } from './dtos/InformeCalidad.dto';

@Injectable()
export class GptService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Solo va a llamar casos de uso

  async orthographyCheck(orthographyDto: orthographyDto) {
    return await orthographyChecUseCase(this.openai, {
      prompt: orthographyDto.prompt,
    });
  }

  async prosConsDicusser({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDicusserUseCase(this.openai, { prompt });
  }

  async prosConsDicusserStream({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDicusserStreamUseCase(this.openai, { prompt });
  }

  async translateText({ prompt, lang }: TranslateDto) {
    return await translateUseCase(this.openai, { prompt, lang });
  }

  async textToAudio({ prompt, voice }: TextToAudioDto) {
    return await textToAudioUseCase(this.openai, { prompt, voice });
  }

  async textToAudioGetter(fileId: string) {
    const filePath = path.resolve(__dirname, '../../generated/audios/', `${fileId}.mp3`);

    const wasFound = fs.existsSync(filePath);

    if (!wasFound) throw new NotFoundException(`File ${fileId} not found`);

    return filePath;
  }

  async audioToText(audioFile: Express.Multer.File, audioToTextDto: AudioToTextDto) {
    const { prompt } = audioToTextDto;
    return await audioToTextUseCase(this.openai, { audioFile, prompt });
  }

  // async informeCalidad(audioFile: Express.Multer.File, informeCalidadDto: InformeCalidadDto) {
  //   const { prompt } = informeCalidadDto;
  //   return await informeCalidadUseCase(this.openai, { audioFile, prompt });
  // }
  async informeCalidad(audioFile: Express.Multer.File, informeCalidadDto: InformeCalidadDto) {
    const { prompt } = informeCalidadDto;

    const {
      transcription,
      analysisStream, // ✅ esto venía del use case
    } = await informeCalidadUseCase(this.openai, { audioFile, prompt });

    return {
      transcription,
      analysisStream, // ✅ devolvés al controlador
    };
  }
}
