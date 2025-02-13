import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import StreamZip from "node-stream-zip";
import { promisify } from "util";

import { DatabaseConfiguration, DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { Result, isErr, isOk } from "@sqlanydb-tools/sqlanydb-utils";

export const startDatabase = async (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<string, string>> => {
    const configurationResult = findDatabaseConfiguration(databaseDisplayName, databaseConfigurationManager);

    if (isErr(configurationResult)) {
        return Result.err(`Error: ${configurationResult.error}`);
    }

    const databaseConfiguration = configurationResult.value;

    const commandParts: string[] = [
        `dbeng17 "${path.join(databaseConfiguration.path, databaseConfiguration.name + ".db")}" -n ${databaseConfiguration.displayName}`,
    ];

    if (databaseConfiguration.serverPort) {
        commandParts.push(`-x TCPIP(port=${databaseConfiguration.serverPort};DOBROAD=NO)`);
    }

    if (databaseConfiguration.httpPort) {
        commandParts.push(`-xs http(port=${databaseConfiguration.httpPort};dbn=${databaseConfiguration.displayName})`);
    }

    if (databaseConfiguration.cacheSize) {
        commandParts.push(`-ch "${databaseConfiguration.cacheSize}"`);
    }

    const command = commandParts.join(" ");

    try {
        await executeDetachedCommand(command);
        return Result.ok(`Database ${databaseDisplayName} started successfully.`);
    } catch (error) {
        return Result.err(`Error starting database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const stopDatabase = async (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<string, string>> => {
    const databaseConfigurationResult = findDatabaseConfiguration(databaseDisplayName, databaseConfigurationManager).map(
        (databaseConfiguration) => {
            return databaseConfiguration;
        }
    );

    if (isErr(databaseConfigurationResult)) {
        return Result.err("Error accessing database configuration");
    }

    const databaseConfiguration = databaseConfigurationResult.value;

    const commandResult = await executeCommand(`dbstop ${databaseConfiguration.displayName} -y`);

    if (isOk(commandResult)) {
        return Result.ok(commandResult.value);
    } else {
        return Result.err(commandResult.error);
    }
};

export const resetDatabase = async (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<string, string>> => {
    const configurationResult = findDatabaseConfiguration(databaseDisplayName, databaseConfigurationManager);

    if (isErr(configurationResult)) {
        return Result.err(`Error: ${configurationResult.error}`);
    }

    const databaseConfiguration = configurationResult.value;

    let archivePath: string;
    if(databaseConfiguration.archivePath) {
        archivePath = databaseConfiguration.archivePath;
    } else {
        return Result.err("Error: Archive path not found in database configuration.");
    }

    if (!fs.existsSync(archivePath)) {
        return Result.err("Error: Archive file not found.");
    }

    await stopDatabase(databaseDisplayName, databaseConfigurationManager);

    const deleteFilesResult = deleteDatabaseFiles(databaseConfiguration.path);
    if (isErr(deleteFilesResult)) {
        return Result.err(deleteFilesResult.error);
    }

    await extractArchive(archivePath, databaseConfiguration);

    return Result.ok("Database reset from archive successfully.");
};

const deleteDatabaseFiles = (databaseDir: string): Result<boolean, string> => {
    try {
        const files = fs.readdirSync(databaseDir);
        for (const file of files) {
            const filePath = path.join(databaseDir, file);
            if (fs.statSync(filePath).isFile() && !(path.extname(file).toLowerCase() === '.exe' || path.extname(file).toLowerCase() === '.zip')) {
                
                fs.unlinkSync(filePath);
            }
        }
        return Result.ok(true);
    } catch (error) {
        return Result.err(`Error deleting database files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const extractArchive = async (archivePath: string, databaseConfiguration: DatabaseConfiguration): Promise<Result<string, string>> => {
    const fileExtension = path.extname(archivePath).toLowerCase();
    const filePath = path.join(databaseConfiguration.path, databaseConfiguration.name + ".db");

    if (fileExtension === ".exe") {
        const commandResult = await executeCommand(`7z x "${archivePath}" -so > ${filePath}`);
        if (isOk(commandResult)) {
            return Result.ok(commandResult.value);
        } else {
            return Result.err(commandResult.error);
        }
    }

    if (fileExtension === ".zip") {
        const zip = new StreamZip.async({ file: archivePath });
        const entries = await zip.entries();
        const firstEntryName = Object.keys(entries)[0];
        await zip.extract(firstEntryName, filePath);
        await zip.close();

        return Result.ok("Database reset successfully.");
    }

    return Result.err("Database not reset.");
};

export const listDatabase = (databaseConfigurationManager: DatabaseConfigurationManager) => {
    return databaseConfigurationManager.getDatabases();
};

const execAsync = promisify(exec);

const executeCommand = async (command: string): Promise<Result<string, string>> => {
    try {
        console.log(command);
        const { stdout } = await execAsync(command);
        return Result.ok(stdout);
    } catch (error) {
        if (error instanceof Error) {
            return Result.err(error.message);
        }
        return Result.err("An unknown error has occurred.");
    }
};

const executeDetachedCommand = (command: string): void => {
    const cmdParts = command.split(" ");
    const childProcess = spawn(cmdParts[0], cmdParts.slice(1), {
        shell: true,
        detached: true,
        stdio: "ignore",
    });

    childProcess.unref();
};

export const pingDatabase = async (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<boolean, string>> => {
    const configurationResult = findDatabaseConfiguration(databaseDisplayName, databaseConfigurationManager);

    if (isErr(configurationResult)) {
        return Result.err(`Error retrieving database configuration: ${configurationResult.error}`);
    }

    const databaseConfiguration = configurationResult.value;

    const pingCommand = `dbping -c "DBN=${databaseConfiguration.displayName}"`;

    const commandResult = await executeCommand(pingCommand);

    if (isOk(commandResult) && (commandResult.value.includes("Ping server successful.") || commandResult.value.includes("Ping du serveur réussi."))) {
        return Result.ok(true);
    } else {
        return Result.ok(false);
    }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const exponentialBackoff = (attempt: number) => Math.min(10000, Math.pow(2, attempt) * 100);

export const pingDatabaseWithRetry = async (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager,
    retries: number = 5
): Promise<Result<boolean, string>> => {
    let pingCommandResult: Result<boolean, string> = Result.ok(false);

    for (let attempt = 0; attempt < retries; attempt++) {
        pingCommandResult = await pingDatabase(databaseDisplayName, databaseConfigurationManager);

        const waitTime = exponentialBackoff(attempt);
        await delay(waitTime);
    }

    return pingCommandResult;
};

const findDatabaseConfiguration = (
    databaseDisplayName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Result<DatabaseConfiguration, string> => {
    const databases = databaseConfigurationManager.getDatabases();
    const database = databases.find((d) => d.displayName === databaseDisplayName);

    if (database) {
        return Result.ok(database);
    }

    return Result.err(`Database ${databaseDisplayName} not found.`);
};