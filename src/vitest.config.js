/**
    vitest configuration

    configures unit testing and code coverage for ntfy-desktop

    @docs               https://vitest.dev/config/
*/

import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

export default defineConfig(
{
    test: {
        globals: true,
        environment: 'node', 
        testTimeout: 30000,
        hookTimeout: 30000,
        teardownTimeout: 10000,
        
        // Force synchronous execution - no workers at all
        pool: 'vmThreads',
        poolOptions: {
            vmThreads: {
                singleThread: true
            }
        },
        
        // Completely disable all worker processes
        isolate: false,
        threads: false,
        maxConcurrency: 1,
        maxWorkers: 1,
        minWorkers: 1,
        
        // Force single threaded mode
        singleThread: true,
        
        // Run tests completely sequentially 
        sequence: {
            concurrent: false,
            shuffle: false,
            hooks: 'stack'
        },
        
        // Disable file parallelization (removed - not available in v1.6.0)
        
        // Add process environment configuration
        env: {
            NODE_ENV: 'test'
        },
        
        // Prevent worker process hanging
        forceRerunTriggers: [
            '**/package.json/**',
            '**/vitest.config.*/**',
            '**/vite.config.*/**'
        ],
        
        // Suppress known worker thread errors
        onConsoleLog: (log, type) => {
            if (log.includes('Cannot read properties of undefined (reading \'listeners\')') ||
                log.includes('Channel closed') ||
                log.includes('ERR_IPC_CHANNEL_CLOSED')) {
                return false; // Suppress these specific errors
            }
            return undefined; // Allow other logs
        },

        // Test file patterns
        include: [
            'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'logs/**',
            'assets/**',
            'tests/node-logging-test.js', // Exclude non-vitest test files
            'tests/*.spec.js', // Exclude ALL Playwright test files (*.spec.js)
            '**/*.e2e.{test,spec}.{js,ts}', // Exclude e2e tests (use Playwright for those)
            '**/playwright/**' // Exclude any playwright test directories
        ],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: [
                'text',           // Console output
                'text-summary',   // Brief summary
                'html',           // HTML report
                'lcov',           // For Codecov
                'json',           // JSON format
                'json-summary'    // Summary JSON
            ],

            // Coverage output directory
            reportsDirectory: './coverage',

            // Include patterns for coverage
            include: [
                'classes/**/*.js',
                'index.js',
                'preload.js',
                'renderer.js'
            ],

            // Exclude patterns from coverage
            exclude: [
                'node_modules/**',
                'tests/**',
                'coverage/**',
                'dist/**',
                'build/**',
                'logs/**',
                'assets/**',
                '**/*.config.js',
                '**/*.config.mjs',
                'playwright.config.js',
                'root.mjs',
                'eslint.config.js'
            ],

            // Coverage thresholds
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 75,
                    statements: 75
                },
                // Per-file thresholds for critical files
                './classes/Log.js': {
                    branches: 80,
                    functions: 85,
                    lines: 85,
                    statements: 85
                },
                './classes/Storage.js': {
                    branches: 90,
                    functions: 95,
                    lines: 95,
                    statements: 95
                },
                './classes/Utils.js': {
                    branches: 85,
                    functions: 90,
                    lines: 90,
                    statements: 90
                }
            },

            // Clean coverage directory before running
            clean: true,

            // Report uncovered lines
            reportOnFailure: true,

            // Skip coverage if no tests are found
            skipFull: false
        },

        // Mock electron for testing
        setupFiles: [ './tests/setup.js' ],

        // Reporters
        reporter: [
            'verbose',
            'json',
            'html'
        ],

        // Output files
        outputFile: {
            json: './coverage/test-results.json',
            html: './coverage/test-results.html'
        }
    },

    resolve: {
        alias: {
            '#classes': path.resolve( __dirname, './classes' ),
            '#classes/Menu.js': path.resolve( __dirname, './classes/Menu.js' ),
            '#utils': path.resolve( __dirname, './classes/Utils.js' ),
            '#log': path.resolve( __dirname, './classes/Log.js' ),
            '#storage': path.resolve( __dirname, './classes/Storage.js' ),
            '#package': path.resolve( __dirname, './package.json' ),
            '#preload': path.resolve( __dirname, './preload.js' )
        }
    }
});

