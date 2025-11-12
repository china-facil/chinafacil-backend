# 🎨 Templates de Código - Migração NestJS

## 📝 Índice
1. [Entity Template](#1-entity-template)
2. [Module Template](#2-module-template)
3. [Controller Template](#3-controller-template)
4. [Service Template](#4-service-template)
5. [DTOs Template](#5-dtos-template)
6. [Guard Template](#6-guard-template)
7. [Interceptor Template](#7-interceptor-template)
8. [Job Processor Template](#8-job-processor-template)
9. [CLI Command Template](#9-cli-command-template)
10. [Test Templates](#10-test-templates)

---

## 1. Entity Template

### TypeORM Entity
```typescript
// modules/[module]/entities/[entity].entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

// Enums
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('[table_name]')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index() // Se precisar de index
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() // Não retorna em respostas JSON
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status: EntityStatus;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'int', nullable: true })
  count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date; // Para soft delete

  // Relacionamentos

  // One to Many
  @OneToMany(() => RelatedEntity, (related) => related.parent)
  children: RelatedEntity[];

  // Many to One
  @ManyToOne(() => ParentEntity, (parent) => parent.children)
  parent: ParentEntity;

  // Many to Many
  @ManyToMany(() => OtherEntity, (other) => other.entities)
  @JoinTable({
    name: 'entity_other',
    joinColumn: { name: 'entity_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'other_id', referencedColumnName: 'id' },
  })
  others: OtherEntity[];
}
```

---

## 2. Module Template

```typescript
// modules/[module]/[module].module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityNameController } from './entity-name.controller';
import { EntityNameService } from './entity-name.service';
import { EntityName } from './entities/entity-name.entity';
import { RelatedModule } from '../related/related.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntityName]),
    RelatedModule, // Se precisar de outros módulos
  ],
  controllers: [EntityNameController],
  providers: [EntityNameService],
  exports: [EntityNameService], // Para usar em outros módulos
})
export class EntityNameModule {}
```

---

## 3. Controller Template

```typescript
// modules/[module]/[module].controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EntityNameService } from './entity-name.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { FilterEntityDto } from './dto/filter-entity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('entity-name')
@ApiBearerAuth()
@Controller('entity-name')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor) // Para @Exclude funcionar
export class EntityNameController {
  constructor(private readonly entityNameService: EntityNameService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'List all entities with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async findAll(@Query() filterDto: FilterEntityDto) {
    return this.entityNameService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.entityNameService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createDto: CreateEntityDto,
    @CurrentUser() user: User,
  ) {
    return this.entityNameService.create(createDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEntityDto,
  ) {
    return this.entityNameService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 204, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.entityNameService.remove(id);
  }
}
```

---

## 4. Service Template

```typescript
// modules/[module]/[module].service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { EntityName } from './entities/entity-name.entity';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { FilterEntityDto } from './dto/filter-entity.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EntityNameService {
  private readonly logger = new Logger(EntityNameService.name);

  constructor(
    @InjectRepository(EntityName)
    private readonly entityRepository: Repository<EntityName>,
  ) {}

  async findAll(filterDto: FilterEntityDto) {
    this.logger.log('Finding all entities with filters');

    const { page = 1, limit = 15, search, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.entityRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['related'], // Se precisar
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<EntityName> {
    this.logger.log(`Finding entity with id: ${id}`);

    const entity = await this.entityRepository.findOne({
      where: { id },
      relations: ['related'],
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async create(
    createDto: CreateEntityDto,
    user?: User,
  ): Promise<EntityName> {
    this.logger.log('Creating new entity');

    // Validações customizadas
    // ...

    const entity = this.entityRepository.create({
      ...createDto,
      // created_by: user?.id,
    });

    try {
      return await this.entityRepository.save(entity);
    } catch (error) {
      this.logger.error(`Error creating entity: ${error.message}`);
      throw new BadRequestException('Failed to create entity');
    }
  }

  async update(id: string, updateDto: UpdateEntityDto): Promise<EntityName> {
    this.logger.log(`Updating entity with id: ${id}`);

    const entity = await this.findOne(id);

    Object.assign(entity, updateDto);

    try {
      return await this.entityRepository.save(entity);
    } catch (error) {
      this.logger.error(`Error updating entity: ${error.message}`);
      throw new BadRequestException('Failed to update entity');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing entity with id: ${id}`);

    const entity = await this.findOne(id);

    // Soft delete
    entity.deleted_at = new Date();
    await this.entityRepository.save(entity);

    // Ou hard delete
    // await this.entityRepository.remove(entity);
  }
}
```

---

## 5. DTOs Template

### Create DTO
```typescript
// modules/[module]/dto/create-entity.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsDecimal,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../entities/entity-name.entity';

export class CreateEntityDto {
  @ApiProperty({ example: 'Entity Name', description: 'Entity name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'email@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'Description', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: EntityStatus,
    example: EntityStatus.ACTIVE,
    description: 'Entity status',
  })
  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;

  @ApiPropertyOptional({ example: true, description: 'Is verified' })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Count' })
  @IsInt()
  @Min(0)
  @Max(1000)
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({ example: 99.99, description: 'Price' })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: ['tag1', 'tag2'],
    description: 'Tags',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: { key: 'value' },
    description: 'Metadata',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  // Para nested objects
  @ApiPropertyOptional({ type: () => NestedDto })
  @ValidateNested()
  @Type(() => NestedDto)
  @IsOptional()
  nested?: NestedDto;
}
```

### Update DTO
```typescript
// modules/[module]/dto/update-entity.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEntityDto } from './create-entity.dto';

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

### Filter DTO
```typescript
// modules/[module]/dto/filter-entity.dto.ts
import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EntityStatus } from '../entities/entity-name.entity';

export class FilterEntityDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 15, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 15;

  @ApiPropertyOptional({ example: 'search term', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EntityStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
```

---

## 6. Guard Template

```typescript
// common/guards/custom.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Sua lógica aqui
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Verificar metadata do handler
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}
```

---

## 7. Interceptor Template

```typescript
// common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          this.logger.log(`← ${method} ${url} ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `← ${method} ${url} ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
```

---

## 8. Job Processor Template

```typescript
// jobs/processors/entity.processor.ts
import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EntityService } from '../../modules/entity/entity.service';

export interface EntityJobData {
  id: string;
  action: string;
  // ... outros dados
}

@Processor('entity-queue')
export class EntityProcessor {
  private readonly logger = new Logger(EntityProcessor.name);

  constructor(private readonly entityService: EntityService) {}

  @Process('process-entity')
  async handleProcessEntity(job: Job<EntityJobData>) {
    this.logger.log(`Processing entity job ${job.id}`);

    try {
      const { id, action } = job.data;

      // Atualizar progresso
      await job.progress(10);

      // Sua lógica aqui
      const result = await this.entityService.processEntity(id, action);

      await job.progress(50);

      // Mais lógica...

      await job.progress(100);

      this.logger.log(`Completed entity job ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed entity job ${job.id}: ${error.message}`);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} started processing`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
```

---

## 9. CLI Command Template

```typescript
// cli/commands/custom.command.ts
import { Command, CommandRunner, Option } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { EntityService } from '../../modules/entity/entity.service';

interface CustomCommandOptions {
  dryRun?: boolean;
  force?: boolean;
}

@Injectable()
@Command({
  name: 'custom:command',
  description: 'Description of what this command does',
})
export class CustomCommand extends CommandRunner {
  private readonly logger = new Logger(CustomCommand.name);

  constructor(private readonly entityService: EntityService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: CustomCommandOptions,
  ): Promise<void> {
    this.logger.log('Starting custom command');

    const isDryRun = options?.dryRun || false;
    const isForce = options?.force || false;

    this.logger.log(`Dry run: ${isDryRun}`);
    this.logger.log(`Force: ${isForce}`);

    try {
      // Sua lógica aqui
      const entities = await this.entityService.findAll({});

      for (const entity of entities.data) {
        this.logger.log(`Processing: ${entity.name}`);

        if (!isDryRun) {
          // Executar ação
          await this.entityService.update(entity.id, {
            /* ... */
          });
        }
      }

      this.logger.log('Command completed successfully');
    } catch (error) {
      this.logger.error(`Command failed: ${error.message}`);
      throw error;
    }
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'Run without making changes',
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-f, --force',
    description: 'Force execution',
  })
  parseForce(): boolean {
    return true;
  }
}
```

---

## 10. Test Templates

### Unit Test
```typescript
// modules/[module]/[module].service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNameService } from './entity-name.service';
import { EntityName } from './entities/entity-name.entity';
import { NotFoundException } from '@nestjs/common';

describe('EntityNameService', () => {
  let service: EntityNameService;
  let repository: Repository<EntityName>;

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Entity',
    email: 'test@example.com',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityNameService,
        {
          provide: getRepositoryToken(EntityName),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EntityNameService>(EntityNameService);
    repository = module.get<Repository<EntityName>>(
      getRepositoryToken(EntityName),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated entities', async () => {
      const mockData = [mockEntity];
      const mockTotal = 1;

      mockRepository.findAndCount.mockResolvedValue([mockData, mockTotal]);

      const result = await service.findAll({ page: 1, limit: 15 });

      expect(result).toEqual({
        data: mockData,
        meta: {
          total: mockTotal,
          page: 1,
          limit: 15,
          lastPage: 1,
        },
      });
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an entity', async () => {
      mockRepository.findOne.mockResolvedValue(mockEntity);

      const result = await service.findOne(mockEntity.id);

      expect(result).toEqual(mockEntity);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEntity.id },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException if entity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create an entity', async () => {
      const createDto = {
        name: 'New Entity',
        email: 'new@example.com',
      };

      mockRepository.create.mockReturnValue({ ...mockEntity, ...createDto });
      mockRepository.save.mockResolvedValue({ ...mockEntity, ...createDto });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const updateDto = { name: 'Updated Name' };

      mockRepository.findOne.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue({
        ...mockEntity,
        ...updateDto,
      });

      const result = await service.update(mockEntity.id, updateDto);

      expect(result.name).toBe(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should remove an entity', async () => {
      mockRepository.findOne.mockResolvedValue(mockEntity);
      mockRepository.save.mockResolvedValue({
        ...mockEntity,
        deleted_at: expect.any(Date),
      });

      await service.remove(mockEntity.id);

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

### Integration Test
```typescript
// modules/[module]/[module].controller.spec.ts (Integration)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityName } from './entities/entity-name.entity';

describe('EntityNameController (Integration)', () => {
  let app: INestApplication;
  let entityRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    entityRepository = moduleFixture.get(getRepositoryToken(EntityName));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpar banco de dados de teste
    await entityRepository.clear();
  });

  it('/entity-name (POST) should create entity', async () => {
    const createDto = {
      name: 'Test Entity',
      email: 'test@example.com',
    };

    const response = await request(app.getHttpServer())
      .post('/entity-name')
      .send(createDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createDto.name);

    const entity = await entityRepository.findOne({
      where: { email: createDto.email },
    });
    expect(entity).toBeDefined();
  });

  it('/entity-name (GET) should return entities', async () => {
    // Criar entities de teste
    await entityRepository.save({
      name: 'Entity 1',
      email: 'entity1@example.com',
    });
    await entityRepository.save({
      name: 'Entity 2',
      email: 'entity2@example.com',
    });

    const response = await request(app.getHttpServer())
      .get('/entity-name')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.total).toBe(2);
  });
});
```

### E2E Test
```typescript
// test/entity-name.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Entity Flow (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should complete full entity flow', async () => {
    // 1. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
    expect(authToken).toBeDefined();

    // 2. Create entity
    const createResponse = await request(app.getHttpServer())
      .post('/entity-name')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Entity',
        email: 'test@example.com',
      })
      .expect(201);

    const entityId = createResponse.body.id;
    expect(entityId).toBeDefined();

    // 3. Get entity
    const getResponse = await request(app.getHttpServer())
      .get(`/entity-name/${entityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.id).toBe(entityId);

    // 4. Update entity
    await request(app.getHttpServer())
      .patch(`/entity-name/${entityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
      })
      .expect(200);

    // 5. Delete entity
    await request(app.getHttpServer())
      .delete(`/entity-name/${entityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });
});
```

---

## 📋 Como Usar os Templates

1. **Copie o template necessário**
2. **Substitua os placeholders:**
   - `[module]` → nome do módulo (ex: users)
   - `[entity]` → nome da entidade (ex: user)
   - `EntityName` → nome da classe (ex: User)
   - `entity-name` → kebab-case (ex: user-address)
   - `[table_name]` → nome da tabela (ex: users)

3. **Ajuste conforme necessário:**
   - Adicione campos específicos
   - Remova código não usado
   - Ajuste validações
   - Adapte relacionamentos

4. **Execute os testes:**
   ```bash
   npm run test
   npm run test:e2e
   ```

---

## 🎯 Checklist de Criação de Módulo

- [ ] Criar entity com TypeORM
- [ ] Criar module
- [ ] Criar service com CRUD
- [ ] Criar controller com endpoints
- [ ] Criar 3 DTOs (create, update, filter)
- [ ] Adicionar Swagger decorators
- [ ] Criar testes unitários do service
- [ ] Criar testes do controller
- [ ] Adicionar ao app.module
- [ ] Testar endpoints com Postman
- [ ] Documentar no README

---

**Criado por:** Claude AI  
**Data:** 2025-11-11  
**Versão:** 1.0


