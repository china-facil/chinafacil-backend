# 💻 Exemplos de Código - Migração PHP/Laravel → NestJS

## 📝 Índice
1. [Estrutura de Módulos](#estrutura-de-módulos)
2. [Entities vs Models](#entities-vs-models)
3. [Controllers](#controllers)
4. [Services](#services)
5. [DTOs](#dtos)
6. [Middlewares → Guards/Interceptors](#middlewares--guardsinterceptors)
7. [Jobs](#jobs)
8. [CLI Commands](#cli-commands)
9. [Exception Handling](#exception-handling)
10. [Database Queries](#database-queries)

---

## 1. Estrutura de Módulos

### ❌ Laravel
```
app/
├── Http/Controllers/
│   └── UsersController.php
├── Models/
│   └── User.php
└── Services/
    └── UserService.php
```

### ✅ NestJS
```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Para usar em outros módulos
})
export class UsersModule {}
```

---

## 2. Entities vs Models

### ❌ Laravel Model
```php
<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified' => 'boolean'
    ];

    public function solicitations()
    {
        return $this->hasMany(Solicitation::class);
    }

    public function clients()
    {
        return $this->belongsToMany(Client::class);
    }
}
```

### ✅ NestJS Entity (TypeORM)
```typescript
// users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Solicitation } from '../../solicitations/entities/solicitation.entity';
import { Client } from '../../clients/entities/client.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SELLER = 'seller',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() // Não retorna em respostas
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  @Column({ type: 'int', nullable: true })
  employees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthly_billing: number;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string;

  @Column({ type: 'jsonb', nullable: true })
  company_data: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  // Relacionamentos
  @OneToMany(() => Solicitation, (solicitation) => solicitation.user)
  solicitations: Solicitation[];

  @ManyToMany(() => Client, (client) => client.users)
  @JoinTable({
    name: 'client_user',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'client_id', referencedColumnName: 'id' },
  })
  clients: Client[];
}
```

### ✅ NestJS Entity (Prisma)
```prisma
// prisma/schema.prisma
model User {
  id                String    @id @default(uuid())
  name              String
  email             String    @unique
  password          String
  phone             String?
  avatar            String?
  role              UserRole  @default(USER)
  status            UserStatus @default(ACTIVE)
  phoneVerified     Boolean   @default(false) @map("phone_verified")
  employees         Int?
  monthlyBilling    Decimal?  @map("monthly_billing")
  cnpj              String?
  companyData       Json?     @map("company_data")
  emailVerifiedAt   DateTime? @map("email_verified_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  solicitations     Solicitation[]
  clients           ClientUser[]

  @@map("users")
}

enum UserRole {
  ADMIN
  USER
  SELLER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

---

## 3. Controllers

### ❌ Laravel Controller
```php
<?php
// app/Http/Controllers/UsersController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');

        $query = User::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'string|in:admin,user,seller',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'phone' => 'string|max:20',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }
}
```

### ✅ NestJS Controller
```typescript
// users/users.controller.ts
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
```

---

## 4. Services

### ❌ Laravel (lógica direto no controller ou service simples)
```php
<?php
// Geralmente no controller ou em service simples
$user = User::create($data);
```

### ✅ NestJS Service
```typescript
// users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(filterDto: FilterUserDto) {
    const { page = 1, limit = 15, search, role, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
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

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['solicitations', 'clients'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
```

---

## 5. DTOs

### ❌ Laravel (Request validation)
```php
<?php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users',
    'password' => 'required|string|min:8',
]);
```

### ✅ NestJS DTOs
```typescript
// users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  IsDecimal,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '+5511999999999',
    description: 'User phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role',
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 10, description: 'Number of employees', required: false })
  @IsInt()
  @IsOptional()
  employees?: number;

  @ApiProperty({ example: 50000.00, description: 'Monthly billing', required: false })
  @IsDecimal()
  @IsOptional()
  monthly_billing?: number;

  @ApiProperty({ example: '12345678000199', description: 'CNPJ', required: false })
  @IsString()
  @Length(14, 18)
  @IsOptional()
  cnpj?: string;
}

// users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// users/dto/filter-user.dto.ts
import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

export class FilterUserDto {
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

  @ApiPropertyOptional({ example: 'João', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
```

---

## 6. Middlewares → Guards/Interceptors

### ❌ Laravel Middleware
```php
<?php
// app/Http/Middleware/TransactionMiddleware.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;

class TransactionMiddleware
{
    public function handle($request, Closure $next)
    {
        DB::beginTransaction();
        
        try {
            $response = $next($request);
            DB::commit();
            return $response;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
```

### ✅ NestJS Interceptor
```typescript
// common/interceptors/transaction.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return next.handle().pipe(
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return throwError(() => err);
      }),
    );
  }
}
```

### ❌ Laravel Auth Middleware
```php
<?php
// Route::middleware(['auth:sanctum'])->group(function () {
//     ...
// });
```

### ✅ NestJS Guard
```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}

// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Uso no controller:
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SELLER)
async findAll() {
  // ...
}
```

---

## 7. Jobs

### ❌ Laravel Job
```php
<?php
// app/Jobs/SendEmailNewUserJob.php
namespace App\Jobs;

use App\Mail\NewUserMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEmailNewUserJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function handle()
    {
        Mail::to($this->user->email)->send(new NewUserMail($this->user));
    }
}

// Dispatch:
SendEmailNewUserJob::dispatch($user);
```

### ✅ NestJS Job (Bull)
```typescript
// jobs/processors/email.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailService } from '../../mail/mail.service';

export interface SendEmailJobData {
  userId: string;
  email: string;
  name: string;
  type: 'new-user' | 'new-solicitation' | 'password-reset';
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process('send-new-user-email')
  async handleNewUserEmail(job: Job<SendEmailJobData>) {
    this.logger.log(`Processing new user email for ${job.data.email}`);

    try {
      await this.mailService.sendNewUserEmail({
        email: job.data.email,
        name: job.data.name,
      });

      this.logger.log(`Email sent successfully to ${job.data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${job.data.email}`,
        error.stack,
      );
      throw error; // Bull vai retry automaticamente
    }
  }

  @Process('send-new-solicitation-email')
  async handleNewSolicitationEmail(job: Job<any>) {
    // Similar
  }
}

// jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    MailModule,
  ],
  providers: [EmailProcessor],
})
export class JobsModule {}

