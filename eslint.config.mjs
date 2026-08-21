import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /*
      Build output, not source. ESLint's flat config does not read .gitignore,
      so without this it lints 8.3 MB of generated JS in dist/ and reports
      20,000+ problems — which is how `npm run lint` became a command nobody
      runs, and how two dead variables in scripts/ survived review.
    */
    "dist/**",
  ]),
]);

export default eslintConfig;
