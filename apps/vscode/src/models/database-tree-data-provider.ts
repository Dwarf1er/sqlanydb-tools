import * as vscode from "vscode";
import { DatabaseTreeItem } from "./database-tree-item";
import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";

export class DatabaseTreeDataProvider implements vscode.TreeDataProvider<DatabaseTreeItem> {
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
