import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  trace?: string;
}

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs');

  async getLogFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.logsDir);
      return files.filter((file) => file.endsWith('.log')).sort().reverse();
    } catch (error) {
      this.logger.error(`Error reading log directory: ${error.message}`);
      return [];
    }
  }

  async getLogContent(filename: string): Promise<LogEntry[]> {
    try {
      const filePath = path.join(this.logsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      return lines.map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          // Se não for JSON, retornar como texto simples
          return {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line,
          };
        }
      });
    } catch (error) {
      this.logger.error(`Error reading log file ${filename}: ${error.message}`);
      return [];
    }
  }

  async searchLogs(query: string, level?: string): Promise<LogEntry[]> {
    const files = await this.getLogFiles();
    const allLogs: LogEntry[] = [];

    for (const file of files.slice(0, 5)) {
      // Últimos 5 arquivos
      const logs = await this.getLogContent(file);
      allLogs.push(...logs);
    }

    return allLogs.filter((log) => {
      const matchesQuery = query ? log.message.toLowerCase().includes(query.toLowerCase()) : true;
      const matchesLevel = level ? log.level === level : true;
      return matchesQuery && matchesLevel;
    });
  }

  async clearLogs(): Promise<void> {
    try {
      const files = await this.getLogFiles();
      await Promise.all(files.map((file) => fs.unlink(path.join(this.logsDir, file))));
      this.logger.log('All logs cleared');
    } catch (error) {
      this.logger.error(`Error clearing logs: ${error.message}`);
      throw error;
    }
  }
}

