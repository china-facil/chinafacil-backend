export interface ProcessExportJobDto {
  userId: string
  type: 'CSV' | 'XLSX' | 'PDF' | 'JSON'
  model: string
  params?: Record<string, any>
}
