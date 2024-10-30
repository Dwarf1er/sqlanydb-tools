import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";

const production = !process.env.ROLLUP_WATCH;

const config: RollupOptions = {
    input: "src/index.ts",
    output: {
        dir: "dist",
        format: "cjs",
        sourcemap: !production,
    },
    plugins: [
        resolve({
            resolveOnly: [/^@sqlanydb-tools/],
        }),
        typescript(),
        commonjs(),
    ],
};

export default config;
