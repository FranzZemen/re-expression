# Attribute Expressions

Along with Value Expressions, Attribute Expressions are perhaps the most frequently used expressions. Attribute
expressions allow a user to specify the attribute value in the data domain to be retrieved.

Attribute Expressions extend Expressions with a "path" property, which is the path to the attribute of interest in the
data domain at "run time".  It also allows for an optional "multivariate" property, which defaults to false.

The path property itself has some format and functional options. It can be expressed per documentation of the
'object-path' NPM package on which it depends and it can be expressed in a more natural way per documentation here.

## Shallow Attribute

For a shallow attribute the path is the attribute name. For example:

    If the data domain is:

    {
        foo: 'Hello World'
    }

    Then the path for the attribute foo is:

    foo

The Reference Format for an Attribute Expression for the above path would be:

    {
        type: 'Attribute',
        dataTypeRef: 'Text',
        path: 'foo'
    }

For the Text Format, the type can be inferred by the Rules Engine; however the data-type may be required if the data
type for the current usage has not been determined (for example, the left hand side of the Condition, or the first
expression in a Formula):

    <<ex data-type=Text>> foo

If the data type is determined, this simplifies to

    foo

Which is why we tend to provide examples of Conditions with Value and Attribute Expressions with the Attribute
Expression on the right-hand side, i.e. the Value Expression on the left-hand side has already set the data type:

    "Hello World" like foo

is more readable than:

    <<ex data-type=Text>> foo like "Hello World"

Note that the other object-path options are also available, since that is the library under the covers. For example, the
array format can be used to specify the path:

    ["foo"]

However, do not use the object-path quoted method...simply omit the quotes (or use a type hint if using outer quotes):

    "foo" 

will not work because that will be inferred as a Value Expression of Text Data Type; use foo instead or use a type hint:

    <<ex type=Attribute>> "foo"

However, everyone will agree that the following is simplest:

    foo

## Nested Attribute

Nested attributes use the dot "." for the attribute path:

For example

    Data Domain: {foo: {bar: 5}}
    Path: foo.bar
    Output: 5

Alternative object-path options:

    <<ex type=Attribute>> "foo.bar"

    ["foo","bar"]

## Indexed Attribute

Attributes referred to by a zero based index can simply leverage the square brackets. One can of course mix index and
nested paths:

Top level indexed attributes:

    Data Domain: [{name: 'hello', value:'world'}]
    Path: [0]
    Output: {name: 'hello', value: 'world'}

    Data Domain: [{name: 'hello', value:'world'}]
    Path: [0].name
    Output: 'hello'

Nested indexed attributes:

    Data Domain: {stock: {ticker: 'FB', priceStream: [20, 21, 19, 22]}}
    Path: stock.priceStream[2]
    Output: 19

An index path format from object-path can also be used; in some cases it requires a type prefix on the Expression

    Data Domain: [{name: 'hello', value:'world'}]
    Path: 0
    Output: {name: 'hello', value: 'world'}
    Type prefix required?:  Yes, or it clashes with a Value Expression of Data Type Number.
    Expression syntax:  <<ex type=Attribute data-type=SomeCustomDataType>> 0


    Data Domain: [{name: 'hello', value:'world'}]
    Path: 0.name
    Output: 'hello'
    Type prefix required?: No

    Data Domain: {stock: {ticker: 'FB', priceStream: [20, 21, 19, 22]}}
    Path: stock.priceStream.2
    Output: 19
    Type prefix required? No

Or the less useful version of object-path

    Data Domain: [{name: 'hello', value:'world'}]
    Path: ['0', 'name']
    Output: 'hello'
    Type prefix required?: No

    Data Domain: {stock: {ticker: 'FB', priceStream: [20, 21, 19, 22]}}
    Path: ['stock','priceStream','2']
    Output: 19
    Type prefix required? No

## Multivariate Attributes

The rules engine allows attributes to return multivariate values at run time; essentially it allows attributes to 
point to whole arrays; which can then be used with comparators supporting multivariate values.  This is similar to 
the Set Expression type.

There are several caveats similar to Set Expressions that must exist.  The Data Type of Attribute Expression must be 
consistent with the Expression's contents, i.e. at run time every member of the array must be consistent with Data Type 
of the Attribute Expression.  This includes Custom Data Types.

Unlike Set Expressions which are explicitly known to be multivariate prior to "run time", it is not possible for the 
Rules Engine to infer that an attribute will be multivariate.  To ensure Text Format parsing catches issues 
ahead of time, the multivariate hint needs to be used by default for such Attribute Expressions.  This will cause 
the parser to fail if it parses a condition with a Comparator that does not support multivariate values.

    <<ex multivariate=true>> stockTickers

or using a unary hint:

    <<ex multivariate>> stockTickers

Which could then be used in the following condition examples

    <<ex data-type=Text multivariate>> stockTickers like "GOOG*"

    "GOOGL" like <<ex multivariate>> stockTickers

    "GOOGL" in <<ex multivariate>> stockTickers

To effectively use multivariate attributes (and Set Expressions), the Comparator must support left-hand-side, 
right-hand-side or both sides to be multivariate values, such as the Standard Like Comparator.

While the multivariate hint can be used optionally for readability, it is the value at run time along with the 
compatible Comparator that matters.  It can be helpful to enforce it's usage for clarity and to do so you can set 
the parsing option multivariateHints to true.  Regardless, at run time, the contractor for Comparators will enforce 
the rules and throw an error if it encounters an inconsistent result.  Note that if an Attribute Expression 
Reference or Text Format is provided for parsing with a multivariate flag, it will preserve it and stringify it as 
well.
