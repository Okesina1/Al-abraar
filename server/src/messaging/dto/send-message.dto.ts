import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  receiverId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}