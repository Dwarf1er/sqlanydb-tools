<div align="center">

# SQL Anywhere Tools
##### Complete toolbox for SAP SQL Anwyhere 17

<img alt="sqlanydb-tools-logo" height="280" src="./assets/sqlanydb-tools-logo.png" />
</div>

# Project Description
The SQL Anywhere Tools project is a comprehensive suite of tools designed to simplify and streamline the management and development of SAP SQL Anywhere 17 databases. This project consists of a set of CLI tools for common database operations and a VSCode extension that integrates all of these tools into a seamless development environment.

By bundling both command-line utilities and an integrated VSCode experience in a single monorepo, this toolbox enables developers and DBAs to perform essential tasks more efficiently, whether working directly with the command line or within their IDE.

# Table Of Contents
- [SQL Anywhere Tools](#sql-anywhere-tools)
        - [Complete toolbox for SAP SQL Anwyhere 17](#complete-toolbox-for-sap-sql-anwyhere-17)
- [Project Description](#project-description)
- [Table Of Contents](#table-of-contents)
- [Feature Roadmap](#feature-roadmap)
- [Installation](#installation)
  - [VSCode extension](#vscode-extension)
  - [sqlanydb-manager CLI](#sqlanydb-manager-cli)
- [Usage](#usage)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Development Environment Setup](#development-environment-setup)
  - [Running the CLI tools](#running-the-cli-tools)
    - [sqlanydb-manager](#sqlanydb-manager)
  - [Running the VSCode extension](#running-the-vscode-extension)
- [License](#license)

# Feature Roadmap
- sqlanydb-manager CLI tool: start, stop, reset and ping local databases            [X]
  - accompanying feature support in sqlanydb-tools-vscode extension                 [X]
- database connector through sajdbc4.jar & dbjdbc17.jar included with sql anywhere  [ ]
  - accompanying feature support to run queries in sqlanydb-tools-vscode extension  [ ]
- sql anywhere language parser with ANTLR                                           [ ]
  - accompanying syntax highlighting in sqlanydb-tools-vscode extension             [ ]
  - prettier-plugin-sqlanydb for sql anywhere auto formatting support               [ ]
- LSP to suggest autocompletions based on database schema                           [ ]
- sqlanydb-migrator CLI tool: migration support for database development            [ ]
  - accompanying feature support in sqlanydb-tools-vscode extension                 [ ]
- database explorer in sqlanydb-tools-vscode-extension                              [ ]

# Installation

## VSCode extension

There are 2 ways to install the VSCode extension:
1. Navigate to the `Extensions` tab in VSCode and search for `sqlanydb-tools-vscode`
2. Download the VSIX file from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=dwarf1er.sqlanydb-tools-vscode)

## sqlanydb-manager CLI

[(Back to top)](#table-of-contents)

# Usage

[(Back to top)](#table-of-contents)

# Development

## Prerequisites

1. SAP SQL Anywhere 17
    You will need to have SAP SQL Anywhere 17 installed on your machine. You can obtain a developer license [here](https://www.sqlanywhere.info/EN/sql-anywhere/sql-anywhere-trial.html)
2. Create a SAP SQL Anywhere 17 Development Databse
    Once you have installed SAP SQL Anywhere 17, open `SQL Central` and in the top bar of the application go to `Tools > SQL Anwyhere 17 > Create Database...` and follow the prompts
2. Node.JS (version 22.9.0)
    You can check your NodeJS version with the following command:
    ```bash
    node -v
    ```
    If you don't have the required version you can install it from the official [Node.JS website](https://nodejs.org) or use a node version manager like [nvm](https://github.com/nvm-sh/nvm) or [nvm for windows](https://github.com/coreybutler/nvm-windows) to manage multiple versions.
3. Turborepo
    This project uses [turbo](https://turbo.build) to manage and build multiple packages in the monorepo efficiently. You will need to install turborepo globally:
    ```bash
    npm install -g turbo
    ```
4. ts-node
    To make it easier to run and test the CLI and packages written in TypeScript, we recommend using [ts-node](https://www.npmjs.com/package/ts-node). You will need to install it globally:
    ```bash
    npm install -g ts-node
    ```

## Development Environment Setup

Once you have all the prerequisites installed, follow these steps to get your development environment up and running:

1. Clone the repository
    ```bash
    git clone https://github.com/Dwarf1er/sqlanydb-tools.git
    ```
2. Install dependencies
    ```bash
    npm install
    ```
3. Build the project
    ```bash
    turbo run build
   ```

## Running the CLI tools

To run the command-line tools locally, use the following command:
    ```bash
    ts-node /path/to/clit-tools.ts
    ```

### sqlanydb-manager

For sqlanydb-manager, rename `config.example.json` to `config.json` and fill it in with the appropriate information considering the database that you created in `step 2` of [Prerequisites](#prerequisites)

## Running the VSCode extension

When working on this project in VSCode you can press `F5` to launch the extension in a new `Extension Development Host` window

[(Back to top)](#table-of-contents)

# License

This project is licensed under the [MIT License](LICENSE)