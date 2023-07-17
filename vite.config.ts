import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [sveltekit(), tsconfigPaths()],
    server: {
        proxy: {
            "/api-proxy/pa/": {
                target: "https://www.neonmob.com/api/",
                changeOrigin: true,
                autoRewrite: true,
                followRedirects: true,
                rewrite (path) {
                    return path.slice(13);
                },
                cookieDomainRewrite: "",
            },
            "/api-proxy/pn/": {
                target: "https://napi.neonmob.com/",
                changeOrigin: true,
                autoRewrite: true,
                followRedirects: true,
                rewrite (path) {
                    return path.slice(13);
                },
            },
        },
    },
});
