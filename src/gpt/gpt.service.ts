import { Injectable, NotFoundException } from "@nestjs/common";
import { orthographyChecUseCase, prosConsDicusserStreamUseCase, prosConsDicusserUseCase, textToAudioUseCase, translateUseCase } from "./use-cases";
import { orthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from "./dtos";
import OpenAI from "openai";
import * as path from "path";
import * as fs from "fs";

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

  async textToAudioGetter (fileId: string ){
    const filePath = path.resolve(__dirname, '../../genertaed/audios/', `${fileId}.mp3`)

    const wasFound = fs.existsSync(filePath);

    if( !wasFound ) new NotFoundException(`File:${fileId}, not found`)
    
    return filePath;

  }
}
