import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { stopDatabase } from "@sqlanydb-tools/sqlanydb-manager";

import { DatabaseTreeDataProvider } from "../models/database-tree-data-provider";
import { checkAndUpdateDatabaseStatus } from "../services/database-status";

export async function stopDatabaseCommand(
    treeDataProvider: DatabaseTreeDataProvider,
    databaseConfigurationManager: DatabaseConfigurationManager
) {
    return vscode.commands.registerCommand(
        "sqlanydb-tools-vscode.stopDatabase",
        async () => {
            const databases = treeDataProvider.getChildren();
            if (databases.length > 0) {
                const databaseName = databases[0].databaseConfiguration.name;

                await vscode.window.withProgress(
                    {
                        title: "Stopping Database...",
                        location: vscode.ProgressLocation.Notification,
                    },
                    async () => {
                        await stopDatabase(
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
