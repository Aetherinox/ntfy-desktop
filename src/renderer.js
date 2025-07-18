/// <reference path="./electron.d.ts" />

/**
    electron > process > renderer

    runs in the renderer process and handles detecting clicks on elements with the class
    .MuiButtonBase-root and sends signals back to the main process

    normally we don't throw emojis in console prints, but ntfy website likes to spam the dev console; so
    we need to make our prints stand out to filter all the noise
*/

/**
    developer mode > toggle

    this script contains a large number of debugging functions which allow us to track ntfy website elements.
    keep this off unless doing something with the code. it will spam the console with every action.
*/

const bDeveloperMode = false;

/**
    LogRenderer Class

    Inlined browser-compatible version of Log class for renderer process.
    This is used for local logging within the injected renderer script.

    Note: Main process logs are automatically forwarded to the renderer console
    via IPC with proper styling (colored app name, plain text message).

    LOG_LEVEL               default log level since we can't read from process.env in renderer
    APP_NAME                name of app; we also can't read from package.json
*/

const APP_NAME = 'ntfy-desktop';

/**
    CSS styles for console output in browser
*/

const styles =
{
    verbose: 'background: #000; color: #888; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    debug: 'background: #666; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    info: 'background: #0088ff; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    ok: 'background: #00aa00; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    notice: 'background: #ffaa00; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    warn: 'background: #ffaa00; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    error: 'background: #ff4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
};

/**
    LogRenderer Class

    @usage                  LogRenderer.ok( 'LogRenderer class for renderer process!' );
                            LogRenderer.info( 'Info message' );
                            LogRenderer.warn( 'Warning message' );
                            LogRenderer.error( 'Error message' );
*/

class LogRenderer
{
    static LOG_LEVEL = 4; // Default log level for renderer process

    static now()
    {
        const now = new Date();
        return `[${ now.toLocaleTimeString() }]`;
    }

    static verbose( ...msg )
    {
        if ( this.LOG_LEVEL < 6 ) return;
        console.log( `%c ${ APP_NAME } `, styles.verbose, this.now(), ...msg );
    }

    static debug( ...msg )
    {
        if ( this.LOG_LEVEL < 5 ) return;
        console.debug( `%c ${ APP_NAME } `, styles.debug, this.now(), ...msg );
    }

    static info( ...msg )
    {
        if ( this.LOG_LEVEL < 4 ) return;
        console.log( `%c ${ APP_NAME } `, styles.info, this.now(), ...msg );
    }

    static ok( ...msg )
    {
        if ( this.LOG_LEVEL < 4 ) return;
        console.log( `%c ${ APP_NAME } `, styles.ok, this.now(), ...msg );
    }

    static notice( ...msg )
    {
        if ( this.LOG_LEVEL < 3 ) return;
        console.log( `%c ${ APP_NAME } `, styles.notice, this.now(), ...msg );
    }

    static warn( ...msg )
    {
        if ( this.LOG_LEVEL < 2 ) return;
        console.warn( `%c ${ APP_NAME } `, styles.warn, this.now(), ...msg );
    }

    static error( ...msg )
    {
        if ( this.LOG_LEVEL < 1 ) return;
        console.error( `%c ${ APP_NAME } `, styles.error, this.now(), ...msg );
    }
}

/**
    debugging function

    prints out elements that exist on the target page of ntfy website.
    this function will not toggle unless developer mode is on.
*/

function devSearchElements( )
{
    LogRenderer.debug( `🔍 ~~~ ELEMENT SEARCH DEBUG ~~~` );

    /**
        check for elements with the class "MuiButtonBase-root" from ntfy app
    */

    const muiElements = document.getElementsByClassName( 'MuiButtonBase-root' );
    LogRenderer.debug( `📊 Found ${ muiElements.length } elements with exact class .MuiButtonBase-root` );

    /**
        check for any elements containing the class "MuiButton" from ntfy app
    */

    const muiButtonElements = document.querySelectorAll( '*[class*="MuiButton"]' );
    LogRenderer.debug( `📊 Found ${ muiButtonElements.length } elements with classes containing 'MuiButton'` );

    /**
        check for any elements containing the class "Mui" from ntfy app
    */

    const allMuiElements = document.querySelectorAll( '*[class*="Mui"]' );
    LogRenderer.debug( `📊 Found ${ allMuiElements.length } elements with classes containing 'Mui'` );

    /**
        check for any elements on page that are buttons
    */

    const buttonElements = document.querySelectorAll( 'button, *[role="button"], *[class*="button"], *[class*="Button"]' );
    LogRenderer.debug( `📊 Found ${ buttonElements.length } button elements` );

    /**
        log the first few items from each category
    */

    LogRenderer.debug( '🎯 Sample MuiButton elements:' );
    Array.from( muiButtonElements ).slice( 0, 5 ).forEach( ( el, i ) =>
    {
        LogRenderer.debug( `  ${ i }: ${ el.tagName } - ${ el.className } - "${ el.textContent?.trim() || '' }"` );
    });

    LogRenderer.debug( '🎯 Sample button elements:' );
    Array.from( buttonElements ).slice( 0, 5 ).forEach( ( el, i ) =>
    {
        LogRenderer.debug( `  ${ i }: ${ el.tagName } - ${ el.className } - "${ el.textContent?.trim() || '' }"` );
    });

    LogRenderer.debug( `🔍 ~~~ END ELEMENT SEARCH ~~~` );

    return {
        muiElements: muiElements.length,
        muiButtonElements: muiButtonElements.length,
        allMuiElements: allMuiElements.length,
        buttonElements: buttonElements.length
    };
}

