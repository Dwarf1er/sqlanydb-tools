import { Command } from "commander";
import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { startDatabase, stopDatabase, resetDatabase, listDatabase } from "./databaseManager";
import * as path from "path";
import * as fs from "fs";

const cliConfigPath = path.join(__dirname, "config.json");
if (!fs.existsSync(cliConfigPath)) {
	console.error(
		`Configuration file not found at '${cliConfigPath}'. Please create a 'config.json' file in the same directory.`
	);
	process.exit(1);
}

const databaseConfigurationManager = new DatabaseConfigurationManager(cliConfigPath);

const program = new Command();

program.name("sqlanydb-manager").description("CLI for managing SAP SQL Anywhere 17 databases").version("0.0.1");

program
	.command("start <databaseName>")
	.description("Start a database")
	.action(async (databaseName) => {
		try {
			await startDatabase(databaseName, databaseConfigurationManager);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred.");
			}
		}
	});

program
	.command("stop <databaseName>")
	.description("Stop a database")
	.action(async (databaseName) => {
		try {
			const result = await stopDatabase(databaseName, databaseConfigurationManager);
			console.log(result);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred.");
			}
		}
	});

program
	.command("reset <databaseName>")
	.description("Reset a database from its archive")
	.action(async (databaseName) => {
		try {
			const result = await resetDatabase(databaseName, databaseConfigurationManager);
			console.log(result);
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error("An unknown error occurred.");
			}
		}
	});

program
	.command("list")
	.description("List all databases")
	.action(() => {
		const databases = listDatabase(databaseConfigurationManager);
		console.log(databases);
	});

program.parse(process.argv);
