const js = require( '@eslint/js' )
const globals = require( 'globals' )
const prettier = require( 'eslint-plugin-prettier' )
const stylisticJs = require( '@stylistic/eslint-plugin-js' )
const stylisticPlus =  require( '@stylistic/eslint-plugin-plus' )

module.exports = [
    {
        files: [
            '**/*.js',
            './app/**/*.js',
            './src/**/*.js',
            './tests/**/*.js'
        ],
        plugins: {
            prettier: prettier,
            '@stylistic/js': stylisticJs,
            '@stylistic/plus': stylisticPlus
        },
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            // eslint/js rules
            indent: [1, 4],
            'space-before-function-paren': 0,
            'prefer-const': 1,
            'comma-dangle': 0,
            'keyword-spacing': ['error', { before: true, after: true }],
            'comma-spacing': ['error', { before: false, after: true }],
            'prefer-spread': 1,
            'no-unexpected-multiline': 0,
            'no-prototype-builtins': 0,
            'no-useless-escape': 1,
            'no-mixed-operators': 1,
            'no-control-regex': 0,
            'no-console': 2,
            'no-var': 2,
            'no-undef': 0,
            'no-redeclare': 'error',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true
                }
            ],

            '@stylistic/js/no-multi-spaces': [ 0, { ignoreEOLComments: true } ],
            '@stylistic/js/arrow-spacing': [ 'error', { before: true, after: true } ],
            '@stylistic/js/arrow-parens': [ 'error', 'always' ],
            '@stylistic/js/block-spacing': [ 'error', 'always' ],
            '@stylistic/js/brace-style': [ 'error', 'allman', { allowSingleLine: true } ],
            '@stylistic/js/comma-dangle': [ 'error', 'never' ],
            '@stylistic/js/comma-spacing': [ 'error', { before: false, after: true }],
            '@stylistic/js/keyword-spacing': [ 'error', {
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
            }],

            '@stylistic/js/computed-property-spacing': ['error', 'always'],
            '@stylistic/js/eol-last': ['error', 'always'],
            '@stylistic/js/jsx-quotes': ['error', 'prefer-single'],
            '@stylistic/js/linebreak-style': ['error', 'unix'],
            '@stylistic/js/no-mixed-spaces-and-tabs': ['error'],
            '@stylistic/js/no-tabs': ['error'],
            '@stylistic/js/no-trailing-spaces': ['error', { skipBlankLines: true, ignoreComments: true }],
            '@stylistic/js/no-whitespace-before-property': ['error'],

            '@stylistic/js/object-curly-spacing': ['error', 'always'],

            '@stylistic/js/quote-props': ['error', 'as-needed'],

            '@stylistic/js/quotes': ['error', 'single', { allowTemplateLiterals: true }],

            '@stylistic/js/semi': ['error', 'never'],

            '@stylistic/js/space-in-parens': ['error', 'always'],

            '@stylistic/js/space-infix-ops': ['error'],

            '@stylistic/js/spaced-comment': ['error', 'always'],
            '@stylistic/js/template-curly-spacing': ['error', 'always'],
            '@stylistic/js/template-tag-spacing': ['error', 'always'],
            '@stylistic/js/wrap-iife': [2, 'inside', { functionPrototypeMethods: true }],

            '@stylistic/plus/type-named-tuple-spacing': ['error'],
            '@stylistic/plus/type-generic-spacing': ['error']

        // 'prettier/prettier': ['error'],
        }
    }]
