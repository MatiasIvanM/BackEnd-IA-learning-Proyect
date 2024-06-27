import { Injectable } from "@nestjs/common";
import { orthographyChecUseCase } from "./use-cases";
import { orthographyDto } from "./dtos/orthography.dto";
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
}
