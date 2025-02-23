import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UserSeeder } from './user.seeder';
import { SeedCommand } from './seed.command';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserSeeder, SeedCommand],
})
export class SeederModule {}