// app.module.ts (configuração global)
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    JobsModule,
  ],
})
export class AppModule {}

// Dispatch de job em qualquer service:
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class UsersService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.save(createUserDto);

    // Adicionar job na fila
    await this.emailQueue.add('send-new-user-email', {
      userId: user.id,
      email: user.email,
      name: user.name,
      type: 'new-user',
    });

    return user;
  }
}
```

---

## 8. CLI Commands

### ❌ Laravel Command
```php
<?php
// app/Console/Commands/CheckExpiredSubscriptions.php
namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class CheckExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check-expired';
    protected $description = 'Check and notify expired subscriptions';

    public function handle()
    {
        $this->info('Checking expired subscriptions...');

        $expiredSubscriptions = Subscription::where('expires_at', '<', now())
            ->where('status', 'active')
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->status = 'expired';
            $subscription->save();
            
            // Send notification
        }

        $this->info("Processed {$expiredSubscriptions->count()} expired subscriptions");
    }
}
```

### ✅ NestJS Command (nest-commander)
```typescript
// cli/commands/check-expired-subscriptions.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Injectable()
@Command({
  name: 'subscriptions:check-expired',
  description: 'Check and notify expired subscriptions',
})
export class CheckExpiredSubscriptionsCommand extends CommandRunner {
  private readonly logger = new Logger(CheckExpiredSubscriptionsCommand.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Checking expired subscriptions...');

    const expiredSubscriptions =
      await this.subscriptionsService.findExpired();

    for (const subscription of expiredSubscriptions) {
      await this.subscriptionsService.markAsExpired(subscription.id);

      await this.notificationsService.sendExpiredSubscriptionNotification(
        subscription,
      );
    }

    this.logger.log(
      `Processed ${expiredSubscriptions.length} expired subscriptions`,
    );
  }
}

