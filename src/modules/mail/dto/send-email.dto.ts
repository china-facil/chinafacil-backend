import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class SendEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do destinatário ou array de emails',
  })
  @IsNotEmpty()
  to: string | string[]

  @ApiProperty({
    example: 'Assunto do Email',
    description: 'Assunto',
  })
  @IsString()
  @IsNotEmpty()
  subject: string

  @ApiPropertyOptional({
    example: 'Conteúdo em texto',
    description: 'Conteúdo em texto plano',
  })
  @IsOptional()
  @IsString()
  text?: string

  @ApiPropertyOptional({
    example: '<h1>HTML</h1>',
    description: 'Conteúdo em HTML',
  })
  @IsOptional()
  @IsString()
  html?: string

  @ApiPropertyOptional({
    example: 'new-user',
    description: 'Nome do template',
  })
  @IsOptional()
  @IsString()
  template?: string

  @ApiPropertyOptional({
    example: {
      name: 'João Silva',
      link: 'https://example.com/reset-password',
    },
    description: 'Contexto para o template (objeto JSON)',
  })
  @IsOptional()
  @IsObject()
  context?: any

  @ApiPropertyOptional({
    example: [
      {
        filename: 'document.pdf',
        path: '/path/to/file.pdf',
      },
    ],
    description: 'Anexos (array de objetos)',
  })
  @IsOptional()
  @IsArray()
  attachments?: any[]
}


