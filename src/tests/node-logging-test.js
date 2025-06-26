/*
    Tests > Node Standalone > Logging

    this is a stand-alone test to ensure our log system works and shows the correct logs
    to the user.

    this test does not require vita vitest. run it with:
        cd ./src
        node tests/node-logging-test.js

    or you can run it using
        test:logging

    it is also part of vitest testing bundle:
        test:unit:run

    the test progressively demonstrates each logging level:
        - LOG_LEVEL=1: Only error
        - LOG_LEVEL=2: error + warn
        - LOG_LEVEL=3: error + warn + notice
        - LOG_LEVEL=4: error + warn + notice + ok + info
        - LOG_LEVEL=5: all above + debug (console.debug)
        - LOG_LEVEL=6: all above + verbose
        - LOG_LEVEL=7: all above + debug (console.trace)
*/

import Log from '#log';

/*
    add delay functionality
*/

function delay( ms )
{
    return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

/*
    Simplified Error Logging

    this is used in preload.js to show messages on the electron side.
    can only specify color for first part of message; otherwise color codes
    show.
*/

function testSimplified()
{
    console.log( '\n🔴 ~~~ LOG_LEVEL=1 : Simplified : (Error only) ~~~' );
    process.env.LOG_LEVEL = 1;

    Log.error( true, 'Simplified error message : visible' );
    Log.warn( true, 'Simplified warn message : hidden' );
}

/*
    LOG_LEVEL=1
*/

function testLevel1()
{
    console.log( '\n🔴 ~~~ LOG_LEVEL=1 (Error only) ~~~' );
    process.env.LOG_LEVEL = 1;

    Log.error( '🚨 Log.error : visible' );
    Log.warn( '⚠️ Log.warn : hidden' );
    Log.notice( '📌 Log.notice : hidden' );
    Log.ok( '✅ Log.ok : hidden' );
    Log.info( 'ℹ️ Log.info : hidden' );
    Log.debug( '🐛 Log.debug : hidden' );
    Log.verbose( '🔍 Log.verbose : hidden' );
}

/*
    LOG_LEVEL=2
*/

function testLevel2()
{
    console.log( '\n🟡 ~~~ LOG_LEVEL=2 (Error + Warn) ~~~' );
    process.env.LOG_LEVEL = 2;

    Log.error( '🚨 Log.error ERROR message : visible' );
    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : hidden' );
    Log.ok( '✅ Log.ok : hidden' );
    Log.info( 'ℹ️ Log.info : hidden' );
    Log.debug( '🐛 Log.debug : hidden' );
    Log.verbose( '🔍 Log.verbose : hidden' );
}

/*
    LOG_LEVEL=3
*/

function testLevel3()
{
    console.log( '\n🟠 ~~~ LOG_LEVEL=3 (Error + Warn + Notice) ~~~' );
    process.env.LOG_LEVEL = 3;

    Log.error( '🚨 Log.error : visible' );
    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : visible' );
    Log.ok( '✅ Log.ok : hidden' );
    Log.info( 'ℹ️ Log.info : hidden' );
    Log.debug( '🐛 Log.debug : hidden' );
    Log.verbose( '🔍 Log.verbose : hidden' );
}

/*
    LOG_LEVEL=4
*/

function testLevel4()
{
    console.log( '\n🔵 ~~~ LOG_LEVEL=4 (Error + Warn + Notice + OK + Info) ~~~' );
    process.env.LOG_LEVEL = 4;

    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : visible' );
    Log.ok( '✅ Log.ok : visible' );
    Log.info( 'ℹ️ Log.info : visible' );
    Log.debug( '🐛 Log.debug : hidden' );
    Log.verbose( '🔍 Log.verbose : hidden' );
}

/*
    LOG_LEVEL=5
*/

function testLevel5()
{
    console.log( '\n🟣 ~~~ LOG_LEVEL=5 (All above + Debug console.debug) ~~~' );
    process.env.LOG_LEVEL = 5;

    Log.error( '🚨 Log.error : visible' );
    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : visible' );
    Log.ok( '✅ Log.ok : visible' );
    Log.info( 'ℹ️ Log.info : visible' );
    Log.debug( '🐛 Log.debug (console.debug) : visible' );
    Log.verbose( '🔍 Log.verbose : hidden' );
}

/*
    LOG_LEVEL=6
*/

function testLevel6()
{
    console.log( '\n🟢 ~~~ LOG_LEVEL=6 (All above + Verbose) ~~~' );
    process.env.LOG_LEVEL = 6;

    Log.error( '🚨 Log.error : visible' );
    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : visible' );
    Log.ok( '✅ Log.ok : visible' );
    Log.info( 'ℹ️ Log.info : visible' );
    Log.debug( '🐛 Log.debug (console.debug) : visible' );
    Log.verbose( '🔍 Log.verbose : visible' );
}

/*
    LOG_LEVEL=7
*/

function testLevel7()
{
    console.log( '\n⚪ ~~~ LOG_LEVEL=7 (All above + Debug console.trace) ~~~' );
    process.env.LOG_LEVEL = 7;

    Log.error( '🚨 Log.error : visible' );
    Log.warn( '⚠️ Log.warn : visible' );
    Log.notice( '📌 Log.notice : visible' );
    Log.ok( '✅ Log.ok : visible' );
    Log.info( 'ℹ️ Log.info : visible' );
    Log.debug( '🐛 Log.debug (console.trace) : visible with stack trace' );
    Log.verbose( '🔍 Log.verbose : visible' );
}

/*
    Progressive Tests
*/

async function runProgressiveTest()
{
    console.log( '🧪 Start Progressive Log Test...' );
    console.log( 'This test will show each log level progressively' );
    console.log( 'Starts at LOG_LEVEL=1 to LOG_LEVEL=7\n' );

    await delay( 1000 );
    testSimplified();

    await delay( 1000 );
    testLevel1();

    await delay( 2000 );
    testLevel2();

    await delay( 2000 );
    testLevel3();

    await delay( 2000 );
    testLevel4();

    await delay( 2000 );
    testLevel5();

    await delay( 2000 );
    testLevel6();

    await delay( 2000 );
    testLevel7();

    console.log( '\n✅ ~~~ Test Complete ~~~' );
    console.log( '\n📋 Summary:' );
    console.log( '- LOG_LEVEL=1: Only ERROR messages' );
    console.log( '- LOG_LEVEL=2: ERROR + WARN messages' );
    console.log( '- LOG_LEVEL=3: ERROR + WARN + NOTICE messages' );
    console.log( '- LOG_LEVEL=4: ERROR + WARN + NOTICE + OK + INFO messages' );
    console.log( '- LOG_LEVEL=5: All above + DEBUG (console.debug) messages' );
    console.log( '- LOG_LEVEL=6: All above + VERBOSE messages' );
    console.log( '- LOG_LEVEL=7: All above + DEBUG (console.trace) messages' );
    console.log( '\n🎯 ~~~ Test Complete ~~~' );
}

/*
    run progress test
*/

runProgressiveTest();