// cli/cli.module.ts
import { Module } from '@nestjs/common';
import { CheckExpiredSubscriptionsCommand } from './commands/check-expired-subscriptions.command';
import { SubscriptionsModule } from '../modules/subscriptions/subscriptions.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [SubscriptionsModule, NotificationsModule],
  providers: [CheckExpiredSubscriptionsCommand],
})
export class CliModule {}

// Executar:
// npm run cli subscriptions:check-expired
```

---

## 9. Exception Handling

### ❌ Laravel
```php
<?php
// app/Exceptions/Handler.php
public function render($request, Throwable $exception)
{
    if ($exception instanceof ModelNotFoundException) {
        return response()->json([
            'error' => 'Resource not found'
        ], 404);
    }

    return parent::render($request, $exception);
}
```

### ✅ NestJS Exception Filter
```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}

// main.ts (registro global)
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(3000);
}
```

---

## 10. Database Queries

### ❌ Laravel Eloquent
```php
<?php
// Busca simples
$user = User::find($id);

// Com relacionamentos
$user = User::with(['solicitations', 'clients'])->find($id);

// Query complexa
$solicitations = Solicitation::where('status', 'open')
    ->whereHas('user', function($query) {
        $query->where('role', 'admin');
    })
    ->with('items')
    ->paginate(15);

// Agregação
$totalValue = Solicitation::whereHas('cart')
    ->with('cart')
    ->get()
    ->sum(function($solicitation) {
        return $solicitation->cart->total;
    });
```

### ✅ NestJS TypeORM
```typescript
// Busca simples
const user = await this.userRepository.findOne({ where: { id } });

// Com relacionamentos
const user = await this.userRepository.findOne({
  where: { id },
  relations: ['solicitations', 'clients'],
});

// Query complexa
const solicitations = await this.solicitationRepository
  .createQueryBuilder('solicitation')
  .leftJoinAndSelect('solicitation.user', 'user')
  .leftJoinAndSelect('solicitation.items', 'items')
  .where('solicitation.status = :status', { status: 'open' })
  .andWhere('user.role = :role', { role: 'admin' })
  .take(15)
  .skip(0)
  .getMany();

// Agregação
const result = await this.solicitationRepository
  .createQueryBuilder('solicitation')
  .leftJoinAndSelect('solicitation.cart', 'cart')
  .select('SUM(cart.total)', 'totalValue')
  .getRawOne();

// Query com JSON (PostgreSQL)
const users = await this.userRepository
  .createQueryBuilder('user')
  .where("user.company_data->>'city' = :city", { city: 'São Paulo' })
  .getMany();
```

### ✅ NestJS Prisma
```typescript
// Busca simples
const user = await this.prisma.user.findUnique({
  where: { id },
});

// Com relacionamentos
const user = await this.prisma.user.findUnique({
  where: { id },
  include: {
    solicitations: true,
    clients: true,
  },
});

// Query complexa
const solicitations = await this.prisma.solicitation.findMany({
  where: {
    status: 'open',
    user: {
      role: 'admin',
    },
  },
  include: {
    items: true,
  },
  take: 15,
  skip: 0,
});

// Agregação
const result = await this.prisma.cart.aggregate({
  _sum: {
    total: true,
  },
  where: {
    solicitation: {
      isNot: null,
    },
  },
});

// Transaction
await this.prisma.$transaction(async (prisma) => {
  const user = await prisma.user.create({ data: userData });
  const solicitation = await prisma.solicitation.create({
    data: { ...solicitationData, userId: user.id },
  });
});
```

---

## 🎯 Principais Diferenças Resumidas

| Aspecto | Laravel | NestJS |
|---------|---------|--------|
| **Arquitetura** | MVC | Modular (Domain-driven) |
| **Validação** | Request validation | DTOs com class-validator |
| **ORM** | Eloquent | TypeORM ou Prisma |
| **Jobs** | Laravel Queue | Bull/BullMQ |
| **Middleware** | Middleware | Guards + Interceptors |
| **CLI** | Artisan Commands | nest-commander |
| **Documentação** | Manual | Swagger (auto) |
| **Type Safety** | Fraco (PHP) | Forte (TypeScript) |

---

**Criado por:** Claude AI  
**Data:** 2025-11-11  
**Versão:** 1.0


