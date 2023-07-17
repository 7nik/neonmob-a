import fs from "node:fs";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const server = fs.existsSync("cert/key.pem")
    ? {
        https: {
            key: fs.readFileSync(`cert/key.pem`),
            cert: fs.readFileSync(`cert/cert.pem`),
        },
        proxy: {},
    }
    : {};

export default defineConfig({
    plugins: [sveltekit(), tsconfigPaths()],
    server,
});
