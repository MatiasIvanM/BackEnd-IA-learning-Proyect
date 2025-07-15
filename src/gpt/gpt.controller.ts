import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GptService } from './gpt.service';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { AudioToTextDto, orthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import { FileInterceptor } from '@nestjs/platform-express';

// Recibe la informacion y manda llamar los servicios
@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(@Body() orthographydto: orthographyDto) {
    return this.gptService.orthographyCheck(orthographydto);
  }

  @Post('pros-cons-discusser')
  prosConsDicusser(@Body() prosConsDiscusserDto: ProsConsDiscusserDto) {
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDicusserStream(@Body() prosConsDiscusserDto: ProsConsDiscusserDto, @Res() res: Response) {
    const stream = await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }

    res.end();
  }

  @Post('translate')
  async translateText(@Body() TranslateDto: TranslateDto, @Res() res: Response) {
    const stream = await this.gptService.translateText(TranslateDto);
    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }

    res.end();
  }

  @Get('text-to-audio/:fileId')
  async textToAudioGetter(@Res() res: Response, @Param('fileId') fileId: string) {
    const filePath = await this.gptService.textToAudioGetter(fileId);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('text-to-audio')
  async textToAudio(@Body() textToAudioDto: TextToAudioDto, @Res() res: Response) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`;
          return callback(null, fileName);
        },
      }),
    })
  )
  async audioToText(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 25, message: 'File is bigger than 25 mb ' }),
          new FileTypeValidator({ fileType: 'audio/*' }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() audioToTextDto:AudioToTextDto,
  ) {
    // console.log(AudioToTextDto);
    return this.gptService.audioToText(file, audioToTextDto);
  }
}
