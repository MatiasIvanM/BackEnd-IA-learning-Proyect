import { Injectable } from '@nestjs/common';
import { orthographyChecUseCase } from './use-cases';
import { orthographyDto } from './dtos/orthography.dto';

@Injectable()
export class GptService {

// Solo va a llamar casos de uso

    async orthographyCheck(orthographyDto : orthographyDto){
        return await orthographyChecUseCase({
            prompt: orthographyDto.prompt
        }); 
    }
}