/**
    wait for the DOM to be ready (fallback for cases where script loads before DOM)
*/

function initializeRenderer()
{
    LogRenderer.debug( '🔧 Initializing renderer functionality' );

    /**
        add universal click listener for debugging - using capture phase to catch events early
    */

    document.addEventListener( 'click', ( env ) =>
    {
        LogRenderer.debug( '🖱️ Universal click detected on:',
        {
            tag: env.target.tagName,
            className: env.target.className,
            id: env.target.id,
            text: env.target.textContent?.trim().substring( 0, 50 ) || '',
            role: env.target.role,
            type: env.target.type
        });

        /**
            more comprehensive check for clickable elements that should reset badge
        */

        const bShouldResetBadge = (
            env.target.tagName === 'BUTTON' ||
            env.target.role === 'button' ||
            env.target.type === 'button' ||
            env.target.className.includes( 'Button' ) ||
            env.target.className.includes( 'Mui' ) ||
            env.target.className.includes( 'btn' ) ||
            env.target.className.includes( 'clickable' ) ||

            /**
                also check parent elements
            */

            ( env.target.closest && (
                env.target.closest( 'button' ) ||
                env.target.closest( '[role="button"]' ) ||
                env.target.closest( '[class*="Button"]' ) ||
                env.target.closest( '[class*="Mui"]' ) ||
                env.target.closest( '[class*="btn"]' )
            ) )
        );

        /**
            reset badge count for main gui indicator
        */

        if ( bShouldResetBadge )
        {
            LogRenderer.debug( `🎯 Button element clicked - send badge reset signal` );

            if ( typeof window.electron !== 'undefined' )
            {
                window.electron.sendToMain( 'button-clicked',
                {
                    message: 'Button element clicked',
                    timestamp: new Date().toISOString(),
                    elementClass: String( env.target.className || '' ),
                    elementTag: String( env.target.tagName || '' ),
                    elementText: String( env.target.textContent?.trim() || '' ),
                    elementId: String( env.target.id || '' ),
                    elementRole: String( env.target.role || '' ),
                    elementType: String( env.target.type || '' )
                });

                LogRenderer.debug( `✅ Badge reset signal sent to main process` );
            }
            else
            {
                LogRenderer.error( `❌ window.electron not available` );
            }
        }
    }, true );

    /**
        additionally, add listener for bubble phase as backup
    */

    document.addEventListener( 'click', ( env ) =>
    {
        /**
            only log if we havent already processed this in capture phase
        */

        if ( env.target.tagName === 'BUTTON' || env.target.role === 'button' || env.target.className.includes( 'Button' ) )
        {
            LogRenderer.debug( `🔄 Bubble phase click on button element` );
        }
    }, false );

    /**
        run debug search
    */

    setTimeout( () =>
    {
        devSearchElements();
    }, 1000 );

    /**
        function to add click listeners to .MuiButtonBase-root elements
    */

    function addClickListeners()
    {
        const elements = document.getElementsByClassName( 'MuiButtonBase-root' );

        LogRenderer.debug( `🔍 Found ${ elements.length } elements with class .MuiButtonBase-root` );

        /**
            if we find no exact matches, try a broader search
        */

        if ( elements.length === 0 )
        {
            LogRenderer.debug( `⚠️ No .MuiButtonBase-root elements found, attempting broader search...` );

            /**
                try different variants of the element names / classes
            */

            const variations = [
                '*[class*="MuiButtonBase-root"]',
                '*[class*="MuiButton"]',
                'button[class*="Mui"]',
                '*[role="button"][class*="Mui"]',
                'button, *[role="button"]'
            ];

            /**
                loop each variation and list
            */

            variations.forEach( ( selector, i ) =>
            {
                const found = document.querySelectorAll( selector );
                LogRenderer.debug( `  Variation ${ i } (${ selector }): ${ found.length } elements` );

                if ( found.length > 0 && i < 3 )
                    LogRenderer.debug( `    First element:`, found[ 0 ] );
            });
        }

        /**
            debugging > log all elements with classes containing 'Mui' or 'Button'
        */

        const allElements = document.querySelectorAll( '*[class*="Mui"], *[class*="Button"], *[class*="button"]' );
        LogRenderer.debug( `🔍 Found ${ allElements.length } elements with Mui/Button related classes:` );
        allElements.forEach( ( el, i ) =>
        {
            /**
                We should only log the first 10 to prevent spammy behavior
            */

            if ( i < 10 )
            {
                LogRenderer.debug( `  - Element ${ i }: ${ el.tagName.toLowerCase() } with classes: ${ el.className }` );
            }
        });

        /**
            convert HTMLCollection to Array for easier iteration
        */

        Array.from( elements ).forEach( ( element, index ) =>
        {
            /**
                Remove existing listener to avoid duplicates
            */

            element.removeEventListener( 'click', handleMuiListClick, true );
            element.removeEventListener( 'click', handleMuiListClick, false );

            /**
                Add click listener with capture=true to catch it before other handlers
            */

            element.addEventListener( 'click', handleMuiListClick, true );

            /**
                Also add without capture as backup
            */

            element.addEventListener( 'click', handleMuiListClick, false );

            LogRenderer.debug( `✅ Added click listeners to .MuiButtonBase-root element ${ index }:`, element );

            /**
                Debug > visual indicator (only in test/development mode)
            */

            if ( typeof window.electron !== 'undefined' && 
                 window.electron.env && 
                 ( window.electron.env.NODE_ENV === 'test' || window.electron.env.NODE_ENV === 'development' ) )
            {
                element.style.border = '2px solid red';
                element.style.boxShadow = '0 0 5px red';
                element.title = 'Badge Reset Button - Click to reset notification count';
            }
        });
    }

    /**
        click handler function
    */

    function handleMuiListClick( env )
    {
        LogRenderer.debug( 'MuiButtonBase-root element clicked!', env.target );

        /**
            see if window.electron is available
        */

        if ( typeof window.electron !== 'undefined' )
        {
            /**
                send signal to main process
            */

            window.electron.sendToMain( 'button-clicked',
            {
                message: 'MuiButtonBase-root element was clicked',
                timestamp: new Date().toISOString(),
                elementClass: String( env.target.className || '' ),
                elementTag: String( env.target.tagName || '' )
            });

            LogRenderer.debug( 'Signal sent to main process' );
        }
        else
        {
            LogRenderer.error( 'window.electron is not available - preload script may not be loaded' );
        }
    }

    /**
        add listeners immediately
    */

    addClickListeners();

    /**
        observe for dynamically added elements
    */

    const observer = new MutationObserver( ( mutations ) =>
    {
        let bShouldRecheck = false;
        mutations.forEach( ( mutation ) =>
        {
            mutation.addedNodes.forEach( ( node ) =>
            {
                if ( node.nodeType === Node.ELEMENT_NODE )
                {
                    /**
                        check if the added node or its children have .MuiButtonBase-root class
                    */

                    if ( node.classList && node.classList.contains( 'MuiButtonBase-root' ) )
                        bShouldRecheck = true;
                    else if ( node.getElementsByClassName && node.getElementsByClassName( 'MuiButtonBase-root' ).length > 0 )
                        bShouldRecheck = true;
                }
            });
        });

        if ( bShouldRecheck )
        {
            LogRenderer.debug( `New .MuiButtonBase-root elements detected, re-adding listeners` );

            addClickListeners();
        }
    });

    /**
        start observation
    */

    observer.observe( document.body,
    {
        childList: true,
        subtree: true
    });

    LogRenderer.debug( `MutationObserver started for dynamic content` );
}

