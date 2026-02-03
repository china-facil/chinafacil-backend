import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nestjs';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errors: any = null;

    this.logger.debug(`Exception caught: ${exception instanceof Error ? exception.message : typeof exception}`);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exceptionResponse;
        errors = (exceptionResponse as any).errors || null;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.handlePrismaError(exception);
      message = this.getPrismaErrorMessage(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos fornecidos';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Erro de conexão com o banco de dados. Verifique se o banco está rodando.';
      this.logger.error(
        `Database connection error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      // Verificar se é erro de conexão
      if (
        exception.message?.includes('ECONNREFUSED') ||
        exception.message?.includes('connect') ||
        exception.message?.includes('Connection refused')
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Erro de conexão com o banco de dados. Verifique se o banco está rodando.';
      } else {
        message = exception.message || 'Internal server error';
      }
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown exception type: ${typeof exception}`, JSON.stringify(exception));
    }

    let finalMessage: string;
    if (typeof message === 'string') {
      finalMessage = message;
    } else if (message && typeof message === 'object' && 'message' in message) {
      finalMessage = (message as any).message;
    } else {
      finalMessage = JSON.stringify(message) || 'Internal server error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: finalMessage,
      ...(errors && { errors }),
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      JSON.stringify(errorResponse),
      exception instanceof Error ? exception.stack : '',
    );

    const user = request.user;
    const userContext = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    } : null;

    Sentry.captureException(exception, {
      user: userContext ? {
        id: userContext.id.toString(),
        email: userContext.email,
        username: userContext.name,
      } : undefined,
      tags: {
        endpoint: `${request.method} ${request.url}`,
        statusCode: status,
        'user.id': userContext?.id?.toString(),
        'user.role': userContext?.role,
      },
      extra: {
        request: {
          url: request.url,
          method: request.method,
          query: request.query,
          body: request.body,
        },
        user_context: userContext,
        response: {
          statusCode: status,
          errorResponse: errorResponse,
        },
      },
    });

    if (typeof (global as any).newrelic !== 'undefined') {
      (global as any).newrelic.noticeError(exception, {
        request: {
          url: request.url,
          method: request.method,
          headers: request.headers,
          query: request.query,
          body: request.body,
        },
        response: {
          statusCode: status,
          errorResponse: errorResponse,
        },
        user: userContext,
      });
    }

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): number {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      case 'P2003':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        const target = (error.meta as any)?.target;
        return `Registro duplicado: ${target ? target.join(', ') : 'campo único violado'}`;
      case 'P2025':
        return 'Registro não encontrado';
      case 'P2003':
        return 'Violação de integridade referencial';
      case 'P2023':
        return (error.meta as any)?.message || 'Dados inconsistentes no banco de dados';
      default:
        return 'Erro no banco de dados';
    }
  }
}

