import { Command } from 'commander';
import { startDatabase, stopDatabase, resetDatabase, listDatabase } from './index';

const program = new Command();

program
  .name('sqlanydb-manager')
  .description('CLI for managing SAP SQL Anywhere 17 databases')
  .version('0.0.1');

program
  .command('start <databaseName>')
  .description('Start a database')
  .action(async (databaseName) => {
    try {
      await startDatabase(databaseName);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
  });

program
  .command('stop <databaseName>')
  .description('Stop a database')
  .action(async (databaseName) => {
    try {
      const result = await stopDatabase(databaseName);
      console.log(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
  });

program
  .command('reset <databaseName>')
  .description('Reset a database from its archive')
  .action(async (databaseName) => {
    try {
      const result = await resetDatabase(databaseName);
      console.log(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
  });

program
  .command('list')
  .description('List all databases')
  .action(() => {
    const databases = listDatabase();
    console.log(databases);
  });

program.parse(process.argv);