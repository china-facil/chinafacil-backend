export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  ncmDatabase: {
    host: process.env.DB_HOST_NCM_IMPOSTOS || '127.0.0.1',
    port: process.env.DB_PORT_NCM_IMPOSTOS ? parseInt(process.env.DB_PORT_NCM_IMPOSTOS, 10) : 3306,
    database: process.env.DB_DATABASE_NCM_IMPOSTOS || 'forge',
    username: process.env.DB_USERNAME_NCM_IMPOSTOS || 'forge',
    password: process.env.DB_PASSWORD_NCM_IMPOSTOS || '',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
})

