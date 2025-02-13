import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";

import {
    resetDatabaseCommand,
    startDatabaseCommand,
    stopDatabaseCommand,
} from "./commands";
import { getDatabaseConfiguration } from "./configuration";
import { DatabaseTreeDataProvider } from "./models/database-tree-data-provider";
import { checkAndUpdateDatabaseStatus } from "./services/database-status";
import { isOk, isErr } from "@sqlanydb-tools/sqlanydb-utils";

export async function activate(context: vscode.ExtensionContext) {
    const databaseConfiguration = getDatabaseConfiguration();

    if (isErr(databaseConfiguration)) {
        vscode.window.showErrorMessage(`Error: ${databaseConfiguration.error}`);
    }

    const databaseConfigurationManager = new DatabaseConfigurationManager(undefined, databaseConfiguration.value);
    const treeDataProvider = new DatabaseTreeDataProvider(databaseConfigurationManager);

    vscode.window.createTreeView("sqlanydb-manager", { treeDataProvider });

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("sqlanydb-tools-vscode.database")) {
                const updatedDatabaseConfiguration = getDatabaseConfiguration();
                if (isOk(updatedDatabaseConfiguration)) {
                    databaseConfigurationManager.updateConfiguration(updatedDatabaseConfiguration.value);
                    treeDataProvider.refresh();
                } else {
                    vscode.window.showErrorMessage(`Error: ${updatedDatabaseConfiguration.error}`);
                }
            }
        }),
        await startDatabaseCommand(treeDataProvider, databaseConfigurationManager),
        await stopDatabaseCommand(treeDataProvider, databaseConfigurationManager),
        await resetDatabaseCommand(treeDataProvider, databaseConfigurationManager)
    );

    checkAndUpdateDatabaseStatus(treeDataProvider, databaseConfigurationManager);
}

export function deactivate() {}
