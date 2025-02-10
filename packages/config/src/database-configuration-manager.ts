import * as fs from "fs";

import { DatabaseConfiguration } from "./database-configuration";

export class DatabaseConfigurationManager {
    private configurationPath: string;
    private configuration: DatabaseConfiguration[];

    constructor(configurationPath: string = "", workspaceSettings: DatabaseConfiguration | null = null) {
        this.configurationPath = configurationPath;
        this.configuration = workspaceSettings ? [workspaceSettings] : this.loadConfiguration();
    }

    public updateConfiguration(newConfiguration: DatabaseConfiguration): void {
        this.configuration = [newConfiguration];
    }

    public getDatabases(): DatabaseConfiguration[] {
        return this.configuration;
    }

    private loadConfiguration(): DatabaseConfiguration[] {
        if (fs.existsSync(this.configurationPath)) {
            const data = fs.readFileSync(this.configurationPath, "utf-8");
            return JSON.parse(data) as DatabaseConfiguration[];
        }
        return [];
    }
}
