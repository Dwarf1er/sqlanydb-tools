import * as fs from "fs";
import * as path from "path";
import { DatabaseConfiguration } from "./databaseConfiguration";

export class DatabaseConfigurationManager {
    private configurationPath: string;
    private configuration: DatabaseConfiguration[];

    constructor() {
        this.configurationPath = path.join(__dirname, "../config.json");
        this.configuration = this.loadConfiguration();
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
        this.configuration = this.configuration.filter(database => database.name !== databaseName);
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

export const databaseConfigurationManager = new DatabaseConfigurationManager();