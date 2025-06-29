/**
    Tests > Storage

    tests the functionality of the app Storage class located in ./src//classes/Storage.js

    @docs               https://vitest.dev/api/expect
*/

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Storage from '#storage';

/*
    mock electron app module
*/

vi.mock( 'electron', () => (
{
    default: {
        app:
        {
            getPath: vi.fn( ( type ) =>
            {
                if ( type === 'userData' )
                    return path.join( os.tmpdir(), 'ntfy-desktop-test' );

                return os.tmpdir();
            })
        }
    }
}) );

/*
    mock fs module
*/

vi.mock( 'fs', () => (
{
    default:
    {
        readFileSync: vi.fn(),
        writeFileSync: vi.fn()
    }
}) );

/*
    Tests > Storage Class
*/

describe( 'Storage Class Tests', () =>
{
    let tempDir;
    let configPath;
    let storage;

    beforeEach( () =>
    {
        /*
            reset mocks
        */

        vi.clearAllMocks();

        /*
            setup temporary directory for tests
        */

        tempDir = path.join( os.tmpdir(), 'ntfy-desktop-test' );
        configPath = path.join( tempDir, 'test-config.json' );
    });

    afterEach( () =>
    {
        /*
            clean up any real files if they were created
        */

        try
        {
            if ( fs.existsSync && fs.existsSync( configPath ) )
                fs.unlinkSync( configPath );
        }
        catch ( error )
        {
            // Ignore cleanup errors
        }
    });

    /*
        Storage > Constructor
    */

    describe( 'Constructor', () =>
    {
        it( 'should initialize with correct path and defaults when file does not exist', () =>
        {
            const defaults = { theme: 'dark', autoStart: false, port: 3000 };

            /*
                mock fs.readFileSync to throw error (file doesn't exist)
            */

            fs.readFileSync.mockImplementation( () =>
            {
                throw new Error( 'ENOENT: no such file or directory' );
            });

            storage = new Storage(
            {
                configName: 'test-config',
                defaults: defaults
            });

            expect( storage.path ).toBe( configPath );
            expect( storage.data ).toEqual( defaults );
            expect( fs.readFileSync ).toHaveBeenCalledWith( configPath );
        });

        it( 'should initialize with existing config file data', () =>
        {
            const existingData = { theme: 'light', autoStart: true, port: 8080, newSetting: 'value' };
            const defaults = { theme: 'dark', autoStart: false, port: 3000 };

            /*
                mock fs.readFileSync to return existing data
            */

            fs.readFileSync.mockReturnValue( JSON.stringify( existingData ) );

            storage = new Storage(
            {
                configName: 'test-config',
                defaults: defaults
            });

            expect( storage.path ).toBe( configPath );
            expect( storage.data ).toEqual( existingData );
            expect( fs.readFileSync ).toHaveBeenCalledWith( configPath );
        });

        it( 'should handle malformed JSON in config file gracefully', () =>
        {
            const defaults = { theme: 'dark', autoStart: false };

            /*
                mock fs.readFileSync to return invalid JSON
            */

            fs.readFileSync.mockReturnValue( '{ invalid json }' );

            storage = new Storage(
            {
                configName: 'test-config',
                defaults: defaults
            });

            expect( storage.data ).toEqual( defaults );
        });

        it( 'should create correct file path with different config names', () =>
        {
            fs.readFileSync.mockImplementation( () =>
            {
                throw new Error( 'File not found' );
            });

            const storage1 = new Storage({ configName: 'app-settings', defaults: {} });
            const storage2 = new Storage({ configName: 'user-preferences', defaults: {} });

            expect( storage1.path ).toBe( path.join( tempDir, 'app-settings.json' ) );
            expect( storage2.path ).toBe( path.join( tempDir, 'user-preferences.json' ) );
        });

        it( 'should handle electron.remote.app fallback when main app is not available', async() =>
        {
            /*
                Create a temporary mock that has no app but has remote.app
                This will test the ( electron.app || electron.remote.app ) branch
            */

            const mockRemoteApp = {
                getPath: vi.fn( ( type ) =>
                {
                    if ( type === 'userData' )
                        return path.join( os.tmpdir(), 'ntfy-desktop-remote-test' );
                    return os.tmpdir();
                })
            };

            /*
                Get the current electron mock and temporarily modify it
            */
            
            const electronModule = await import( 'electron' );
            const electronMocked = vi.mocked( electronModule.default );
            const originalApp = electronMocked.app;
            const originalRemote = electronMocked.remote;

            /*
                Set app to falsy and add remote.app
            */
            
            electronMocked.app = null;
            electronMocked.remote = { app: mockRemoteApp };
            
            fs.readFileSync.mockImplementation( () =>
            {
                throw new Error( 'File not found' );
            });

            const storage = new Storage({ configName: 'remote-test', defaults: { test: 'value' } });
            const expectedPath = path.join( os.tmpdir(), 'ntfy-desktop-remote-test', 'remote-test.json' );

            expect( storage.path ).toBe( expectedPath );
            expect( storage.data ).toEqual({ test: 'value' });
            expect( mockRemoteApp.getPath ).toHaveBeenCalledWith( 'userData' );

            /*
                Restore original mock values
            */
            
            electronMocked.app = originalApp;
            electronMocked.remote = originalRemote;
        });
    });

    /*
        Storage.get
    */

    describe( 'get() method', () =>
    {
        beforeEach( () =>
        {
            const testData =
            {
                stringValue: 'hello world',
                numberValue: 42,
                booleanValue: true,
                nullValue: null,
                objectValue: { nested: 'value' },
                arrayValue: [ 1, 2, 3 ]
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( testData ) );
            storage = new Storage({ configName: 'test-config', defaults: {} });
        });

        it( 'should return correct values for existing keys', () =>
        {
            expect( storage.get( 'stringValue' ) ).toBe( 'hello world' );
            expect( storage.get( 'numberValue' ) ).toBe( 42 );
            expect( storage.get( 'booleanValue' ) ).toBe( true );
            expect( storage.get( 'nullValue' ) ).toBe( null );
            expect( storage.get( 'objectValue' ) ).toEqual({ nested: 'value' });
            expect( storage.get( 'arrayValue' ) ).toEqual( [ 1, 2, 3 ] );
        });

        it( 'should return value as correct type', () =>
        {
            expect( storage.get( 'stringValue' ) ).toBeTypeOf( 'string' );
            expect( storage.get( 'numberValue' ) ).toBeTypeOf( 'number' );
            expect( storage.get( 'booleanValue' ) ).toBeTypeOf( 'boolean' );
            expect( storage.get( 'objectValue' ) ).toBeTypeOf( 'object' );
            expect( storage.get( 'arrayValue' ) ).toBeTypeOf( 'object' );
        });

        it( 'should return undefined for non-existing keys', () =>
        {
            expect( storage.get( 'nonExistentKey' ) ).toBeUndefined();
            expect( storage.get( '' ) ).toBeUndefined();
            expect( storage.get( null ) ).toBeUndefined();
        });

        it( 'should handle complex nested object access', () =>
        {
            const complexData =
            {
                user:
                {
                    profile:
                    {
                        name: 'John Doe',
                        settings:
                        {
                            theme: 'dark',
                            notifications: true
                        }
                    }
                }
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( complexData ) );
            storage = new Storage({ configName: 'complex-config', defaults: {} });

            expect( storage.get( 'user' ) ).toEqual( complexData.user );
        });
    });

    /*
        Storage.getInt
    */

    /*
        Storage.getSanitized
    */

    describe( 'getSanitized() method', () =>
    {
        beforeEach( () =>
        {
            const testData =
            {
                stringWithSpaces: '  hello world  ',
                stringWithTabs: '\thello\tworld\t',
                stringWithNewlines: '\nhello\nworld\n',
                stringMixed: ' \t\n hello \t world \n\t ',
                stringNoSpaces: 'helloworld',
                emptyString: '',
                spacesOnly: '   '
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( testData ) );
            storage = new Storage({ configName: 'test-config', defaults: {} });
        });

        it( 'should remove all whitespace from string values', () =>
        {
            expect( storage.getSanitized( 'stringWithSpaces' ) ).toBe( 'helloworld' );
            expect( storage.getSanitized( 'stringWithTabs' ) ).toBe( 'helloworld' );
            expect( storage.getSanitized( 'stringWithNewlines' ) ).toBe( 'helloworld' );
            expect( storage.getSanitized( 'stringMixed' ) ).toBe( 'helloworld' );
        });

        it( 'should handle strings with no whitespace', () =>
        {
            expect( storage.getSanitized( 'stringNoSpaces' ) ).toBe( 'helloworld' );
        });

        it( 'should handle empty strings and whitespace-only strings', () =>
        {
            expect( storage.getSanitized( 'emptyString' ) ).toBe( '' );
            expect( storage.getSanitized( 'spacesOnly' ) ).toBe( '' );
        });

        it( 'should handle special characters and preserve non-whitespace', () =>
        {
            const specialData =
            {
                specialChars: ' hello@world#test$ ',
                numbers: ' 123 456 789 ',
                symbols: ' !@#$%^&*() '
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( specialData ) );
            storage = new Storage({ configName: 'special-config', defaults: {} });

            expect( storage.getSanitized( 'specialChars' ) ).toBe( 'hello@world#test$' );
            expect( storage.getSanitized( 'numbers' ) ).toBe( '123456789' );
            expect( storage.getSanitized( 'symbols' ) ).toBe( '!@#$%^&*()' );
        });
    });

    describe( 'getInt() method', () =>
    {
        beforeEach( () =>
        {
            const testData =
            {
                validNumber: 42,
                stringNumber: '123',
                floatNumber: 3.14,
                stringFloat: '2.71',
                invalidString: 'not a number',
                booleanTrue: true,
                booleanFalse: false,
                nullValue: null,
                undefinedValue: undefined
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( testData ) );
            storage = new Storage({ configName: 'test-config', defaults: {} });
        });

        it( 'should return integer values correctly', () =>
        {
            expect( storage.getInt( 'validNumber' ) ).toBe( 42 );
            expect( storage.getInt( 'stringNumber' ) ).toBe( 123 );
            expect( storage.getInt( 'floatNumber' ) ).toBe( 3 );
            expect( storage.getInt( 'stringFloat' ) ).toBe( 2 );
        });

        it( 'should handle invalid values gracefully', () =>
        {
            expect( storage.getInt( 'invalidString' ) ).toBe( 0 );              // Non-numeric strings → 0
            expect( storage.getInt( 'booleanTrue' ) ).toBe( 1 );                // true → 1
            expect( storage.getInt( 'booleanFalse' ) ).toBe( 0 );               // false → 0
            expect( storage.getInt( 'nullValue' ) ).toBe( 0 );                  // null → 0
            expect( storage.getInt( 'undefinedValue' ) ).toBe( 0 );             // undefined → 0
            expect( storage.getInt( 'nonExistentKey' ) ).toBe( 0 );             // undefined → 0
        });

        it( 'should handle edge cases', () =>
        {
            const edgeData =
            {
                zero: 0,
                negativeNumber: -42,
                stringZero: '0',
                emptyString: '',
                whitespace: '   123   '
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( edgeData ) );
            storage = new Storage({ configName: 'edge-config', defaults: {} });

            expect( storage.getInt( 'zero' ) ).toBe( 0 );
            expect( storage.getInt( 'negativeNumber' ) ).toBe( -42 );
            expect( storage.getInt( 'stringZero' ) ).toBe( 0 );
            expect( storage.getInt( 'emptyString' ) ).toBe( 0 );                // Empty string → 0
            expect( storage.getInt( 'whitespace' ) ).toBe( 123 );               // Whitespace-padded numbers work
        });

        it( 'should properly truncate decimal numbers', () =>
        {
            const decimalData =
            {
                positiveFloat: 42.7,
                negativeFloat: -42.7,
                stringFloat: '15.9',
                largeFloat: 999.999
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( decimalData ) );
            storage = new Storage({ configName: 'decimal-config', defaults: {} });

            expect( storage.getInt( 'positiveFloat' ) ).toBe( 42 );             // 42.7 → 42
            expect( storage.getInt( 'negativeFloat' ) ).toBe( -42 );            // -42.7 → -42
            expect( storage.getInt( 'stringFloat' ) ).toBe( 15 );               // '15.9' → 15
            expect( storage.getInt( 'largeFloat' ) ).toBe( 999 );               // 999.999 → 999
        });

        it( 'should handle various string formats', () =>
        {
            const stringData =
            {
                leadingZeros: '0042',
                hexString: '0xFF',                                              // JavaScript Number() can handle hex
                scientificNotation: '1e3',
                mixedString: '123abc',
                onlyWhitespace: '   ',
                tabsAndNewlines: '\t\n456\t\n'
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( stringData ) );
            storage = new Storage({ configName: 'string-config', defaults: {} });

            expect( storage.getInt( 'leadingZeros' ) ).toBe( 42 );              // '0042' → 42
            expect( storage.getInt( 'hexString' ) ).toBe( 255 );                // '0xFF' → 255
            expect( storage.getInt( 'scientificNotation' ) ).toBe( 1000 );      // '1e3' → 1000
            expect( storage.getInt( 'mixedString' ) ).toBe( 0 );                // '123abc' → 0 (NaN)
            expect( storage.getInt( 'onlyWhitespace' ) ).toBe( 0 );             // '   ' → 0
            expect( storage.getInt( 'tabsAndNewlines' ) ).toBe( 456 );          // Number() handles whitespace
        });
    });

    /*
        Storage.set
    */

    describe( 'set() method', () =>
    {
        beforeEach( () =>
        {
            const initialData = { existingKey: 'existingValue' };
            fs.readFileSync.mockReturnValue( JSON.stringify( initialData ) );
            storage = new Storage({ configName: 'test-config', defaults: {} });
        });

        it( 'should set new values and write to file', () =>
        {
            storage.set( 'newKey', 'newValue' );

            expect( storage.data.newKey ).toBe( 'newValue' );
            expect( fs.writeFileSync ).toHaveBeenCalledWith(
                configPath,
                JSON.stringify({ existingKey: 'existingValue', newKey: 'newValue' })
            );
        });

        it( 'should update existing values and write to file', () =>
        {
            storage.set( 'existingKey', 'updatedValue' );

            expect( storage.data.existingKey ).toBe( 'updatedValue' );
            expect( fs.writeFileSync ).toHaveBeenCalledWith(
                configPath,
                JSON.stringify({ existingKey: 'updatedValue' })
            );
        });

        it( 'should handle different data types', () =>
        {
            storage.set( 'stringValue', 'test' );
            storage.set( 'numberValue', 42 );
            storage.set( 'booleanValue', true );
            storage.set( 'nullValue', null );
            storage.set( 'objectValue', { nested: 'object' });
            storage.set( 'arrayValue', [ 1, 2, 3 ] );

            expect( storage.data.stringValue ).toBe( 'test' );
            expect( storage.data.numberValue ).toBe( 42 );
            expect( storage.data.booleanValue ).toBe( true );
            expect( storage.data.nullValue ).toBe( null );
            expect( storage.data.objectValue ).toEqual({ nested: 'object' });
            expect( storage.data.arrayValue ).toEqual( [ 1, 2, 3 ] );

            /*
                should have called writeFileSync for each set operation
            */

            expect( fs.writeFileSync ).toHaveBeenCalledTimes( 6 );
        });

        it( 'should handle special key names', () =>
        {
            storage.set( '', 'empty string key' );
            storage.set( '0', 'numeric string key' );
            storage.set( 'special-chars!@#', 'special characters' );
            storage.set( 'spaces in key', 'key with spaces' );

            expect( storage.data[ '' ] ).toBe( 'empty string key' );
            expect( storage.data[ '0' ] ).toBe( 'numeric string key' );
            expect( storage.data[ 'special-chars!@#' ] ).toBe( 'special characters' );
            expect( storage.data[ 'spaces in key' ] ).toBe( 'key with spaces' );
        });

        it( 'should preserve other data when setting new values', () =>
        {
            const initialData =
            {
                key1: 'value1',
                key2: 'value2',
                key3: { nested: 'value' }
            };

            fs.readFileSync.mockReturnValue( JSON.stringify( initialData ) );
            storage = new Storage({ configName: 'preserve-test', defaults: {} });

            storage.set( 'key2', 'updatedValue2' );
            storage.set( 'newKey', 'newValue' );

            expect( storage.data ).toEqual(
            {
                key1: 'value1',
                key2: 'updatedValue2',
                key3: { nested: 'value' },
                newKey: 'newValue'
            });
        });
    });

    /*
        Storage > Integration Tests
    */

    describe( 'Integration Tests', () =>
    {
        it( 'should handle complete workflow: create, read, update, read again', () =>
        {
            const defaults = { theme: 'dark', version: '1.0.0' };

            /*
                first run > file does not exist
            */

            fs.readFileSync.mockImplementationOnce( () =>
            {
                throw new Error( 'File not found' );
            });

            storage = new Storage({ configName: 'workflow-test', defaults });

            /*
                start with defaults
            */

            expect( storage.get( 'theme' ) ).toBe( 'dark' );
            expect( storage.get( 'version' ) ).toBe( '1.0.0' );

            /*
                update some values
            */

            storage.set( 'theme', 'light' );
            storage.set( 'autoSave', true );

            /*
                check values are updated
            */

            expect( storage.get( 'theme' ) ).toBe( 'light' );
            expect( storage.get( 'autoSave' ) ).toBe( true );
            expect( storage.get( 'version' ) ).toBe( '1.0.0' ); // Should preserve existing

            /*
                verify file was written
            */

            expect( fs.writeFileSync ).toHaveBeenCalledWith(
                expect.stringContaining( 'workflow-test.json' ),
                expect.stringContaining( 'light' )
            );
        });

        it( 'should handle multiple Storage instances with different configs', () =>
        {
            fs.readFileSync.mockImplementation( ( filePath ) =>
            {
                if ( filePath.includes( 'config1' ) )
                    return JSON.stringify({ setting1: 'value1' });
                else if ( filePath.includes( 'config2' ) )
                    return JSON.stringify({ setting2: 'value2' });

                throw new Error( 'File not found' );
            });

            const storage1 = new Storage({ configName: 'config1', defaults: {} });
            const storage2 = new Storage({ configName: 'config2', defaults: {} });

            expect( storage1.get( 'setting1' ) ).toBe( 'value1' );
            expect( storage1.get( 'setting2' ) ).toBeUndefined();

            expect( storage2.get( 'setting2' ) ).toBe( 'value2' );
            expect( storage2.get( 'setting1' ) ).toBeUndefined();

            /*
                updates should be independent
            */

            storage1.set( 'newSetting', 'new1' );
            storage2.set( 'newSetting', 'new2' );

            expect( storage1.get( 'newSetting' ) ).toBe( 'new1' );
            expect( storage2.get( 'newSetting' ) ).toBe( 'new2' );
        });

        it( 'should handle large data sets efficiently', () =>
        {
            const largeData = {};
            for ( let i = 0; i < 1000; i++ )
            {
                largeData[ `key${ i }` ] = `value${ i }`;
            }

            fs.readFileSync.mockReturnValue( JSON.stringify( largeData ) );
            storage = new Storage({ configName: 'large-config', defaults: {} });

            /*
                should handle large datasets
            */

            expect( storage.get( 'key0' ) ).toBe( 'value0' );
            expect( storage.get( 'key500' ) ).toBe( 'value500' );
            expect( storage.get( 'key999' ) ).toBe( 'value999' );

            /*
                should be able to add to large dataset
            */

            storage.set( 'newLargeKey', 'newLargeValue' );
            expect( storage.get( 'newLargeKey' ) ).toBe( 'newLargeValue' );
        });
    });

    /*
        Storage > Error Handling
    */

    describe( 'Error Handling', () =>
    {
        it( 'should handle file write errors gracefully', () =>
        {
            fs.readFileSync.mockReturnValue( JSON.stringify({ test: 'value' }) );
            storage = new Storage({ configName: 'error-test', defaults: {} });

            /*
                mock writeFileSync to throw error
            */

            fs.writeFileSync.mockImplementation( () =>
            {
                throw new Error( 'Permission denied' );
            });

            /*
                set() should still update in-memory data even if file write fails
            */

            expect( () => storage.set( 'newKey', 'newValue' ) ).toThrow( 'Permission denied' );
            expect( storage.data.newKey ).toBe( 'newValue' ); // Should still be set in memory
        });

        it( 'should handle edge cases in parseDataFile', () =>
        {
            /*
                test with empty file
            */

            fs.readFileSync.mockReturnValue( '' );
            storage = new Storage({ configName: 'empty-test', defaults: { default: 'value' } });
            expect( storage.data ).toEqual({ default: 'value' });

            /*
                test with whitespace only
            */

            fs.readFileSync.mockReturnValue( '   \n\t   ' );
            storage = new Storage({ configName: 'whitespace-test', defaults: { default: 'value' } });
            expect( storage.data ).toEqual({ default: 'value' });
        });
    });
});
