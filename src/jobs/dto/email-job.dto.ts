export interface SendEmailJobDto {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    path?: string
    content?: string | Buffer
  }>
}

export interface SendNewUserEmailJobDto {
  email: string
  name: string
}

export interface SendPasswordResetEmailJobDto {
  email: string
  token: string
}

export interface SendNewSolicitationEmailJobDto {
  email: string
  solicitationCode: string
}

export interface SendBulkEmailJobDto {
  emails: string[]
  subject: string
  html: string
}



