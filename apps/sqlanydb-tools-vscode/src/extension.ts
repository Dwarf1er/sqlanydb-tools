import * as vscode from "vscode";
import { DatabaseConfiguration, DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { startDatabase, stopDatabase, resetDatabase, pingDatabase } from "@sqlanydb-tools/sqlanydb-manager";

const getDatabaseConfiguration = (): DatabaseConfiguration[] => {
	const workspaceConfiguration = vscode.workspace.getConfiguration("sqlanydb-tools-vscode");
	return workspaceConfiguration.get<DatabaseConfiguration[]>("databases") || [];
};

class DatabaseTreeItem extends vscode.TreeItem {
	constructor(public readonly databaseConfiguration: DatabaseConfiguration) {
		super(databaseConfiguration.name, vscode.TreeItemCollapsibleState.None);
	}
}

class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

	constructor(private databaseConfigurationManager: DatabaseConfigurationManager) {}

	getTreeItem(element: DatabaseTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): DatabaseTreeItem[] {
		const databases = this.databaseConfigurationManager.getDatabases();
		return databases.map((databaseConfiguration) => new DatabaseTreeItem(databaseConfiguration));
	}

	refresh() {
		this._onDidChangeTreeData.fire();
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
	const workspaceConfiguration = getDatabaseConfiguration();
	const databaseConfigurationManager = new DatabaseConfigurationManager(undefined, workspaceConfiguration);
	const treeDataProvider = new DatabaseTreeDataProvider(databaseConfigurationManager);

	vscode.window.createTreeView("sqlanydb-manager", { treeDataProvider });

	const updateDatabaseRunningContext = async () => {
		const databases = treeDataProvider.getChildren();
		if (databases.length > 0) {
			const databaseIsRunning = await pingDatabase(
				databases[0].databaseConfiguration.name,
				databaseConfigurationManager
			);
			vscode.commands.executeCommand("setContext", "sqlanydb-tools-vscode.databaseIsRunning", databaseIsRunning);
		} else {
			vscode.commands.executeCommand("setContext", "sqlanydb-tools-vscode.databaseIsRunning", false);
		}
	};

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration("sqlanydb-tools-vscode.databases")) {
				const workspaceConfiguration = getDatabaseConfiguration();
				databaseConfigurationManager.updateConfiguration(workspaceConfiguration);
				treeDataProvider.refresh();
			}
		}),
		vscode.commands.registerCommand("sqlanydb-tools-vscode.startDatabase", async () => {
			const databases = treeDataProvider.getChildren();
			if (databases.length > 0) {
				await startDatabase(databases[0].databaseConfiguration.name, databaseConfigurationManager);
				await delay(200);
				await updateDatabaseRunningContext();
			}
		}),
		vscode.commands.registerCommand("sqlanydb-tools-vscode.stopDatabase", async () => {
			const databases = treeDataProvider.getChildren();
			if (databases.length > 0) {
				await stopDatabase(databases[0].databaseConfiguration.name, databaseConfigurationManager);
				await delay(200);
				await updateDatabaseRunningContext();
			}
		}),
		vscode.commands.registerCommand("sqlanydb-tools-vscode.resetDatabase", async () => {
			const databases = treeDataProvider.getChildren();
			if (databases.length > 0) {
				await resetDatabase(databases[0].databaseConfiguration.name, databaseConfigurationManager);
				await delay(200);
				await updateDatabaseRunningContext();
			}
		})
	);
}

export function deactivate() {}
