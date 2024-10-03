import { exec, spawn } from "child_process";
import { DatabaseConfiguration, DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import * as fs from "fs";
import * as path from "path";
import * as unzipper from "unzipper";

export const startDatabase = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager
): Promise<void> => {
	const databaseConfiguration = await findDatabaseConfiguration(databaseName, databaseConfigurationManager);
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

	await executeDetachedCommand(command);
};

export const stopDatabase = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager
): Promise<string> => {
	const databaseConfiguration = await findDatabaseConfiguration(databaseName, databaseConfigurationManager);
	return executeCommand(`dbstop ${databaseConfiguration.name}`);
};

export const resetDatabase = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager
): Promise<string> => {
	const databaseConfiguration = await findDatabaseConfiguration(databaseName, databaseConfigurationManager);

	if (!databaseConfiguration.archivePath) {
		throw new Error(`No archive path defined for database ${databaseName}`);
	}

	const archivePath: string = databaseConfiguration.archivePath;

	if (!fs.existsSync(databaseConfiguration.archivePath)) {
		throw new Error(`Archive not found: ${databaseConfiguration.archivePath}`);
	}

	await stopDatabase(databaseName, databaseConfigurationManager).catch((err) => {
		console.warn(`Database is not running or could not stop database ${databaseName}: ${err.message}`);
	});

	const dbFilePath = path.join(databaseConfiguration.path, `${databaseConfiguration.name}.db`);
	if (fs.existsSync(dbFilePath)) {
		await fs.promises.rm(dbFilePath, { force: true });
	}

	return new Promise((resolve, reject) => {
		fs.createReadStream(archivePath)
			.pipe(unzipper.Extract({ path: databaseConfiguration.path }))
			.on("close", async () => {
				const extractedFiles = await fs.promises.readdir(databaseConfiguration.path);
				const dbFiles = extractedFiles.filter((file) => file.endsWith(".db"));

				if (dbFiles.length === 1) {
					const extractedDbPath = path.join(databaseConfiguration.path, dbFiles[0]);

					await fs.promises.rename(extractedDbPath, dbFilePath);
					resolve(`Database ${databaseName} has been reset from archive: ${archivePath}`);
				} else {
					reject(new Error(`Expected one .db file after extraction, found: ${dbFiles.length}`));
				}
			})
			.on("error", (error) => {
				reject(new Error(`Failed to extract archive: ${error.message}`));
			});
	});
};

export const listDatabase = (databaseConfigurationManager: DatabaseConfigurationManager) => {
	return databaseConfigurationManager.getDatabases();
};

const executeCommand = (command: string): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				return reject(`Error: ${stderr}`);
			}
			resolve(stdout);
		});
	});
};

export const pingDatabase = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager
): Promise<boolean> => {
	const databaseConfiguration = await findDatabaseConfiguration(databaseName, databaseConfigurationManager);

	const command = `dbping -c "DBN=${databaseConfiguration.name}"`;

	try {
		const result = await executeCommand(command);
		return result.includes("Ping server successful.");
	} catch (error) {
		console.error(`Ping failed for database ${databaseName}: ${error}`);
		return false;
	}
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const exponentialBackoff = (attempt: number) => Math.min(10000, Math.pow(2, attempt) * 100);

export const pingDatabaseWithRetry = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager,
	retries: number = 3
): Promise<boolean> => {
	for (let attempt = 0; attempt < retries; attempt++) {
		const databaseIsRunning = await pingDatabase(databaseName, databaseConfigurationManager);
		if (databaseIsRunning) {
			return true;
		}

		const waitTime = exponentialBackoff(attempt);
		await delay(waitTime);
	}

	return false;
};

const executeDetachedCommand = (command: string): Promise<void> => {
	return new Promise((resolve) => {
		const cmdParts = command.split(" ");
		const childProcess = spawn(cmdParts[0], cmdParts.slice(1), {
			shell: true,
			detached: true,
			stdio: "ignore",
		});

		childProcess.unref();
		resolve();
	});
};

const findDatabaseConfiguration = async (
	databaseName: string,
	databaseConfigurationManager: DatabaseConfigurationManager
): Promise<DatabaseConfiguration> => {
	const databases = databaseConfigurationManager.getDatabases();
	const database = databases.find((d) => d.name === databaseName);
	if (database) {
		return database;
	}
	throw new Error(`Database ${databaseName} not found.`);
};
