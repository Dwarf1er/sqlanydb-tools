import * as vscode from "vscode";
import { getDatabaseConfiguration } from "./configuration";
import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { DatabaseTreeDataProvider } from "./models/database-tree-data-provider";
import { startDatabaseCommand, stopDatabaseCommand, resetDatabaseCommand } from "./commands";
import { checkAndUpdateDatabaseStatus } from "./services/database-status";

export async function activate(context: vscode.ExtensionContext) {
	const workspaceConfiguration = getDatabaseConfiguration();
	const databaseConfigurationManager = new DatabaseConfigurationManager(undefined, workspaceConfiguration);
	const treeDataProvider = new DatabaseTreeDataProvider(databaseConfigurationManager);

	vscode.window.createTreeView("sqlanydb-manager", { treeDataProvider });

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration("sqlanydb-tools-vscode.databases")) {
				const workspaceConfiguration = getDatabaseConfiguration();
				databaseConfigurationManager.updateConfiguration(workspaceConfiguration);
				treeDataProvider.refresh();
			}
		}),
		await startDatabaseCommand(treeDataProvider, databaseConfigurationManager),
		await stopDatabaseCommand(treeDataProvider, databaseConfigurationManager),
		await resetDatabaseCommand(treeDataProvider, databaseConfigurationManager)
	);

	checkAndUpdateDatabaseStatus(treeDataProvider, databaseConfigurationManager);
}

export function deactivate() {}
