import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { GptService } from "./gpt.service";
import { Response } from "express";
import { orthographyDto, ProsConsDiscusserDto } from "./dtos";

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

    const stream = await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader ('Content-Type', 'application/json');
    res.status ( HttpStatus.OK );

    for await (const chunk of stream ) {
    
      const pieces = chunk.choices[0].delta.content || '';
      // console.log("🚀 ~ GptController ~ forawait ~ pieces:", pieces)
      res.write(pieces);
    }

    res.end();

  }
}
