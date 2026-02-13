import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "next-env.d.ts",
      "eslint.config.mjs",
      "postcss.config.js",
      "next.config.ts",
      "tailwind.config.ts",
      "src/types/**/*.d.ts",
    ],
  },

  // Base config for all JS/TS files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // TypeScript specific config
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "import/no-default-export": "error",
    },
  },

  // Allow default exports for Next.js special files
  {
    files: [
      "src/app/**/page.{ts,tsx}",
      "src/app/**/layout.{ts,tsx}",
      "src/app/**/error.{ts,tsx}",
      "src/app/**/loading.{ts,tsx}",
      "src/app/**/not-found.{ts,tsx}",
      "src/app/api/**/*.ts",
      "src/app/sitemap.ts",
      "src/app/robots.ts",
      "next.config.{js,ts,mjs}",
      "tailwind.config.{js,ts}",
      "postcss.config.{js,ts,mjs}",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
