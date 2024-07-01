import { Injectable } from "@nestjs/common";
import { orthographyChecUseCase, prosConsDicusserStreamUseCase, prosConsDicusserUseCase, translateUseCase } from "./use-cases";
import { orthographyDto, ProsConsDiscusserDto, TranslateDto } from "./dtos";
import OpenAI from "openai";


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

  async translateText({ prompt , lang }: TranslateDto) {
    return await translateUseCase(this.openai, { prompt, lang });
  }
}
