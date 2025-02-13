import * as vscode from "vscode";

import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { resetDatabase } from "@sqlanydb-tools/sqlanydb-manager";
import { isOk } from "@sqlanydb-tools/sqlanydb-utils";

import { DatabaseTreeDataProvider } from "../models/database-tree-data-provider";
import { checkAndUpdateDatabaseStatus } from "../services/database-status";

export async function resetDatabaseCommand(
    treeDataProvider: DatabaseTreeDataProvider,
    databaseConfigurationManager: DatabaseConfigurationManager
) {
    return vscode.commands.registerCommand(
        "sqlanydb-tools-vscode.resetDatabase",
        async () => {
            const databases = treeDataProvider.getChildren();
            if (databases.length > 0) {
                const databaseDisplayName = databases[0].databaseConfiguration.displayName;

                await vscode.window.withProgress(
                    {
                        title: "Resetting Database...",
                        location: vscode.ProgressLocation.Notification,
                    },
                    async () => {
                        const result = await resetDatabase(
                            databaseDisplayName,
                            databaseConfigurationManager
                        );

                        if (isOk(result)) {
                            vscode.window.showInformationMessage(`Database '${databaseDisplayName}' reset successfully.`);
                        } else {
                            vscode.window.showErrorMessage(
                              `Error resetting database '${databaseDisplayName}': ${result.error}`  
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
