import { IsOptional, IsString } from "class-validator";

export class InformeCalidadDto {
  @IsString()
  @IsOptional()
  readonly prompt: string;
}
