import { exec, spawn } from "child_process";
import { DatabaseConfiguration, databaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import * as fs from "fs";
import * as path from "path";
import * as unzipper from "unzipper";

export const startDatabase = async (databaseName: string): Promise<void> => {
    const databaseConfiguration = await findDatabaseConfiguration(databaseName);
    const commandParts: string[] = [`dbeng17 "${path.join(databaseConfiguration.path, databaseConfiguration.name + ".db")}" -n ${databaseConfiguration.name}`];

    if(databaseConfiguration.serverPort) {
        commandParts.push(`-x TCPIP(port=${databaseConfiguration.serverPort};DOBROAD=NO)`);
    }

    if(databaseConfiguration.httpPort) {
        commandParts.push(`-xs http(port=${databaseConfiguration.httpPort};dbn=${databaseConfiguration.name})`);
    }

    if(databaseConfiguration.cacheSize) {
        commandParts.push(`-ch "${databaseConfiguration.cacheSize}"`);
    }

    const command = commandParts.join(' ');
    
    await executeDetachedCommand(command);
};

export const stopDatabase = async(databaseName: string): Promise<string> => {
    const databaseConfiguration = await findDatabaseConfiguration(databaseName);
    return(executeCommand(`dbstop ${databaseConfiguration.name}`));
};

export const resetDatabase = async(databaseName: string): Promise<string> => {
    const databaseConfiguration = await findDatabaseConfiguration(databaseName);

    if(!databaseConfiguration.archivePath) {
        throw new Error(`No archive path defined for database ${databaseName}`);
    }

    const archivePath: string = databaseConfiguration.archivePath;

    if(!fs.existsSync(databaseConfiguration.archivePath)) {
        throw new Error(`Archive not found: ${databaseConfiguration.archivePath}`);
    }

    await stopDatabase(databaseName).catch(err => {
        console.warn(`Database is not running or could not stop database ${databaseName}: ${err.message}`);
    });

    return new Promise((resolve, reject) => {
        fs.createReadStream(archivePath)
            .pipe(unzipper.Extract({ path: databaseConfiguration.archivePath }))
            .on("close", () => {
                const extractedArchivePath = path.join(archivePath, databaseConfiguration.name);

                if(fs.existsSync(extractedArchivePath)) {
                    fs.renameSync(extractedArchivePath, databaseConfiguration.path);
                    resolve(`Database ${databaseName} has been reset from archive: ${databaseConfiguration.archivePath}`);
                } else {
                    reject(new Error(`Extracted database file not found after extraction: ${databaseConfiguration.path}}`));
                }
            })
            .on("error", (error) => {
                reject(new Error(`Failed to extract archive: ${error.message}`));
            });
    });
};

export const listDatabase = () => {
    return databaseConfigurationManager.getDatabases();
};

const executeCommand = (command: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if(error) {
                return reject(`Error: ${stderr}`);
            }
            resolve(stdout);
        });
    });
};

const executeDetachedCommand = (command: string): Promise<void> => {
    return new Promise((resolve) => {
        const cmdParts = command.split(' ');
        const childProcess = spawn(cmdParts[0], cmdParts.slice(1), { shell: true, detached: true, stdio: "ignore" });

        childProcess.unref();
        resolve();
    });
};

const findDatabaseConfiguration = async (databaseName: string): Promise<DatabaseConfiguration> => {
    const databases = databaseConfigurationManager.getDatabases();
    const database = databases.find(d => d.name === databaseName);
    if (database) {
        return database;
    }
    throw new Error(`Database ${databaseName} not found.`);
};