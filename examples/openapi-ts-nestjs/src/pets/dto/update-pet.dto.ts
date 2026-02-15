import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const PetStatus = ['available', 'pending', 'sold'] as const;

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(PetStatus)
  status?: (typeof PetStatus)[number];
}
