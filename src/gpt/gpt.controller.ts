import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { orthographyDto } from './dtos/orthography.dto';


// Recibe la informacion y manda llamar los servicios 
@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

    @Post('orthography-check')
    orthographyCheck( @Body() orthographydto: orthographyDto ){

      return this.gptService.orthographyCheck(orthographydto);
    };

}
