import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'src/generated/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // interdit any explicite : plus de valeur "je type plus rien ici"
      '@typescript-eslint/no-floating-promises': 'error', // interdit les promesses lancées sans await/void/catch
      '@typescript-eslint/no-unsafe-argument': 'error', // interdit de passer une valeur any en argument d'une fonction typée
      '@typescript-eslint/no-unused-vars': 'error', // interdit les variables/imports déclarés mais jamais utilisés

      '@typescript-eslint/no-unsafe-assignment': 'error', // interdit d'assigner une valeur any à une variable/propriété typée
      '@typescript-eslint/no-unsafe-call': 'error', // interdit d'appeler une valeur de type any comme une fonction
      '@typescript-eslint/no-unsafe-member-access': 'error', // interdit de lire une propriété sur une valeur de type any
      '@typescript-eslint/no-unsafe-return': 'error', // interdit de retourner une valeur any depuis une fonction typée
      '@typescript-eslint/naming-convention': [
        // impose un style de nommage cohérent (camelCase/PascalCase) par type d'identifiant
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variableLike', format: ['camelCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'property', format: ['camelCase'] },
        { selector: 'variable', modifiers: ['const', 'global'], format: ['camelCase', 'UPPER_CASE'] },
      ],
      'no-console': 'error', // interdit console.log/warn/error au profit d'un vrai logger
    },
  },
);
