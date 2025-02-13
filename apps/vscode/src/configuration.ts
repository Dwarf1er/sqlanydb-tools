import * as vscode from "vscode";

import { DatabaseConfiguration } from "@sqlanydb-tools/sqlanydb-config";
import { Result } from "@sqlanydb-tools/sqlanydb-utils";

export function getDatabaseConfiguration(): Result<DatabaseConfiguration, string> {
    const workspaceConfiguration = vscode.workspace.getConfiguration("sqlanydb-tools-vscode");

    const config = workspaceConfiguration.get<DatabaseConfiguration>("database");

    if (!config) {
        return Result.err("Database configuration not found.");
    }

    return Result.ok(config);
}