import * as vscode from "vscode";
import { DatabaseConfiguration } from "@sqlanydb-tools/sqlanydb-config";

export class DatabaseTreeItem extends vscode.TreeItem {
	constructor(public readonly databaseConfiguration: DatabaseConfiguration) {
		super(databaseConfiguration.name, vscode.TreeItemCollapsibleState.None);
	}
}