/**
    call initialization function
*/

if ( document.readyState === 'loading' )
{
    document.addEventListener( 'DOMContentLoaded', initializeRenderer );
}
else
{
    /**
        DOM is already ready
    */

    initializeRenderer();
}

/**
    this is test functionality to ensure the Electron API is working
*/

function devTestElectronAPI()
{
    if ( typeof window.electron !== 'undefined' )
    {
        LogRenderer.debug( `✅ window.electron is available` );

        /**
            test ping
        */

        window.electron.ping().then( ( result ) =>
        {
            LogRenderer.debug( `✅ Ping test successful:`, result );
        }).catch( ( error ) =>
        {
            console.error( `❌ Ping test failed:`, error );
        });

        /**
            test send to main
        */

        window.electron.sendToMain( 'toMain', String( 'Test message from renderer' ) );
        LogRenderer.debug( '✅ Test message sent to main process' );

        /**
            test receive from main
        */

        window.electron.receiveFromMain( 'fromMain', ( data ) =>
        {
            LogRenderer.debug( '✅ Received message from main:', data );
        });
    }
    else
    {
        console.error( '❌ window.electron is undefined - check preload.js' );
    }
}

/**
    run our tests when the page loads
*/

window.addEventListener( 'load', devTestElectronAPI );

/**
    add test function that can be called from console to simulate .MuiButtonBase-root click
    Note: Disabled to prevent IPC cloning issues in production
*/

