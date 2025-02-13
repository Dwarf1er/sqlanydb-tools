export interface DatabaseConfiguration {
    displayName: string;
    name: string;
    path: string;
    archivePath?: string;
    serverPort?: string;
    httpPort?: string;
    cacheSize?: string;
}
