/*
    Eslint 9 Flat Config

    old eslint < 8 .rc files are no longer supported! do not place .eslintrc files in subfolders.
    eslint developers are currently working on an experimental feature to allow for sub-folder
    override rules
    @ref        https://github.com/eslint/eslint/discussions/18574#discussioncomment-9729092
                https://eslint.org/docs/latest/use/configure/configuration-files#experimental-configuration-file-resolution

    eslint config migration docs
    @ref        https://eslint.org/docs/latest/use/configure/migration-guide
*/

import path from 'path';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';

/*
    Plugins
*/

import pluginImport from 'eslint-plugin-import';
import pluginNode from 'eslint-plugin-n';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';
import pluginStylistic from '@stylistic/eslint-plugin';

/*
    Globals
*/

const customGlobals =
{
    guid: 'readable',
    uuid: 'readable',
    Buffer: 'readonly',
    BufferEncoding: 'readonly'
};

/*
    Compatibility
*/

const __filename = fileURLToPath( import.meta.url );    // get resolved path to file
const __dirname = path.dirname( __filename );           // get name of directory

const compat = new FlatCompat({
    baseDirectory: __dirname,                           // optional; default: process.cwd()
    resolvePluginsRelativeTo: __dirname,                // optional
    recommendedConfig: js.configs.recommended,          // optional unless using 'eslint:recommended'
    allConfig: js.configs.all                           // optional unless using 'eslint:all'
});

/*
    Eslint > Flat Config
*/

