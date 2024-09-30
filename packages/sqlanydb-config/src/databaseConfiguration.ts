export interface DatabaseConfiguration {
    name: string;
    path: string;
    archivePath?: string;
    serverPort?: string;
    httpPort?: string;
    cacheSize?: string;
}