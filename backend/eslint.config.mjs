import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules", "dist", "public", "uploads"], 
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": "off",
    },
    extends: [
      "eslint:recommended",
      "plugin:prettier/recommended",
      ...tseslint.configs.recommended,
    ],
  },
];
