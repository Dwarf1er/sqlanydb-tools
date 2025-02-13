import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";

const config: RollupOptions = {
    input: "src/index.ts",
    output: {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        resolve({
            resolveOnly: [/src/],
        }),
        typescript({
            rootDir: "src",
            declarationDir: "dist",
            declaration: true,
        }),
        commonjs(),
    ],
};

export default config;
