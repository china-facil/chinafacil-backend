export interface ProcessExportJobDto {
  exportId: string
  userId: string
  type: 'CSV' | 'EXCEL' | 'PDF' | 'JSON'
  model: string
  params?: Record<string, any>
}

