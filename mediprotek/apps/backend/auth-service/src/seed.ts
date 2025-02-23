import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './app/entities/user.entity';
import { UserSeeder } from './app/database/seeders/user.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'mediprotek_auth',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserSeeder],
})
class SeederModule {}

async function bootstrap() {
  const app = await NestFactory.create(SeederModule);
  const seeder = app.get(UserSeeder);

  try {
    console.log('🌱 Iniciando proceso de seeding...');
    await seeder.seed();
    console.log('✅ Proceso de seeding completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el proceso de seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
