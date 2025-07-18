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
import { InformeCalidadDto } from './dtos/InformeCalidad.dto';
import { generatePdfBuffer, generatePdfFile } from './helpers/pdf-generator';

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
          const fileName = file.originalname;
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
    @Body() audioToTextDto: AudioToTextDto
  ) {
    return this.gptService.audioToText(file, audioToTextDto);
  }

  @Post('informe-calidad')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/audios',
        filename: (req, file, callback) => {
          const fileName = file.originalname;
          return callback(null, fileName);
        },
      }),
    })
  )
  async informeCalidadStream(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 25, message: 'File is bigger than 25 mb ' }),
          new FileTypeValidator({ fileType: 'audio/*' }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() dto: InformeCalidadDto,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { transcription, analysisStream } = await this.gptService.informeCalidad(file, dto);

      let fullText = '';

      // Stream SSE chunks
      for await (const chunk of analysisStream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          res.write(`data: ${JSON.stringify({ text: delta })}\n\n`);
          fullText += delta;
        }
      }

      // Cuando termina el stream, generamos el PDF con todo el análisis
      const pdfBuffer = await generatePdfBuffer(fullText);
      const pdfFilename = `informe-${Date.now()}.pdf`;
      const pdfUrl = await generatePdfFile(fullText, pdfFilename);


      // Enviamos evento final con PDF base64 y transcripción
      res.write(
        `data: ${JSON.stringify({
          event: 'end',
          pdfBase64: pdfBuffer.toString('base64'),
          transcription,
          pdfUrl,
        })}\n\n`
      );

      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  // @Post('informe-calidad')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './generated/informes-calidad',
  //       filename: (req, file, callback) => {
  //         // const fileExtension = file.originalname.split('.').pop();
  //         const fileName = file.originalname;
  //         return callback(null, fileName);
  //       },
  //     }),
  //   })
  // )
  // async informeCalidad(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 25, message: 'File is bigger than 25 mb ' }),
  //         new FileTypeValidator({ fileType: 'audio/*' }),
  //       ],
  //     })
  //   )
  //   file: Express.Multer.File,
  //   @Body() informeCalidadDto: InformeCalidadDto
  // ) {
  //   return this.gptService.informeCalidad(file, informeCalidadDto);
  // }
}
