import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { GptService } from "./gpt.service";
import { Response } from "express";
import { orthographyDto, ProsConsDiscusserDto, TranslateDto } from "./dtos";

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
}
