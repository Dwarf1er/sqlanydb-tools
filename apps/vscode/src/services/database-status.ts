import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { pingDatabaseWithRetry } from "@sqlanydb-tools/sqlanydb-manager";

import { DatabaseTreeDataProvider } from "../models/database-tree-data-provider";

export async function checkAndUpdateDatabaseStatus(
    treeDataProvider: DatabaseTreeDataProvider,
    databaseConfigurationManager: DatabaseConfigurationManager
) {
    const databases = treeDataProvider.getChildren();
    if (databases.length > 0) {
        const databaseIsRunning = await pingDatabaseWithRetry(
            databases[0].databaseConfiguration.name,
            databaseConfigurationManager
        );
        vscode.commands.executeCommand(
            "setContext",
            "sqlanydb-tools-vscode.databaseIsRunning",
            databaseIsRunning
        );
    } else {
        vscode.commands.executeCommand(
            "setContext",
            "sqlanydb-tools-vscode.databaseIsRunning",
            false
        );
    }
}
