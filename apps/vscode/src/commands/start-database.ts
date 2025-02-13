import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { startDatabase } from "@sqlanydb-tools/sqlanydb-manager";
import { isOk } from "@sqlanydb-tools/sqlanydb-utils";

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
                const databaseDisplayName = databases[0].databaseConfiguration.displayName;

                await vscode.window.withProgress(
                    {
                        title: "Starting Database...",
                        location: vscode.ProgressLocation.Notification,
                    },
                    async () => {
                        const result = await startDatabase(
                            databaseDisplayName,
                            databaseConfigurationManager
                        );

                        if (isOk(result)) {
                            vscode.window.showInformationMessage(`Database '${databaseDisplayName}' started successfully.`);
                        } else {
                            vscode.window.showErrorMessage(
                                `Error starting database '${databaseDisplayName}': ${result.error}`
                            );
                        }

                        await checkAndUpdateDatabaseStatus(
                            treeDataProvider,
                            databaseConfigurationManager
                        );
                    }
                );
            } else {
                vscode.window.showErrorMessage("No databases found in the configuration.");
            }
        }
    );
}
