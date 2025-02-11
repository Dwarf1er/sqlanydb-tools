import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { pingDatabaseWithRetry } from "@sqlanydb-tools/sqlanydb-manager";

import { DatabaseTreeDataProvider } from "../models/database-tree-data-provider";
import { isOk } from "@sqlanydb-tools/sqlanydb-utils";

export async function checkAndUpdateDatabaseStatus(
    treeDataProvider: DatabaseTreeDataProvider,
    databaseConfigurationManager: DatabaseConfigurationManager
) {
    const databases = treeDataProvider.getChildren();
    if (databases.length > 0) {
        const databaseDisplayName = databases[0].databaseConfiguration.displayName;
        const result = await pingDatabaseWithRetry(databaseDisplayName, databaseConfigurationManager);

        if (isOk(result)) {
            const databaseIsRunning = result.value;
            vscode.commands.executeCommand(
                "setContext",
                "sqlanydb-tools-vscode.databaseIsRunning",
                databaseIsRunning
            );
        } else {
            const errorMessage = result.error;
            vscode.window.showErrorMessage(`Error checking database status: ${errorMessage}`);
            vscode.commands.executeCommand(
                "setContext",
                "sqlanydb-tools-vscode.databaseIsRunning",
                false
            );
        }
    } else {
        vscode.commands.executeCommand(
            "setContext",
            "sqlanydb-tools-vscode.databaseIsRunning",
            false
        );
        vscode.window.showErrorMessage("No databases found in the configuration.");
    }
}
