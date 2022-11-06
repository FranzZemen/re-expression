# Set Expressions
A Set Expression represents a set of Expressions.  Set Expressions are useful for comparisons with Comparators like 
"in" and "not in", Formulas like &sum and operations that require a set of Expressions and other cases.

The type of a Set Expression is "Set".  The Expression type of each Expression in the Set may be different.

The Data Type of the Set Expression may be any Data Type.  The Data Type of the Expressions in the Set must be the 
same as the Data Type of the Set Expression (at least, the resultant Data Types...as there may be intermediary 
expressions such as within a Formula).

To repeat, each Expression in a Set can be any type of Expression, but they must all have the same Data Type.

## Set Expression Reference Format

The Reference format for a Set Expression is the base Expression Reference format supplemented by the set attribute, 
which is an array of Expression References.

    {
        type: ExpressionType | string;
        dataTypeRef: string;
        set: ExpressionReference[];
    }

### Set Expression Text Format

The required Text Format for a set are Expressions enclosed by square brackets and separated any white space or 
comman (with white spaces). A type hint is optional.  For example

    [
        5.0,
        stock.price 
        @SectorPrice
    ]
    
    or
    
    [5.0, stock.price @SectorPrice]

    or

    <<ex type=Set>> [5.0 stock.price, @SectorPrice]

The Data Type of the Set is inferred if any of the Set members have an inferred Data Type or an explicit one, or as 
with all Expressions the Data Type was externally inferred such as being on the right-hand side of a Condition where 
the left-hand side determined the Data Type.  Note that if there is a detected conflict between Data Types (different Set member Data Types) then a parsing Error 
will be thrown.  

If the Data Type is to be inferred, it will be inferred from the first member Expression that has an inferrable 
or specified data type.

Member Expressions may have data type hints, or not

    [
        <<ex type=Value data-type=Float>> 5.0
        stock.price
        <<ex type=Function>> Sector Price
    ]

In the provided example no hints are necessary because he first expression is a Value Expression that sets the 
Data Type so.., 

    [5.0, stock.price , @SectorPrice]

... is a well-formed Set Expression, but so is the following, which has no Value Expression...

    [stock.price, <<ex data-type=Float>> @SectorPrice]

...because the Set Data Type is defined by the second Expression in the set.  If no expressions in the set define 
the data type and it is not inferrable externally, then the Set itself can be provided a Data Type:

    <<ex data-type=Float>> [stock.price, @SectorPrice]

### Potential Conflict between Set Expressions and Object Literals of Custom Data Types

Object literals of Custom Data Types are essentially JSON objects, which means that they could be JSON arrays.  
Moreover, the elements of the JSON array could themselves be literals of Custom Data Types.  In this particularly 
unique case, the inference engine will not be able to distinguish from Set Expressions and Value Expressions with 
these Custom Data Types object literals.  

By default, the Set Expression in the Expression Stack Parser's inference stack is invoked after the Value 
Expression, which means that in this unique case the Set would not get inferred.  This is most likely the desired 
behavior, however if the opposite was desired, then a type hint for the Set Expression should be used.

## Evaluation of Set Expression

As with all Expressions, a Set Expression contains the method of signature AwaitEvaluation:

    type AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext) => Promise<any> | any;

A Set Expression will therefore return an array of the individual evaluations of its contained Expressions.  If any 
of those return a Promise, the return type of the Set will be the result of Promise.all, i.e. it will return a 
Promise whose eventual value is the result of Promise.all over the contained expressions.  Generally speaking the 
Rules Engine handles this gracefully, converting to a Promise based evaluation if it hasn't already done so.  
However when evaluating the Set Expression directly (programmatically), the caller needs to take this into account.

