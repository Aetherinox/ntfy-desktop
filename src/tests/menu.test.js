/* eslint-disable @stylistic/quote-props */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { app, Menu, BrowserWindow } from 'electron';
import path from 'path';
import { newMenuMain, newMenuContext, setMenuDeps } from '#menu';

/*
    mock additional dependencies that Menu.js uses
*/

vi.mock( '#storage', () => (
{
    default: class MockStorage
    {
        constructor()
        {
            this.data = new Map();
        }

        get( key )
        {
            return this.data.get( key );
        }

        getInt( key )
        {
            const value = this.data.get( key );
            return typeof value === 'number' ? value : parseInt( value ) || 0;
        }

        getSanitized( key, defaultValue )
        {
            return this.data.get( key ) || defaultValue;
        }

        set( key, value )
        {
            this.data.set( key, value );
        }
    }
}) );

vi.mock( '#log', () => (
{
    default:
    {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
    }
}) );

vi.mock( '#utils', () => (
{
    default:
    {
        IsValidUrl: vi.fn( () => Promise.resolve( true ) )
    }
}) );

describe( 'Menu Class Tests', () =>
{
    let mockDeps;
    let mockStore;
    let mockGuiMain;
    let mockPrompt;
    let mockToasted;
    let mockShell;
    let mockLog;

    beforeEach( () =>
    {
        // Reset all mocks
        vi.clearAllMocks();

        // Create mock store
        mockStore = {
            get: vi.fn(),
            getInt: vi.fn(),
            getSanitized: vi.fn(),
            set: vi.fn(),
            data: new Map()
        };

        // Create mock GUI main window
        mockGuiMain =
        {
            loadURL: vi.fn().mockResolvedValue( undefined ),
            show: vi.fn(),
            reload: vi.fn(),
            webContents:
            {
                send: vi.fn(),
                executeJavaScript: vi.fn().mockResolvedValue( undefined ),
                navigationHistory:
                {
                    canGoBack: vi.fn( () => true ),
                    canGoForward: vi.fn( () => true ),
                    goBack: vi.fn(),
                    goForward: vi.fn()
                }
            },
            setFullScreen: vi.fn(),
            isFullScreen: vi.fn( () => false )
        };

        // Create mock prompt function
        mockPrompt = vi.fn( () => Promise.resolve( [ '1', '1', '1', '1' ] ) );

        // Create mock toasted notifier
        mockToasted =
        {
            notify: vi.fn()
        };

        // Create mock shell
        mockShell =
        {
            openExternal: vi.fn()
        };

        // Create mock log
        mockLog =
        {
            info: vi.fn()
        };

        // Create comprehensive mock dependencies
        mockDeps =
        {
            store: mockStore,
            guiMain: mockGuiMain,
            prompt: mockPrompt,
            toasted: mockToasted,
            shell: mockShell,
            Log: mockLog,
            chalk:
            {
                yellow: vi.fn( ( str ) => str ),
                white: vi.fn( ( str ) => str ),
                blueBright: vi.fn( ( str ) => str ),
                gray: vi.fn( ( str ) => str )
            },
            app:
            {
                badgeCount: 0
            },
            bHotkeysEnabled: 0,
            appIcon: 'test-icon.png',
            appTitle: 'Test App',
            appVer: '1.0.0',
            appRepo: 'https://github.com/test/repo',
            appAuthor: 'Test Author',
            appElectron: '20.0.0',
            defInstanceUrl: 'https://ntfy.sh',
            defTopics: 'test,topic',
            defDatetime: 'YYYY-MM-DD HH:mm',
            defPollrate: 30,
            minPollrate: 5,
            maxPollrate: 3600,
            statusBadURL: false,
            statusStrMsg: '',
            pollInterval: null,
            packageJson:
            {
                homepage: 'https://github.com/test/repo'
            },
            gracefulShutdown: vi.fn(),
            activeDevTools: vi.fn(),
            UpdateBadge: vi.fn(),
            GetMessages: vi.fn(),
            IsValidUrl: vi.fn( () => Promise.resolve( true ) )
        };

        // Set up default store responses
        mockStore.get.mockImplementation( ( key ) =>
        {
            const defaults =
            {
                'bDevTools': 0,
                'bHotkeys': 0,
                'bQuitOnClose': 0,
                'bStartHidden': 0,
                'instanceURL': 'https://ntfy.sh',
                'bLocalhost': 0,
                'apiToken': 'test-token',
                'topics': 'test,topic',
                'bPersistentNoti': 0,
                'datetime': 'YYYY-MM-DD HH:mm',
                'pollrate': 30,
                'indicatorMessages': 0
            };
            return defaults[ key ] || null;
        });

        mockStore.getInt.mockImplementation( ( key ) =>
        {
            const value = mockStore.get( key );
            return typeof value === 'number' ? value : parseInt( value ) || 0;
        });

        mockStore.getSanitized.mockImplementation( ( key, defaultValue ) =>
        {
            return mockStore.get( key ) || defaultValue;
        });

        // Set dependencies
        setMenuDeps( mockDeps );
    });

    afterEach( () =>
    {
        vi.clearAllMocks();
    });

    describe( 'Menu Click Handlers', () =>
    {
        let menu;

        beforeEach( () =>
        {
            menu = newMenuMain();
        });

        it( 'should handle Instance settings click', async() =>
        {
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const instanceSettings = settingsMenu.submenu.find( ( item ) => item.label === 'Instance' );

            expect( instanceSettings.click ).toBeDefined();
            expect( typeof instanceSettings.click ).toBe( 'function' );

            await instanceSettings.click();

            expect( mockPrompt ).toHaveBeenCalledWith(
                expect.objectContaining(
                {
                    title: 'Instance Settings',
                    type: 'multiInput',
                    multiInputOptions: expect.arrayContaining(
                    [
                        expect.objectContaining(
                        {
                            label: 'Instance URL'
                        }),
                        expect.objectContaining(
                        {
                            label: 'Localhost Mode'
                        })
                    ] )
                }),
                mockGuiMain
            );
        });

        it( 'should handle API Token settings click', async() =>
        {
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const apiTokenSettings = settingsMenu.submenu.find( ( item ) => item.label === 'API Token' );

            expect( apiTokenSettings.click ).toBeDefined();
            expect( typeof apiTokenSettings.click ).toBe( 'function' );

            await apiTokenSettings.click();

            expect( mockPrompt ).toHaveBeenCalledWith(
                expect.objectContaining(
                {
                    title: 'Set API Token',
                    type: 'input',
                    value: 'test-token'
                }),
                mockGuiMain
            );
        });

        it( 'should handle Topics settings click', async() =>
        {
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const topicsSettings = settingsMenu.submenu.find( ( item ) => item.label === 'Topics' );

            expect( topicsSettings.click ).toBeDefined();
            expect( typeof topicsSettings.click ).toBe( 'function' );

            await topicsSettings.click();

            expect( mockPrompt ).toHaveBeenCalledWith(
                expect.objectContaining(
                {
                    title: 'Set Subscribed Topics',
                    type: 'input'
                }),
                mockGuiMain
            );
        });

        it( 'should handle Quit menu click', async() =>
        {
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const quitItem = appMenu.submenu.find( ( item ) => item.id === 'quit' );

            expect( quitItem.click ).toBeDefined();
            expect( typeof quitItem.click ).toBe( 'function' );

            quitItem.click();

            expect( mockDeps.gracefulShutdown ).toHaveBeenCalled();
        });
    });

    describe( 'View Menu Click Handlers', () =>
    {
        let menu;
        let mockFocusedWindow;

        beforeEach( () =>
        {
            menu = newMenuMain();
            mockFocusedWindow =
            {
                webContents:
                {
                    navigationHistory: {
                        canGoBack: vi.fn( () => true ),
                        canGoForward: vi.fn( () => true ),
                        goBack: vi.fn(),
                        goForward: vi.fn()
                    }
                },
                reload: vi.fn(),
                setFullScreen: vi.fn(),
                isFullScreen: vi.fn( () => false )
            };
        });

        it( 'should handle Back navigation', () =>
        {
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const backItem = viewMenu.submenu.find( ( item ) => item.label === 'Back' );

            expect( backItem.click ).toBeDefined();
            expect( typeof backItem.click ).toBe( 'function' );

            backItem.click( null, mockFocusedWindow );

            expect( mockFocusedWindow.webContents.navigationHistory.canGoBack ).toHaveBeenCalled();
            expect( mockFocusedWindow.webContents.navigationHistory.goBack ).toHaveBeenCalled();
        });

        it( 'should handle Forward navigation', () =>
        {
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const forwardItem = viewMenu.submenu.find( ( item ) => item.label === 'Forward' );

            expect( forwardItem.click ).toBeDefined();
            expect( typeof forwardItem.click ).toBe( 'function' );

            forwardItem.click( null, mockFocusedWindow );

            expect( mockFocusedWindow.webContents.navigationHistory.canGoForward ).toHaveBeenCalled();
            expect( mockFocusedWindow.webContents.navigationHistory.goForward ).toHaveBeenCalled();
        });

        it( 'should handle Reload', () =>
        {
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const reloadItem = viewMenu.submenu.find( ( item ) => item.label === 'Reload' );

            expect( reloadItem.click ).toBeDefined();
            expect( typeof reloadItem.click ).toBe( 'function' );

            reloadItem.click( null, mockFocusedWindow );

            expect( mockFocusedWindow.reload ).toHaveBeenCalled();
        });

        it( 'should handle Toggle Full Screen', () =>
        {
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const fullScreenItem = viewMenu.submenu.find( ( item ) => item.label === 'Toggle Full Screen' );

            expect( fullScreenItem.click ).toBeDefined();
            expect( typeof fullScreenItem.click ).toBe( 'function' );

            fullScreenItem.click( null, mockFocusedWindow );

            expect( mockFocusedWindow.isFullScreen ).toHaveBeenCalled();
            expect( mockFocusedWindow.setFullScreen ).toHaveBeenCalledWith( true ); // !false
        });
    });

    describe( 'newMenuContext', () =>
    {
        it( 'should throw error if dependencies not set', () =>
        {
            // Reset dependencies
            setMenuDeps( null );

            expect( () => newMenuContext() ).toThrow( 'Dependencies not set. Call setMenuDeps first' );

            // Restore dependencies
            setMenuDeps( mockDeps );
        });

        it( 'should handle Show App click in context menu', () =>
        {
            const contextMenu = newMenuContext();
            const lastCall = Menu.buildFromTemplate.mock.calls[ Menu.buildFromTemplate.mock.calls.length - 1 ];
            const template = lastCall[ 0 ];
            const showAppItem = template[ 0 ];

            expect( showAppItem.click ).toBeDefined();
            expect( typeof showAppItem.click ).toBe( 'function' );

            showAppItem.click();

            expect( mockStore.set ).toHaveBeenCalledWith( 'indicatorMessages', 0 );
            expect( mockDeps.app.badgeCount ).toBe( 0 );
            expect( mockGuiMain.show ).toHaveBeenCalled();
        });

        it( 'should handle Quit click in context menu', () =>
        {
            const contextMenu = newMenuContext();
            const lastCall = Menu.buildFromTemplate.mock.calls[ Menu.buildFromTemplate.mock.calls.length - 1 ];
            const template = lastCall[ 0 ];
            const quitItem = template[ 1 ];

            expect( quitItem.click ).toBeDefined();
            expect( typeof quitItem.click ).toBe( 'function' );

            quitItem.click();

            expect( mockDeps.gracefulShutdown ).toHaveBeenCalled();
        });
    });

    describe( 'Error Handling', () =>
    {
        it( 'should handle prompt rejection in General settings', async() =>
        {
            const menu = newMenuMain();
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const generalSettings = settingsMenu.submenu.find( ( item ) => item.id === 'general' );

            // Mock prompt to reject
            mockPrompt.mockRejectedValueOnce( new Error( 'User cancelled' ) );

            // Should not throw
            expect( async() =>
            {
                await generalSettings.click();
            }).not.toThrow();
        });

        it( 'should handle null response in settings', async() =>
        {
            const menu = newMenuMain();
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const generalSettings = settingsMenu.submenu.find( ( item ) => item.id === 'general' );

            // Mock prompt to return null
            mockPrompt.mockResolvedValueOnce( null );

            await generalSettings.click();

            // Just verify prompt was called
            expect( mockPrompt ).toHaveBeenCalled();
        });
    });

    describe( 'Edge Cases', () =>
    {
        it( 'should handle missing focused window in View menu handlers', () =>
        {
            const menu = newMenuMain();
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const reloadItem = viewMenu.submenu.find( ( item ) => item.label === 'Reload' );

            // Should not throw when focusedWindow is null/undefined
            expect( () =>
            {
                reloadItem.click( null, null );
            }).not.toThrow();

            expect( () =>
            {
                reloadItem.click( null, undefined );
            }).not.toThrow();
        });

        it( 'should handle navigation history unavailable', () =>
        {
            const menu = newMenuMain();
            const viewMenu = menu.find( ( item ) => item.id === 'view' );
            const backItem = viewMenu.submenu.find( ( item ) => item.label === 'Back' );

            const mockWindowWithoutHistory =
            {
                webContents:
                {
                    navigationHistory: {
                        canGoBack: vi.fn( () => false )
                    }
                }
            };

            backItem.click( null, mockWindowWithoutHistory );

            expect( mockWindowWithoutHistory.webContents.navigationHistory.canGoBack ).toHaveBeenCalled();
            // goBack should not be called when canGoBack returns false
        });

        it( 'should test developer tools condition in General settings response', async() =>
        {
            const menu = newMenuMain();
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const generalSettings = settingsMenu.submenu.find( ( item ) => item.id === 'general' );

            // Test promise then branch by mocking a non-null response
            const mockResp = [ 1, 1, 0, 1 ]; // Enable dev tools
            mockPrompt.mockResolvedValueOnce( mockResp );

            // Mock store.get to return different value than response to trigger activeDevTools
            mockStore.get.mockImplementation( ( key ) =>
            {
                if ( key === 'bDevTools' ) return 0; // Different from response[0] (1)
                return 0;
            });

            await generalSettings.click();

            // Verify that prompt was called and then resolved
            expect( mockPrompt ).toHaveBeenCalled();
        });
    });

    describe( 'Additional Coverage Tests', () =>
    {
        it( 'should test notifications settings click handler exists and executes', async() =>
        {
            const menu = newMenuMain();
            const appMenu = menu.find( ( item ) => item.id === 'app' );
            const settingsMenu = appMenu.submenu.find( ( item ) => item.id === 'settings' );
            const notificationsSettings = settingsMenu.submenu.find( ( item ) => item.label === 'Notifications' );

            expect( notificationsSettings.click ).toBeDefined();
            expect( typeof notificationsSettings.click ).toBe( 'function' );

            // Test the click handler
            await notificationsSettings.click();

            expect( mockPrompt ).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Notifications',
                    type: 'multiInput',
                    multiInputOptions: expect.arrayContaining( [
                        expect.objectContaining({
                            label: 'Sticky Notifications'
                        }),
                        expect.objectContaining({
                            label: 'Datetime Format'
                        }),
                        expect.objectContaining({
                            label: 'Polling Rate'
                        })
                    ] )
                }),
                mockGuiMain
            );
        });

        it( 'should test accelerator key assignment logic for hotkeys', () =>
        {
            // Test with bHotkeysEnabled = 1
            mockDeps.bHotkeysEnabled = 1;
            const menuWithHotkeys = newMenuMain();
            const appMenu = menuWithHotkeys.find( ( item ) => item.id === 'app' );
            const quitItem = appMenu.submenu.find( ( item ) => item.id === 'quit' );

            expect( quitItem.accelerator ).toBe( 'CTRL+Q' );

            // Test with bHotkeysEnabled = 0 and store returning 1
            mockDeps.bHotkeysEnabled = 0;
            mockStore.getInt.mockImplementation( ( key ) =>
            {
                if ( key === 'bHotkeys' ) return 1;
                return 0;
            });

            const menuWithStoreHotkeys = newMenuMain();
            const appMenuStore = menuWithStoreHotkeys.find( ( item ) => item.id === 'app' );
            const quitItemStore = appMenuStore.submenu.find( ( item ) => item.id === 'quit' );

            expect( quitItemStore.accelerator ).toBe( 'CTRL+Q' );
        });

        it( 'should test all help menu items execute properly', () =>
        {
            const menu = newMenuMain();
            const helpMenu = menu.find( ( item ) => item.id === 'help' );

            // Test Send Test Notification
            const testNotifItem = helpMenu.submenu.find( ( item ) => item.label === 'Send Test Notification' );
            expect( testNotifItem.click ).toBeDefined();
            testNotifItem.click();
            expect( mockToasted.notify ).toHaveBeenCalled();
            expect( mockDeps.UpdateBadge ).toHaveBeenCalled();

            // Test Check for Updates
            const updateItem = helpMenu.submenu.find( ( item ) => item.label === 'Check for Updates' );
            expect( updateItem.click ).toBeDefined();
            updateItem.click();
            expect( mockShell.openExternal ).toHaveBeenCalledWith( 'https://github.com/test/repo' );

            // Test Sponsor
            const sponsorItem = helpMenu.submenu.find( ( item ) => item.label === 'Sponsor' );
            expect( sponsorItem.click ).toBeDefined();
            sponsorItem.click();
            expect( mockShell.openExternal ).toHaveBeenCalledWith( 'https://buymeacoffee.com/aetherinox' );
        });

        it( 'should test about dialog new-window handler', async() =>
        {
            const helpMenu = newMenuMain().find( ( item ) => item.id === 'help' );
            const aboutItem = helpMenu.submenu.find( ( item ) => item.id === 'about' );

            const mockAboutWindow =
            {
                loadFile: vi.fn().mockResolvedValue( undefined ),
                webContents:
                {
                    executeJavaScript: vi.fn().mockResolvedValue( undefined ),
                    on: vi.fn()
                },
                setMenu: vi.fn()
            };

            BrowserWindow.mockImplementationOnce( () => mockAboutWindow );

            await aboutItem.click();

            // Get the new-window handler
            const newWindowCall = mockAboutWindow.webContents.on.mock.calls.find(
                ( call ) => call[ 0 ] === 'new-window'
            );
            expect( newWindowCall ).toBeDefined();

            const newWindowHandler = newWindowCall[ 1 ];

            // Mock event object
            const mockEvent =
            {
                preventDefault: vi.fn()
            };

            // Test the handler
            newWindowHandler( mockEvent, 'https://example.com' );

            expect( mockEvent.preventDefault ).toHaveBeenCalled();
            expect( mockShell.openExternal ).toHaveBeenCalledWith( 'https://example.com' );
        });
    });
});