window.testBadgeReset = function ()
{
    if ( typeof window.electron !== 'undefined' )
    {
        window.electron.sendToMain( 'button-clicked',
        {
            message: String( 'Manual test - MuiButtonBase-root element clicked' ),
            timestamp: new Date().toISOString(),
            elementClass: String( 'MuiButtonBase-root test-class' ),
            elementTag: String( 'DIV' ),
            testMode: true
        });

        LogRenderer.debug( '✅ Test badge reset signal sent to main process' );
    }
    else
    {
        console.error( '❌ window.electron is not available' );
    }
};

LogRenderer.debug( '🧪 Test function available: window.testBadgeReset()' );

/**
    add function to inspect current page elements
    Note: Only available in developer mode to prevent IPC cloning issues
*/

window.inspectPage = function ()
{
    LogRenderer.debug( '🔍 === PAGE INSPECTION ===' );

    /**
        gather a list of all the clickable elements
    */

    const clickableElements = document.querySelectorAll(
        'button, [role="button"], [type="button"], a, [onclick], [class*="button"], [class*="Button"], [class*="btn"], [class*="Mui"]'
    );

    LogRenderer.debug( `Found ${ clickableElements.length } potentially clickable elements:` );

    clickableElements.forEach( ( el, i ) =>
    {
        /**
            only show the first 20
        */

        if ( i < 20 )
        {
            LogRenderer.debug( `${ i }: ${ el.tagName } - "${ el.className }" - "${ el.textContent?.trim().substring( 0, 30 ) || '' }"` );
        }
    });

    /**
        get all elements that might be related to ntfy noficiations
    */

    const ntfyElements = document.querySelectorAll(
        '[class*="notif"], [class*="Notif"], [class*="badge"], [class*="Badge"], [class*="count"], [class*="Count"]'
    );

    LogRenderer.debug( `\nFound ${ ntfyElements.length } notification-related elements:` );
    ntfyElements.forEach( ( el, i ) =>
    {
        if ( i < 10 )
        {
            LogRenderer.debug( `${ i }: ${ el.tagName } - "${ el.className }" - "${ el.textContent?.trim().substring( 0, 30 ) || '' }"` );
        }
    });

    return { clickable: Array.from( clickableElements ), notifications: Array.from( ntfyElements ) };
};

/**
    force click detection on ANY element
*/

window.forceClickDetection = function ()
{
    LogRenderer.debug( `🎯 === FORCE CLICK DETECTION ===` );

    /**
        override all click events to detect when a user clicks on the interface
    */

    const originalAddEventListener = Element.prototype.addEventListener;

    Element.prototype.addEventListener = function ( type, listener, options )
    {
        if ( type === 'click' )
            LogRenderer.debug( `🎯 Click listener being added to:`, this.tagName, this.className );

        return originalAddEventListener.call( this, type, listener, options );
    };

    LogRenderer.debug( `✅ Click detection override installed` );
};

LogRenderer.debug( `🧪 Additional functions available: window.inspectPage(), window.forceClickDetection()` );

/**
    clicking can be finicky, we need to utilize multiple strategies to ensure we can actually detect
    when a user clicks a button so that we've definitely got action from the user.

    we are using multiple for maximum reliability

    lastClickTime               stores when the last click was performed
    clickDebounceDelay          prevents duplicate signals within 100ms
*/

let lastClickTime = 0;
const clickDebounceDelay = 100;

/**
    Strategy > 1

    Multiple event types with debouncing based on the event type
*/

const evnTypes = [
    'click', 'mousedown', 'mouseup', 'touchstart', 'touchend'
];

