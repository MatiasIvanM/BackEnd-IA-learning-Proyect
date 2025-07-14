import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import { GptService } from "./gpt.service";
import type { Response } from "express";
import {
  orthographyDto,
  ProsConsDiscusserDto,
  TextToAudioDto,
  TranslateDto,
} from "./dtos";

// Recibe la informacion y manda llamar los servicios
@Controller("gpt")
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post("orthography-check")
  orthographyCheck(@Body() orthographydto: orthographyDto) {
    return this.gptService.orthographyCheck(orthographydto);
  }

  @Post("pros-cons-discusser")
  prosConsDicusser(@Body() prosConsDiscusserDto: ProsConsDiscusserDto) {
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post("pros-cons-discusser-stream")
  async prosConsDicusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response
  ) {
    const stream =
      await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader("Content-Type", "application/json");
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || "";
      // console.log(piece);
      res.write(piece);
    }

    res.end();
  }

  @Post("translate")
  async translateText(
    @Body() TranslateDto: TranslateDto,
    @Res() res: Response
  ) {
    const stream = await this.gptService.translateText(TranslateDto);

    res.setHeader("Content-Type", "application/json");
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || "";
      // console.log(piece);
      res.write(piece);
    }

    res.end();
  }

  @Post("text-to-audio")
  async textToAudio(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response
  ) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader("Conten-Type", "audio/mp3");
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get("text-to-audio(:fileId")
  async textToAudioGetter(
    @Res() res: Response,
    @Param("fileId") fileId: string
  ) {
    const filePath = await this.gptService.textToAudioGetter(fileId);

    res.setHeader("Conten-Type", "audio/mp3");
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }
}
