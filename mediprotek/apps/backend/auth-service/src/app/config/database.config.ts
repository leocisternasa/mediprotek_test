// src/app/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';

dotenv.config();

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User], // Especificamos directamente la entidad
  synchronize: process.env.NODE_ENV === 'development', // Solo true en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production',
};

export default databaseConfig;
