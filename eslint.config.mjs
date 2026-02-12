import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextConfig = compat.extends("next/core-web-vitals");
const tsRecommended = compat
  .extends("plugin:@typescript-eslint/recommended")
  .map((config) => ({ ...config, files: ["**/*.{ts,tsx}"] }));

export default [
  ...nextConfig,
  ...tsRecommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "import/no-default-export": "error",
      "react/jsx-props-no-spreading": "off",
    },
  },
  {
    files: [
      "src/app/**/page.{ts,tsx}",
      "src/app/**/layout.{ts,tsx}",
      "src/app/**/error.{ts,tsx}",
      "src/app/**/loading.{ts,tsx}",
      "src/app/api/**/*.ts",
      "next.config.{js,ts,mjs}",
      "tailwind.config.{js,ts}",
      "postcss.config.{js,ts,mjs}",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "prisma/**",
      "next-env.d.ts",
      "eslint.config.mjs",
      "postcss.config.js",
      "src/types/**/*.d.ts",
      "*.ts",
      "playwright/**",
      ".playwright-cli/**",
      "scripts/**",
      "lib/**",
    ],
  },
];
