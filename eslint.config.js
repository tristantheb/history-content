// ESLint configuration
export default [
  {
    files: ["**/*.{js,cjs,mjs}", "!node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      semi: "error",
      quotes: ["error", "single"],
      "no-unused-vars": "warn",
      "no-undef": "error"
    },
    plugins: {},
  },
];
