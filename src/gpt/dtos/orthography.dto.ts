import { IsInt, IsOptional, IsString } from "class-validator"

export class orthographyDto{

    @IsString()
    readonly prompt: string

    @IsInt()
    @IsOptional()
    readonly maxTokens?: number
};