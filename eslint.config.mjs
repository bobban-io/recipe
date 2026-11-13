import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      // Agent worktrees: other checkouts of this repo.
      ".claude/**",
      "node_modules/**",
      "dist/**",
      ".output/**",
      ".nitro/**",
      "src/routeTree.gen.ts",
      "*.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
);
