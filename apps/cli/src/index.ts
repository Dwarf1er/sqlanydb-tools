import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

import { isOk, isErr } from "@sqlanydb-tools/sqlanydb-utils";
import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import {
    listDatabase,
    pingDatabase,
    pingDatabaseWithRetry,
    resetDatabase,
    startDatabase,
    stopDatabase,
} from "@sqlanydb-tools/sqlanydb-manager";

const cliConfigPath = path.join(__dirname, "config.json");
if (!fs.existsSync(cliConfigPath)) {
    console.error(
        `Configuration file not found at '${cliConfigPath}'. Please create a 'config.json' file in the same directory.`
    );
    process.exit(1);
}

const databaseConfigurationManager = new DatabaseConfigurationManager(
    cliConfigPath
);

const program = new Command();

program
    .name("sqlanydb-manager")
    .description("CLI for managing SAP SQL Anywhere 17 databases")
    .version("0.0.1");

program
    .command("start <databaseDisplayName>")
    .description("Start a database")
    .action(async (databaseDisplayName) => {
        const result = await startDatabase(databaseDisplayName, databaseConfigurationManager);

        if (isOk(result)) {
            console.log(result.value);
        } else {
            console.error(result.error);
        }
    });

program
    .command("stop <databaseDisplayName>")
    .description("Stop a database")
    .action(async (databaseDisplayName) => {
        const result = await stopDatabase(databaseDisplayName, databaseConfigurationManager);

        if (isOk(result)) {
            console.log(result.value);
        } else {
            console.error(result.error);
        }
    });

// program
//     .command("reset <databaseName>")
//     .description("Reset a database from its archive")
//     .action(async (databaseName) => {
//         try {
//             const result = await resetDatabase(
//                 databaseName,
//                 databaseConfigurationManager
//             );
//             console.log(result);
//         } catch (error) {
//             if (error instanceof Error) {
//                 console.error(error.message);
//             } else {
//                 console.error("An unknown error occurred.");
//             }
//         }
//     });

program
    .command("list")
    .description("List all databases")
    .action(() => {
        const databases = listDatabase(databaseConfigurationManager);
        console.log(databases);
    });

program
    .command("ping <databaseDisplayName>")
    .description("Ping a database to check if it's running")
    .option("-r, --retry", "Use retry logic to check the database status")
    .action(async (databaseDisplayName, options) => {
        const useRetry = options.retry || false;
        const result = useRetry
            ? await pingDatabaseWithRetry(databaseDisplayName, databaseConfigurationManager)
            : await pingDatabase(databaseDisplayName, databaseConfigurationManager);

        if (isOk(result)) {
            console.log(
                `Database ${databaseDisplayName} is ${result.value ? "running" : "not reachable"}.`
            );
        } else {
            console.error(result.error);
        }
    });

program.parse(process.argv);