export default
[
    {
        ignores: [
            'coverage/**',
            'node_modules/**',
            '**/dist/**/*',
            '**/__tmp__/**/*',
            'www/**/*'
        ]
    },
    {

        files: [ 'src/*.js', 'src/*.mjs', 'src/*.cjs' ]
    },
    {
        // Allow relative parent imports in test files
        files: [ 'tests/**/*.js', 'tests/**/*.mjs', 'tests/**/*.test.js' ],
        rules: {
            'import/no-relative-parent-imports': 'off'
        }
    },
    ...compat.extends( 'eslint:recommended' ),
    {
        plugins: {
            n: pluginNode,
            import: pluginImport,
            '@stylistic': pluginStylistic,
            'chai-friendly': pluginChaiFriendly
        },
        linterOptions: {
            reportUnusedDisableDirectives: false
        },
        languageOptions: {
            globals: {
                ...customGlobals,
                ...globals.browser,
                ...globals.node,
                process: true, // Node.js global
                _: true,
                $: true
            },
            sourceType: 'module',
            ecmaVersion: 'latest',
            parserOptions: {
                requireConfigFile: false
            }
        },
        rules: {
            // eslint/js rules
            'one-var': 'off',
            'no-throw-literal': 'off',
            camelcase: [ 'error',
            {
                properties: 'always'
            }],
            'no-unused-vars': 'off',
            'no-console': 'off',
            'no-alert': 'error',
            'no-debugger': 'error',
            'prefer-arrow-callback': 'error',
            'no-useless-escape': 'off',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-unused-expressions': 0,
            'chai-friendly/no-unused-expressions': 'off',
            strict: [ 'error', 'never' ],
            'prefer-promise-reject-errors': 'off',
            'no-object-constructor': 'error',
            'object-shorthand': 'off',
            'no-array-constructor': 'error',
            'array-callback-return': 'error',
            'no-eval': 'error',
            'no-new-func': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'no-useless-constructor': 'error',
            'no-dupe-class-members': 'error',
            'no-duplicate-imports': 'error',
            eqeqeq: 'error',
            'no-unneeded-ternary': 'error',
            curly: 'off',
            'no-empty': 'off',
            'no-restricted-syntax': [ 'off',
            {
                selector: 'ExportDefaultDeclaration',
                message: 'Prefer named exports'
            }],
            'import/no-webpack-loader-syntax': 'off',
            'import/no-relative-parent-imports': 'error',
            'import/first': 'error',
            'import/no-default-export': 'off',
            'node/no-callback-literal': 0,

            /*
                @plugin         eslint-plugin-n
            */

            'n/no-callback-literal': 0,
            'n/no-deprecated-api': 'error',
            'n/no-exports-assign': 'error',
            'n/no-extraneous-import': [ 'off', {
                allowModules: [ 'globals', '@eslint/js', '@eslint/eslintrc' ],
                resolvePaths: []
            }],
            'n/no-extraneous-require': [ 'error',
            {
                allowModules: [ 'electron', 'electron-notarize', 'prompt', 'uuid' ],
                resolvePaths: [],
                tryExtensions: []
            }],
            'n/no-missing-import': 'off',
            'n/no-missing-require': 'off',
            'n/no-mixed-requires': 'error',
            'n/no-new-require': 'error',
            'n/no-path-concat': 'error',
            'n/no-process-env': 'off',
            'n/no-process-exit': 'off',
            'n/no-restricted-import': 'error',
            'n/no-restricted-require': 'error',
            'n/no-sync': 'off',
            'n/no-unpublished-bin': 'error',
            'n/no-unpublished-import': [ 'off',
            {
                allowModules: [
                    'electron', 'electron-notarize', 'prompt', 'uuid', '@playwright/test', 'electron-playwright-helpers'
                ]
            }],
            'n/no-unpublished-require': [ 'error',
            {
                allowModules: [ 'electron', 'electron-notarize', 'prompt', 'uuid' ]
            }],
            'n/no-unsupported-features/es-builtins': 'error',
            'n/no-unsupported-features/es-syntax': 'error',
            'n/no-unsupported-features/node-builtins': 'off',
            'n/prefer-global/buffer': 'error',
            'n/prefer-global/console': 'error',
            'n/prefer-global/process': 'error',
            'n/prefer-global/text-decoder': 'error',
            'n/prefer-global/text-encoder': 'error',
            'n/prefer-global/url': 'error',
            'n/prefer-global/url-search-params': 'error',
            'n/prefer-node-protocol': 'off',
            'n/prefer-promises/dns': 'off',
            'n/prefer-promises/fs': 'off',
            'n/process-exit-as-throw': 'error',
            '@stylistic/object-property-newline': 'off',
            '@stylistic/no-multi-spaces': [ 0, { ignoreEOLComments: true }],
            '@stylistic/arrow-spacing': [ 'error', { before: true, after: true }],
            '@stylistic/semi-spacing': [ 'error', {
                before: false,
                after: true
            }],
            '@stylistic/space-before-function-paren': [ 'error', {
                anonymous: 'always',
                asyncArrow: 'never',
                named: 'never'
            }],
            '@stylistic/padded-blocks': [ 'error', {
                blocks: 'never',
                switches: 'never',
                classes: 'never'
            }],
            '@stylistic/arrow-parens': [ 'error', 'always' ],
            '@stylistic/block-spacing': [ 'error', 'always' ],
            '@stylistic/comma-dangle': [ 'error', 'never' ],
            '@stylistic/comma-spacing': [ 'error', { before: false, after: true }],
            '@stylistic/computed-property-spacing': [ 'error', 'always' ],
            '@stylistic/no-mixed-operators': [ 'off' ],
            '@stylistic/eol-last': [ 'error', 'always' ],
            '@stylistic/jsx-quotes': [ 'error', 'prefer-single' ],
            '@stylistic/linebreak-style': [ 'error', 'unix' ],
            '@stylistic/no-mixed-spaces-and-tabs': [ 'error' ],
            '@stylistic/no-tabs': [ 'error' ],
            '@stylistic/no-trailing-spaces': [ 'error', { skipBlankLines: true, ignoreComments: true }],
            '@stylistic/no-whitespace-before-property': [ 'error' ],
            '@stylistic/object-curly-spacing': [ 'error', 'always' ],
            '@stylistic/quote-props': [ 'error', 'as-needed' ],
            '@stylistic/quotes': [ 'error',
                'single', { allowTemplateLiterals: true }
            ],
            '@stylistic/semi': [ 'error', 'always' ],
            '@stylistic/space-infix-ops': [ 'error' ],
            '@stylistic/template-curly-spacing': [ 'error', 'always' ],
            '@stylistic/template-tag-spacing': [ 'error', 'always' ],
            '@stylistic/space-in-parens': [ 'error', 'always',
            {
                exceptions: [ '{}' ]
            }],
            '@stylistic/spaced-comment': [ 'error', 'always',
            {
                markers: [ '/' ]
            }],
            '@stylistic/array-bracket-newline': [ 'off',
            {
                multiline: false,
                minItems: 5
            }],
            '@stylistic/brace-style': [ 'error', 'allman',
            {
                allowSingleLine: true
            }],
            '@stylistic/array-bracket-spacing': [ 'error', 'always',
            {
                arraysInArrays: false,
                objectsInArrays: false,
                singleValue: true
            }],
            '@stylistic/wrap-iife': [ 2, 'inside', { functionPrototypeMethods: true }],
            '@stylistic/keyword-spacing': [ 'error',
            {
                before: true,
                after: true,
                overrides:
                {
                    return:     { before: true, after: true },
                    throw:      { before: true, after: true },
                    case:       { before: true, after: true },
                    as:         { before: true, after: true },
                    if:         { before: true, after: true },
                    for:        { before: true, after: true },
                    while:      { before: true, after: true },
                    static:     { before: true, after: true }
                }
            }]
        }
    }
];
