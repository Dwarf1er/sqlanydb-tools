import * as fs from "fs";
import { DatabaseConfiguration } from "./database-configuration";

export class DatabaseConfigurationManager {
	private configurationPath: string;
	private configuration: DatabaseConfiguration[];

	constructor(configurationPath?: string, workspaceSettings?: DatabaseConfiguration[]) {
		if (!configurationPath && (!workspaceSettings || workspaceSettings.length === 0)) {
			throw new Error("You must provide either a configuration path or non-empty workspace settings.");
		}

		this.configurationPath = configurationPath || "";
		this.configuration = workspaceSettings || this.loadConfiguration();
	}

	public saveConfiguration() {
		fs.writeFileSync(this.configurationPath, JSON.stringify(this.configuration, null, 4));
	}

	public getDatabases(): DatabaseConfiguration[] {
		return this.configuration;
	}

	public addDatabase(database: DatabaseConfiguration) {
		this.configuration.push(database);
		this.saveConfiguration();
	}

	public removeDatabase(databaseName: string) {
		this.configuration = this.configuration.filter((database) => database.name !== databaseName);
		this.saveConfiguration();
	}

	private loadConfiguration(): DatabaseConfiguration[] {
		if (fs.existsSync(this.configurationPath)) {
			const data = fs.readFileSync(this.configurationPath, "utf-8");
			return JSON.parse(data) as DatabaseConfiguration[];
		}
		return [];
	}
}
