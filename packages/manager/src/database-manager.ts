import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { DatabaseConfiguration, DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { Result, isErr, isOk } from "@sqlanydb-tools/sqlanydb-utils";

export const startDatabase = async (
    databaseName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<string, string>> => {
    const configurationResult = findDatabaseConfiguration(databaseName, databaseConfigurationManager);

    if (isErr(configurationResult)) {
        return Result.err(`Error: ${configurationResult.error}`);
    }

    const databaseConfiguration = configurationResult.value;

    const commandParts: string[] = [
        `dbeng17 "${path.join(databaseConfiguration.path, databaseConfiguration.name + ".db")}" -n ${databaseConfiguration.name}`,
    ];

    if (databaseConfiguration.serverPort) {
        commandParts.push(`-x TCPIP(port=${databaseConfiguration.serverPort};DOBROAD=NO)`);
    }

    if (databaseConfiguration.httpPort) {
        commandParts.push(`-xs http(port=${databaseConfiguration.httpPort};dbn=${databaseConfiguration.name})`);
    }

    if (databaseConfiguration.cacheSize) {
        commandParts.push(`-ch "${databaseConfiguration.cacheSize}"`);
    }

    const command = commandParts.join(" ");

    try {
        await executeDetachedCommand(command);
        return Result.ok(`Database ${databaseName} started successfully.`);
    } catch (error) {
        return Result.err(`Error starting database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const stopDatabase = async (
    databaseName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<string, string>> => {
    const databaseConfigurationResult = findDatabaseConfiguration(databaseName, databaseConfigurationManager).map(
        (databaseConfiguration) => {
            return databaseConfiguration;
        }
    );

    if (isErr(databaseConfigurationResult)) {
        return Result.err("Error accessing database configuration");
    }

    const databaseConfiguration = databaseConfigurationResult.value;

    const commandResult = await executeCommand(`dbstop ${databaseConfiguration.name}`);

    if (isOk(commandResult)) {
        return Result.ok(commandResult.value);
    } else {
        return Result.err(commandResult.error);
    }
};

// TODO - rewrite from scratch
export const resetDatabase = async () //databaseName: string,
    //databaseConfigurationManager: DatabaseConfigurationManager
    : Promise<string> => {
    return "";
};

export const listDatabase = (databaseConfigurationManager: DatabaseConfigurationManager) => {
    return databaseConfigurationManager.getDatabases();
};

const execAsync = promisify(exec);

const executeCommand = async (command: string): Promise<Result<string, string>> => {
    try {
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
    databaseName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Promise<Result<boolean, string>> => {
    const configurationResult = findDatabaseConfiguration(databaseName, databaseConfigurationManager);

    if (isErr(configurationResult)) {
        return Result.err(`Error retrieving database configuration: ${configurationResult.error}`);
    }

    const databaseConfiguration = configurationResult.value;

    const pingCommand = `dbping -c "DBN=${databaseConfiguration.name}"`;

    const commandResult = await executeCommand(pingCommand);

    if (isOk(commandResult)) {
        return Result.ok(commandResult.value.includes("Ping server successful."));
    } else {
        return Result.err(`Ping failed for database ${databaseName}: ${commandResult.error}`);
    }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const exponentialBackoff = (attempt: number) => Math.min(10000, Math.pow(2, attempt) * 100);

export const pingDatabaseWithRetry = async (
    databaseName: string,
    databaseConfigurationManager: DatabaseConfigurationManager,
    retries: number = 3
): Promise<Result<boolean, string>> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        const databaseIsRunning = await pingDatabase(databaseName, databaseConfigurationManager);
        if (databaseIsRunning) {
            return Result.ok(true);
        }

        const waitTime = exponentialBackoff(attempt);
        await delay(waitTime);
    }

    return Result.err(`Failed to ping the database ${databaseName} after ${retries} retries.`);
};

const findDatabaseConfiguration = (
    databaseName: string,
    databaseConfigurationManager: DatabaseConfigurationManager
): Result<DatabaseConfiguration, string> => {
    const databases = databaseConfigurationManager.getDatabases();
    const database = databases.find((d) => d.name === databaseName);

    if (database) {
        return Result.ok(database);
    }

    return Result.err(`Database ${databaseName} not found.`);
};