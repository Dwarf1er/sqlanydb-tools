import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { RollupOptions } from "rollup";

const production = !process.env.ROLLUP_WATCH;

const emptyJSPath = path.resolve(__dirname, "src", "package", "empty.js");

let resolveConfig: Record<string, any> = {};
if (!production) {
    resolveConfig.resolveOnly = [/^@sqlanydb-tools/];
}

const config: RollupOptions = {
    input: "src/extension.ts",
    output: {
        dir: "out",
        format: "cjs",
        sourcemap: !production,
        chunkFileNames: "[name].js",
        manualChunks: (id: string) =>
            id.includes("node_modules") ? "vendor" : undefined,
    },
    external: ["vscode"],
    plugins: [
        alias({ entries: [{ find: /^@aws-sdk.*/, replacement: emptyJSPath }] }),
        resolve(resolveConfig),
        typescript(),
        commonjs(),
    ],
};

export default config;
