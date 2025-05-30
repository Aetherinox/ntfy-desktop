#!/usr/bin/env node

/*
    build by running
        npm run build

    guid and uuid will be automatically generated and placed
    inside .env file which will then be read by the github workflow
    build script.
*/

/*
    This script handles the following:
        - read package.json
        - create .env file
        - return uuid, guid, version

    can be called with the following external commands:
        - node root.js                 returns version of root
        - node root.js generate        generates uuid / guid and shows all env vars in console
        - node root.js uuid            returns root uuid
        - node root.js guid            returns root guid
        - node root.js versiom         returns version of root

    can be called with the following root commands:
        - npm run root
        - npm run root:generate
        - npm run env-root
        - npm run env-uuid
        - npm run env-guid
        - npm run env-version
*/

const fs = require( 'fs' );
const { v5: uuidv5 } = require( 'uuid' );

/*
*    declarations › package.json
*/

const { version, repository } = JSON.parse( fs.readFileSync( './package.json' ) );
const args = process.argv.slice( 2, process.argv.length );
const action = args[ 0 ];
// const a   = args[ 1 ];
// const b   = args[ 2 ];

if ( action === 'guid' )
{
    console.log( `${ process.env.GUID }` );
}
else if ( action === 'setup' )
{
    fs.writeFileSync( '.env', '', ( err ) =>
    {
        if ( err )
        {
            console.error( err );
        }
        else
        {
            console.log( `Wrote to .env successfully` );
        }
    });
}
else if ( action === 'generate' )
{
    const buildGuid = uuidv5( `${ repository.url }`, uuidv5.URL );
    const buildUuid = uuidv5( version, buildGuid );

    const ids = `
VERSION=${ version }
GUID=${ buildGuid }
UUID=${ buildUuid }
`;

    console.log( version );
    console.log( buildGuid );
    console.log( buildUuid );

    fs.writeFileSync( '.env', ids, ( err ) =>
    {
        if ( err )
        {
            console.error( `Could not write env vars: ${ err }` );
        }
        else
        {
            console.log( `Wrote env vars to .env` );
        }
    });
}
else if ( action === 'uuid' )
{
    console.log( `${ process.env.UUID }` );
}
else
{
    console.log( version );
}

process.exit( 0 );
