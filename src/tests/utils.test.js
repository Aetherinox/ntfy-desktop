/* eslint-disable @stylistic/quote-props */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Utils from '#utils';

/*
    mock Log.verbose to prevent console output during our tests
*/

vi.mock( '../classes/Log.js', () => (
{
    default:
    {
        verbose: vi.fn()
    }
}) );

describe( 'Utils JSON Functionality Tests', () =>
{
    describe( 'isJsonString', () =>
    {
        it( 'should return true for valid JSON strings', () =>
        {
            /*
                valid json object
            */

            expect( Utils.isJsonString( '{"name": "test", "value": 123}' ) ).toBe( true );
            expect( Utils.isJsonString( '{"array": [1, 2, 3], "nested": {"key": "value"}}' ) ).toBe( true );

            /*
                valid json arrays
            */

            expect( Utils.isJsonString( '[1, 2, 3, 4]' ) ).toBe( true );
            expect( Utils.isJsonString( '[{"id": 1}, {"id": 2}]' ) ).toBe( true );

            /*
                valid json primitives
            */

            expect( Utils.isJsonString( '"hello world"' ) ).toBe( true );
            expect( Utils.isJsonString( '123' ) ).toBe( true );
            expect( Utils.isJsonString( 'true' ) ).toBe( true );
            expect( Utils.isJsonString( 'false' ) ).toBe( true );
            expect( Utils.isJsonString( 'null' ) ).toBe( true );

            /*
                empty but valid JSON
            */

            expect( Utils.isJsonString( '{}' ) ).toBe( true );
            expect( Utils.isJsonString( '[]' ) ).toBe( true );
        });

        it( 'should return false for invalid JSON strings', () =>
        {
            /*
                invalid JSON syntax
            */

            expect( Utils.isJsonString( '{name: "test"}' ) ).toBe( false );             // missing quotes around key
            expect( Utils.isJsonString( '{"name": test}' ) ).toBe( false );             // missing quotes around value
            expect( Utils.isJsonString( '{"name": "test",}' ) ).toBe( false );          // trailing comma
            expect( Utils.isJsonString( '[1, 2, 3,]' ) ).toBe( false );                 // trailing comma in array

            /*
                completely invalid strings
            */

            expect( Utils.isJsonString( 'hello world' ) ).toBe( false );
            expect( Utils.isJsonString( '123abc' ) ).toBe( false );
            expect( Utils.isJsonString( 'undefined' ) ).toBe( false );

            /*
                partial json
            */

            expect( Utils.isJsonString( '{"name":' ) ).toBe( false );
            expect( Utils.isJsonString( '[1, 2' ) ).toBe( false );

            /*
                empty or whitespace
            */

            expect( Utils.isJsonString( '' ) ).toBe( false );
            expect( Utils.isJsonString( '   ' ) ).toBe( false );

            /*
                functions and other non-JSON
            */

            expect( Utils.isJsonString( 'function() {}' ) ).toBe( false );
            expect( Utils.isJsonString( 'new Date()' ) ).toBe( false );
        });

        it( 'should handle edge cases gracefully', () =>
        {
            /*
                very large numbers
            */

            expect( Utils.isJsonString( '999999999999999999999' ) ).toBe( true );

            /*
                special characters in strings
            */

            expect( Utils.isJsonString( '"Special chars: \\n\\t\\r\\\""' ) ).toBe( true );

            /*
                unicode characters
            */

            expect( Utils.isJsonString( '"Unicode: \\u0041\\u00e9\\u4e2d"' ) ).toBe( true );

            /*
                nested structures
            */

            const complexJson = `{
        "users": [
          {"id": 1, "name": "John", "active": true},
          {"id": 2, "name": "Jane", "active": false}
        ],
        "meta": {
          "total": 2,
          "page": 1
        }
      }`;
            expect( Utils.isJsonString( complexJson ) ).toBe( true );
        });
    });

    describe( 'isJsonEmpty', () =>
    {
        it( 'should return true for empty objects', () =>
        {
            /*
                standard empty object
            */

            expect( Utils.isJsonEmpty({}) ).toBe( true );

            /*
                object with no enumerable properties
            */

            const objWithNonEnumerable = {};
            Object.defineProperty( objWithNonEnumerable, 'hidden',
            {
                value: 'test',
                enumerable: false
            });

            expect( Utils.isJsonEmpty( objWithNonEnumerable ) ).toBe( true );
        });

        it( 'should return true for objects that stringify to "{}"', () =>
        {
            /*
                this test has specific conditions:
                    JSON.stringify(json) === '"{}"'

                this would happen if someone passes a string that contains:
                    "{}"

                The function checks JSON.stringify(json) === '"{}"' which would match a string "{}"
            */

            const stringifiedEmpty = '{}';
            expect( Utils.isJsonEmpty( stringifiedEmpty ) ).toBe( true );

            /*
                Other strings that would stringify to '"{}"' when passed through JSON.stringify
            */
            
            expect( Utils.isJsonEmpty( '{}' ) ).toBe( true );
            
            /*
                Test edge case: what if someone passes a string that would not match this pattern?
            */
            
            expect( Utils.isJsonEmpty( '{"key": "value"}' ) ).toBe( false );
            expect( Utils.isJsonEmpty( 'not-json' ) ).toBe( false );
        });

        it( 'should return false for non-empty objects', () =>
        {
            /*
                objects with properties
            */

            expect( Utils.isJsonEmpty({ name: 'test' }) ).toBe( false );
            expect( Utils.isJsonEmpty({ id: 1, name: 'John', active: true }) ).toBe( false );
            expect( Utils.isJsonEmpty({ nested: { key: 'value' } }) ).toBe( false );

            /*
                objects with arrays
            */

            expect( Utils.isJsonEmpty({ items: [] }) ).toBe( false );
            expect( Utils.isJsonEmpty({ items: [ 1, 2, 3 ] }) ).toBe( false );

            /*
                objects with various data types
            */

            expect( Utils.isJsonEmpty({ string: 'test' }) ).toBe( false );
            expect( Utils.isJsonEmpty({ number: 42 }) ).toBe( false );
            expect( Utils.isJsonEmpty({ boolean: true }) ).toBe( false );
            expect( Utils.isJsonEmpty({ nullValue: null }) ).toBe( false );
            expect( Utils.isJsonEmpty({ undefinedValue: undefined }) ).toBe( false );
        });

        it( 'should handle objects with inherited properties', () =>
        {
            /*
                create object with prototype
            */

            function Parent()
            {
                this.inheritedProp = 'inherited';
            }
            Parent.prototype.prototypeProp = 'prototype';

            function Child()
            {
                Parent.call( this );
                this.ownProp = 'own';
            }
            Child.prototype = Object.create( Parent.prototype );

            const childInstance = new Child();

            /*
                this function checks if ANY property is NOT an own property and returns true if found
                    since inheritedProp comes from the parent constructor; it is an own property.
                however; prototypeProp is on the prototype, so it's not an own property.
                    the function returns true when it finds a non-own property

                makes sense, right?
            */

            expect( Utils.isJsonEmpty( childInstance ) ).toBe( true );

            /*
                test object with only own properties
            */

            const objWithOnlyOwn = { ownProp: 'value' };
            expect( Utils.isJsonEmpty( objWithOnlyOwn ) ).toBe( false );

            /*
                test object with only non-own properties
            */

            const objWithOnlyInherited = Object.create({ inherited: 'value' });
            expect( Utils.isJsonEmpty( objWithOnlyInherited ) ).toBe( true );
        });

        it( 'should handle arrays correctly', () =>
        {
            /*
                empty array
            */

            expect( Utils.isJsonEmpty( [] ) ).toBe( true );

            /*
                non-empty arrays
            */

            expect( Utils.isJsonEmpty( [ 1, 2, 3 ] ) ).toBe( false );
            expect( Utils.isJsonEmpty( [ 'a', 'b', 'c' ] ) ).toBe( false );
            expect( Utils.isJsonEmpty( [{}] ) ).toBe( false );                          // array with empty object
        });

        it( 'should handle edge cases', () =>
        {
            /*
                really big ass object
            */

            const largeObj = {};
            for ( let i = 0; i < 1000; i++ )
            {
                largeObj[ `key${ i }` ] = `value${ i }`;
            }

            expect( Utils.isJsonEmpty( largeObj ) ).toBe( false );

            /*
                objects with special property names
            */

            expect( Utils.isJsonEmpty({ '': 'empty string key' }) ).toBe( false );
            expect( Utils.isJsonEmpty({ '0': 'numeric string key' }) ).toBe( false );
            expect( Utils.isJsonEmpty({ '\n': 'newline key' }) ).toBe( false );

            /*
                objects with symbol keys (symbols are not enumerable by default in for...in)
            */

            const symbolKey = Symbol( 'test' );
            const objWithSymbol = {};
            objWithSymbol[ symbolKey ] = 'value';
            expect( Utils.isJsonEmpty( objWithSymbol ) ).toBe( true );                  // symbols aren't enumerable in for...in

            /*
                object with getter/setter
            */

            const objWithGetter = {};
            Object.defineProperty( objWithGetter, 'computed',
            {
                get() { return 'computed value'; },
                enumerable: true
            });

            expect( Utils.isJsonEmpty( objWithGetter ) ).toBe( false );
        });
    });

    describe( 'Integration tests', () =>
    {
        it( 'should work together for JSON validation and emptiness checking', () =>
        {
            /*
                valid json that is empty
            */

            const emptyJsonString = '{}';
            expect( Utils.isJsonString( emptyJsonString ) ).toBe( true );

            const parsedEmpty = JSON.parse( emptyJsonString );
            expect( Utils.isJsonEmpty( parsedEmpty ) ).toBe( true );

            /*
                valid json that is not empty
            */

            const nonEmptyJsonString = '{"name": "test", "value": 123}';
            expect( Utils.isJsonString( nonEmptyJsonString ) ).toBe( true );

            const parsedNonEmpty = JSON.parse( nonEmptyJsonString );
            expect( Utils.isJsonEmpty( parsedNonEmpty ) ).toBe( false );

            /*
                invalid JSON should not be parsed
            */

            const invalidJsonString = '{name: "test"}';
            expect( Utils.isJsonString( invalidJsonString ) ).toBe( false );

            /*
                We wouldn't call isJsonEmpty on invalid JSON
            */
        });
    });

    describe( 'getFuncName', () =>
    {
        it( 'should return the name of the calling function', () =>
        {
            function testFunction()
            {
                return Utils.getFuncName();
            }

            const result = testFunction();
            expect( result ).toBe( 'testFunction' );
        });

        it( 'should work with arrow functions', () =>
        {
            const arrowFunction = () =>
            {
                return Utils.getFuncName();
            };

            const result = arrowFunction();
            expect( result ).toBe( 'arrowFunction' );
        });

        it( 'should work with named function expressions', () =>
        {
            const namedExpr = function namedExpression()
            {
                return Utils.getFuncName();
            };

            const result = namedExpr();
            expect( result ).toBe( 'namedExpression' );
        });

        it( 'should work with method calls', () =>
        {
            const obj =
            {
                methodName()
                {
                    return Utils.getFuncName();
                }
            };

            const result = obj.methodName();
            expect( result ).toBe( 'Object.methodName' );
        });

        it( 'should work with nested function calls', () =>
        {
            function outerFunction()
            {
                function innerFunction()
                {
                    return Utils.getFuncName();
                }

                return innerFunction();
            }

            const result = outerFunction();
            expect( result ).toBe( 'innerFunction' );
        });

        it( 'should work with class methods', () =>
        {
            class TestClass
            {
                testMethod()
                {
                    return Utils.getFuncName();
                }
            }

            const instance = new TestClass();
            const result = instance.testMethod();
            expect( result ).toBe( 'TestClass.testMethod' );
        });

        it( 'should handle anonymous functions gracefully', () =>
        {
            const anonymousResult = ( () =>
            {
                return Utils.getFuncName();
            })();

            // Anonymous functions might return different results depending on the environment
            expect( typeof anonymousResult ).toBe( 'string' );
        });
    });

    describe( 'getConstructorName', () =>
    {
        it( 'should return the name of a constructor when called with new', () =>
        {
            function TestConstructor()
            {
                this.constructorName = Utils.getConstructorName();
            }

            const instance = new TestConstructor();
            expect( instance.constructorName ).toBe( 'new TestConstructor' );
        });

        it( 'should work with ES6 class constructors', () =>
        {
            class MyClass
            {
                constructor()
                {
                    this.constructorName = Utils.getConstructorName();
                }
            }

            const instance = new MyClass();
            expect( instance.constructorName ).toBe( 'new MyClass' );
        });

        it( 'should work with named function constructors', () =>
        {
            function NamedConstructor()
            {
                this.constructorName = Utils.getConstructorName();
            }

            const instance = new NamedConstructor();
            expect( instance.constructorName ).toBe( 'new NamedConstructor' );
        });

        it( 'should work with constructor functions that call other functions', () =>
        {
            function HelperConstructor()
            {
                this.init();
            }

            HelperConstructor.prototype.init = function ()
            {
                this.constructorName = Utils.getConstructorName();
            };

            const instance = new HelperConstructor();
            expect( instance.constructorName ).toBe( 'new HelperConstructor' );
        });

        it( 'should handle nested constructor calls', () =>
        {
            function ParentConstructor()
            {
                this.constructorName = Utils.getConstructorName();
            }

            function ChildConstructor()
            {
                ParentConstructor.call( this );
                this.childConstructorName = Utils.getConstructorName();
            }

            const instance = new ChildConstructor();
            expect( instance.constructorName ).toBe( 'new ChildConstructor' );
            expect( instance.childConstructorName ).toBe( 'new ChildConstructor' );
        });

        it( 'should work with complex inheritance patterns', () =>
        {
            class BaseClass
            {
                constructor()
                {
                    this.baseConstructorName = Utils.getConstructorName();
                }
            }

            class DerivedClass extends BaseClass
            {
                constructor()
                {
                    super();
                    this.derivedConstructorName = Utils.getConstructorName();
                }
            }

            const instance = new DerivedClass();
            expect( instance.baseConstructorName ).toBe( 'new BaseClass' );
            expect( instance.derivedConstructorName ).toBe( 'new DerivedClass' );
        });

        it( 'should handle cases where no constructor is found gracefully', () =>
        {
            /*
                test calling getConstructorName outside of a constuctor context
                    this should be able to return a proper value; or handle the error gracefully
            */

            try
            {
                const result = Utils.getConstructorName();

                /*
                    ff it doesn't throw, it should return a string
                */

                expect( typeof result ).toBe( 'string' );
            }
            catch ( error )
            {
                /*
                    if it throws, that's also acceptable behavior for this edge case
                */

                expect( error ).toBeInstanceOf( Error );
            }
        });
    });

    describe( 'Stack trace utility functions integration', () =>
    {
        it( 'should work correctly when both functions are called in the same context', () =>
        {
            function TestFunction()
            {
                this.funcName = Utils.getFuncName();
                this.constructorName = Utils.getConstructorName();
            }

            const instance = new TestFunction();
            expect( instance.funcName ).toBe( 'new' );
            expect( instance.constructorName ).toBe( 'new TestFunction' );
        });

        it( 'should handle complex call stacks', () =>
        {
            class ComplexClass
            {
                constructor()
                {
                    this.setup();
                }

                setup()
                {
                    this.configure();
                }

                configure()
                {
                    this.funcName = Utils.getFuncName();
                    this.constructorName = Utils.getConstructorName();
                }
            }

            const instance = new ComplexClass();
            expect( instance.funcName ).toBe( 'ComplexClass.configure' );
            expect( instance.constructorName ).toBe( 'new ComplexClass' );
        });
    });
});
