import * as vscode from "vscode";
import { DatabaseConfigurationManager } from "@sqlanydb-tools/sqlanydb-config";
import { DatabaseTreeItem } from "./database-tree-item";

export class DatabaseTreeDataProvider
    implements vscode.TreeDataProvider<DatabaseTreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<void> =
        new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData: vscode.Event<void> =
        this._onDidChangeTreeData.event;

    constructor(
        private databaseConfigurationManager: DatabaseConfigurationManager
    ) {}

    getTreeItem(element: DatabaseTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): DatabaseTreeItem[] {
        const database = this.databaseConfigurationManager.getDatabases();
        return database.map((databaseConfiguration) => new DatabaseTreeItem(databaseConfiguration));
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
