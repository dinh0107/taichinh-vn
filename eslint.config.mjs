import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "_next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cursor skill tooling + Plesk/Node CJS helpers (not app source)
    ".cursor/**",
    "app.js",
    "scripts/**",
  ]),
]);

export default eslintConfig;