evnTypes.forEach( ( envType ) =>
{
    document.addEventListener( envType, ( env ) =>
    {
        const now = Date.now();

        /**
            check if this is a potential button click
        */

        const isMuiButton = env.target.className && env.target.className.includes( 'MuiButtonBase-root' );
        const isMuiElement = env.target.className && env.target.className.includes( 'Mui' );
        const isButton = env.target.tagName === 'BUTTON' || env.target.role === 'button';

        if ( isMuiButton || ( isMuiElement && isButton ) )
        {
            LogRenderer.debug( `🚨 ${ envType.toUpperCase() } detected on Mui element:`,
            {
                tag: env.target.tagName,
                className: env.target.className,
                text: env.target.textContent?.trim().substring( 0, 30 ) || ''
            });

            /**
                prevent duplicate signals by using debounce
            */

            if ( now - lastClickTime > clickDebounceDelay )
            {
                lastClickTime = now;

                LogRenderer.debug( '🎯 SENDING BADGE RESET (via optimized detection)' );

                if ( typeof window.electron !== 'undefined' )
                {
                    window.electron.sendToMain( 'button-clicked', {
                        message: String( `Mui element ${ envType } - optimized detection` ),
                        timestamp: new Date().toISOString(),
                        elementClass: String( env.target.className || '' ),
                        elementTag: String( env.target.tagName || '' ),
                        elementText: String( env.target.textContent?.trim() || '' ),
                        envType: String( envType )
                    });

                    LogRenderer.debug( '✅ Badge reset signal sent via optimized detection' );
                }
            }
            else
            {
                LogRenderer.debug( '⏰ Click debounced - too soon after last click' );
            }
        }
    }, true ); // use capture phase
});

/**
    Strategy > 2

    element-specific listeners that are re-attached periodically
*/

function attachDirectListeners()
{
    const muiButtons = document.querySelectorAll( '.MuiButtonBase-root, [class*="MuiButton"], [class*="MuiListItem"]' );
    muiButtons.forEach( ( element, index ) =>
    {
        /**
            remove all existing listeners
        */

        element.removeEventListener( 'click', directClickHandler );
        element.removeEventListener( 'mousedown', directClickHandler );

        /**
            add fresh listeners
        */

        element.addEventListener( 'click', directClickHandler, true );
        element.addEventListener( 'mousedown', directClickHandler, true );
    });

    LogRenderer.debug( `🔄 Attached direct listeners to ${ muiButtons.length } Mui elements` );
}

/**
    handler > direct click
*/

function directClickHandler( env )
{
    const now = Date.now();

    if ( now - lastClickTime > clickDebounceDelay )
    {
        lastClickTime = now;

        LogRenderer.debug( '🎯 DIRECT LISTENER TRIGGERED - sending badge reset' );

        if ( typeof window.electron !== 'undefined' )
        {
            window.electron.sendToMain( 'button-clicked',
            {
                message: String( 'Direct listener - Mui element clicked' ),
                timestamp: new Date().toISOString(),
                elementClass: String( env.target.className || '' ),
                elementTag: String( env.target.tagName || '' ),
                elementText: String( env.target.textContent?.trim() || '' ),
                envType: String( env.type || '' )
            });
        }
    }
}

/**
    attach direct listeners initially and then every 2 seconds
*/

setTimeout( attachDirectListeners, 1000 );
setInterval( attachDirectListeners, 2000 );

LogRenderer.debug( '🚨 Multi-strategy click detection installed with debouncing' );

/*
    Export functionality for testing purposes
    Only export in test environments to prevent IPC cloning issues
*/

/*
    Only export in Node.js testing environments
*/

// Export for Node.js testing environments
if ( typeof module !== 'undefined' && module.exports && typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.NODE_ENV === 'test' )
{
    module.exports = { LogRenderer, devSearchElements, initializeRenderer, attachDirectListeners, directClickHandler };
}

/*
    for browser environments - be very careful about what we expose
*/

if ( typeof window !== 'undefined' )
{
    /*
        Temporarily disabled all window assignments to debug IPC cloning issues
        Only assign to window in test environments where NODE_ENV is explicitly set
        In production, don't expose any functions to avoid IPC issues
    */

    if ( typeof window.electron !== 'undefined' && window.electron.env && window.electron.env.NODE_ENV === 'test' )
    {
        try
        {
            window.LogRenderer = LogRenderer;
        }
        catch ( e )
        {
            console.warn( 'Could not assign LogRenderer to window:', e.message );
        }
    }
}
