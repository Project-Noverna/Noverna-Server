// tools/configs/bun-build.ts
import type { BuildConfig } from "bun";
import Bun from "bun";

export function createFiveMBuild(options: { entrypoint: string; outdir: string; external?: string[] }): BuildConfig {
	return {
		entrypoints: [options.entrypoint],
		outdir: options.outdir,
		target: "node",
		format: "cjs",
		minify: false,
		sourcemap: "none",
		external: options.external || [],
		naming: "[name].js",
	};
}

// Verwendung:
await Bun.build(
	createFiveMBuild({
		entrypoint: "./src/index.ts",
		outdir: "./dist",
		external: ["redis", "pg"],
	}),
);
