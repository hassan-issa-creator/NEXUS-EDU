import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  attachments?: string;
}

export class StartConversationDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
