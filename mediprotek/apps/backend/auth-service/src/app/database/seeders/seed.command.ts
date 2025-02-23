import { Command, CommandRunner } from 'nest-commander';
import { UserSeeder } from './user.seeder';

@Command({ name: 'seed', description: 'Seed the database with initial data' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly userSeeder: UserSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('🌱 Iniciando proceso de seeding...');

      console.log('\n📝 Creando usuarios...');
      await this.userSeeder.seed();

      console.log('\n✅ Proceso de seeding completado exitosamente!');
    } catch (error) {
      console.error('\n❌ Error durante el proceso de seeding:', error);
      throw error;
    }
  }
}
