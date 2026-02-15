import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePetDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
