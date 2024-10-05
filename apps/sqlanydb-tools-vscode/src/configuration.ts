import * as vscode from "vscode";
import { DatabaseConfiguration } from "@sqlanydb-tools/sqlanydb-config";

export function getDatabaseConfiguration(): DatabaseConfiguration[] {
	const workspaceConfiguration = vscode.workspace.getConfiguration("sqlanydb-tools-vscode");
	return workspaceConfiguration.get<DatabaseConfiguration[]>("databases") || [];
}
