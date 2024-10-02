import * as vscode from "vscode";
import { DatabaseConfiguration, DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { startDatabase, stopDatabase, resetDatabase } from "@sqlanydb-tools/sqlanydb-manager";

const getDatabaseConfigurations = (): DatabaseConfiguration[] => {
	const config = vscode.workspace.getConfiguration("sqlanydb-tools-vscode");
	return config.get<DatabaseConfiguration[]>("databases") || [];
};

class DatabaseTreeItem extends vscode.TreeItem {
	constructor(public readonly dbConfig: DatabaseConfiguration) {
		super(dbConfig.name, vscode.TreeItemCollapsibleState.None);
		this.command = {
			command: "sqlanydb-tools-vscode.startDatabase",
			title: "Start Database",
			arguments: [dbConfig.name],
		};
	}
}

class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

	constructor(private databaseManager: DatabaseConfigurationManager) {}

	getTreeItem(element: DatabaseTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): DatabaseTreeItem[] {
		const databases = this.databaseManager.getDatabases();
		return databases.map((dbConfig) => new DatabaseTreeItem(dbConfig));
	}

	refresh() {
		this._onDidChangeTreeData.fire();
	}
}

export function activate(context: vscode.ExtensionContext) {
	const workspaceSettings = getDatabaseConfigurations();
	const databaseConfigManager = new DatabaseConfigurationManager(undefined, workspaceSettings);
	const treeDataProvider = new DatabaseTreeDataProvider(databaseConfigManager);

	vscode.window.createTreeView("sqlanydb-manager", { treeDataProvider });

	context.subscriptions.push(
		vscode.commands.registerCommand("sqlanydb-tools-vscode.startDatabase", async (dbName: string) => {
			await startDatabase(dbName, databaseConfigManager);
			treeDataProvider.refresh();
		}),
		vscode.commands.registerCommand("sqlanydb-tools-vscode.stopDatabase", async (dbName: string) => {
			await stopDatabase(dbName, databaseConfigManager);
			treeDataProvider.refresh();
		}),
		vscode.commands.registerCommand("sqlanydb-tools-vscode.resetDatabase", async (dbName: string) => {
			await resetDatabase(dbName, databaseConfigManager);
			treeDataProvider.refresh();
		})
	);
}

export function deactivate() {}
