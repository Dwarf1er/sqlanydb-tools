import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { startDatabase } from "@sqlanydb-tools/sqlanydb-manager";

import { DatabaseTreeDataProvider } from "../models/database-tree-data-provider";
import { checkAndUpdateDatabaseStatus } from "../services/database-status";

export async function startDatabaseCommand(
    treeDataProvider: DatabaseTreeDataProvider,
    databaseConfigurationManager: DatabaseConfigurationManager
) {
    return vscode.commands.registerCommand(
        "sqlanydb-tools-vscode.startDatabase",
        async () => {
            const databases = treeDataProvider.getChildren();
            if (databases.length > 0) {
                const databaseName = databases[0].databaseConfiguration.name;

                await vscode.window.withProgress(
                    {
                        title: "Starting Database...",
                        location: vscode.ProgressLocation.Notification,
                    },
                    async () => {
                        await startDatabase(
                            databaseName,
                            databaseConfigurationManager
                        );
                        await checkAndUpdateDatabaseStatus(
                            treeDataProvider,
                            databaseConfigurationManager
                        );
                    }
                );
            }
        }
    );
}
