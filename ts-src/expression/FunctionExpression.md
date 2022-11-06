# Function Expressions

A Function Expression allows for custom expressions to be introduced into the Rules Engine. A Function Expression is an
expression that calls an external function, passing in the data domain and [Scope](../scopes.md), to determine the value of 
the expression at "run time".

In addition to the Expression type and data type fields, a Function Expression contains a reference to an external 
function to be called the signature of which must be:

    type AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext, ...params) => Promise<any> | any;

The external function is provided to the Rules Engine through a [Module Definition](../rule-element-ref/module.md), 
noting here that we make use only of the functionName (not the constructorName or propertyName) are 
used:

    type ModuleDefinition = {
        moduleName: string;
        functionName?: string;
        constructorName?: string;
        propertyName?: string;
    };

    where:
        moduleName is the name of the local or package module (see Module Definition documentation)
        functionName is the name of the exported function, and is the refName of the Function Expression (see below)
        constructorName and propertyName are ignored for this purpose

The module definition is loaded in [Options](../../Options.md), inline in the Reference Format, inline 
through the Text Format, or programmatically.

Noting from the Module Definition documentation that the function named functionName and exported by the module 
moduleName is actually a factory function.  That factory function needs to return a function object that meets the 
AwaitEvaluation interface.  It is that function that is then invoked at "run time", not the factory function!

## Internal Format
The internal format is beyond the scope of user documentation.

## Reference Format

In addition to attributes inherited from ExpressionReference, the FunctionExpressionReference contains the name of 
the exported AwaitEvaluation function as refName, as well as a list of parameter Expressions:

    {
        type: 'Function',
        dataTypeRef: 'SomeDataTypeRef',
        refName:  'StockStochastic',
        params: [1, <<ex data-type=Text>> someAttribute]
    }

    Where 
        refName "StockStochastic" is the name given to the Module Defintion providing the AwaitEvaluation function.
        params are expressions whose evaluated values at run time we want to pass to the awaitEvaluation function

The module definition can be provided inline, and placed in the closest scope.  As is usual with inlining, it will 
not replace an existing definition of the same name:

    { 
        type: 'Function'
        dataTypeRef: 'SomeDataTypeRef',
        refName: 'StockStochastic'
        module: {
            moduleName: '@franzzemen/stock-stochastic',
            functionName: 'StockStochasticFactoryFunction'
        }
    }

Again, noting that the module definition points to a factory function that returns an AwaitEvaluation function.

Omitted above is the fact that a custom Data Type can also be defined inline, per [Expression Documentation](./Expression.md)

## Text Format

The text format for a Function Expression can take on several forms.  The simplest is:

    @functionName

Where the function name is how the function is desired to be reference.  It is NOT the functionName in the Module 
Definition, which is the factory function.  If a proper description for what this Function Expression resolves to 
was a stochastic value for a stock we might call it "StockStochastic":

    @StockStochastic

The "@" symbol signals to the Rules Engine that what follows is, in fact, a Function Expression.  It's possible the 
Data Type for the expression is also needed (for example, if the expression is on the left-hand side of a condition) 
and that would be provided through the usual hint:

    <<ex data-type=Float>> @StockStochastic

The "type" hint is not required in the hint (but can be used), since the "@" provides the inference to a Function 
Expression type. If the type hint is used, then the "@" symbol is optional:

    <<ex type=Function data-type=Float>> @StockStochastic
    <<ex type=Function data-type=Float>> StockStochastic

All this assumes that the Function Expression's module definition has been previously loaded through Options, 
programmatically or inline (noting that by default a definition is not overwritten if it is defined more than once).

To load the Function Expression module definition inline use the following syntax options (a through c) in the hint:

a) Separate hint fields specifying factory function (we are using the explicit "type" hint here as well for 
readability, and a relative path to a module)

    <<ex 
        type=Function
        module-name=../../../custom/expression/stock-stochastic,
        function-name=stockStochasticFactory,
    >> StockStochastic

b) Separate hint fields specifying constructor (we are using an NPM package here to illustrate relative paths vs 
packages):

    <<ex
        module-name=@franzzemen/custom-expressions,
        constructor-name=StockStochastic,
    >> @StockStochastic

c) JSON hint with factory function

     <<ex module={
            "moduleName": "../../../custom/expression/stock-stochastic",
            "functionName": "stockStochasticFactory"
          }  
    >> @StockStochastic

See [Module Definitions](../rule-element-ref/module.md) for pathing of relative modules vs packages.

Remember that per [Expression](./Expression.md) documentation, a custom Data Type can also be loaded inline 
(not shown here).

A function expression can also accept Expression parameters.  These are any type of Expressions that, at run time, 
will be evaluated and passed to the awaitEvaluation function.  In Text Format, specify the parameters as a list of 
Expressions within [] brackets separated by commas or spaces.

    @StockStochastic[4.0, 3, <<ex data-type=Date>> interest.date]

    Where at run time the parameters 4.0, 3, and the value of interest.date will be passed to the awaitEvaluation 
    function via the ...params  parameter, in the same order they are declared here.

It is legal to express the Function Expression with an empty bracket 

    @StockStochastic[]

    is equivalent to
    
    @StockStochastic

The astute reader will note that the parameter list itself can contain other Function Expressions, Set Expressions etc.

N.B. The data domain is _always_ passed to the function expression.  It can be an alternative way to provide the 
function expression implementation with variable information;  however, placing parameters explicitly in the Function 
Expression follows with principles of externalization.  The decision is up to the user.

## Steps to Create a Factory Function
Here we outline the steps needed to create a Factory Function.  For simplicity, we will be using the Standard Data 
Type Number.  For reference steps are performed in the unit tests.

First we create the actual module that contains the factory function.  This is located in:

    root/ts-test/core/expression/parser/await-evaluation-factor-number-5.ts

The source is copied here:

    import {ExecutionContextI} from '@franzzemen/app-utility';
    import {AwaitEvaluation} from '../../../../publish/core/expression/function-expression';


    const awaitEvaluation: AwaitEvaluation = (dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext) : any | Promise<any> => {
        return 5;
    }

    export function awaitEvaluationFactoryNumber5(): AwaitEvaluation {
        return awaitEvaluation;
    }

We have used the simplest possible case, where the factory function awaitEvaluationFactoryNumber5 simply returns a 
function of signature AwaitEvaluation, which itself simply returns a value 5 of Data Type Number.  The simplicity is 
because the test simply proves that we can load and execute the factory function and evaluate the Function 
Expression regardless of implementation.

Now that we've created the actual functionality, we need to load it into the rules engine.  We'll use the text 
format, and we'll load it using a parser.  In this case, we just want to evaluate the expression by itself, so we 
can use the FunctionExpressionParser or the ExpressionStackParser.  We'll use the latter one and parse our expression:

    '<<ex 
        data-type=Number 
        module={
            "moduleName": "../../../testing/core/expression/parser/await-evaluation-factory-number-5", 
        "functionName":"awaitEvaluationFactoryNumber5" }
    >> 
    @ReturnsNumber5'

From teh above, you can see that we are calling the AwaitEvaluation function "ReturnsNumber5".

If we parse this we get the FunctionExpressionReference (Reference Format) as JSON to be:

    ref: ExpressionReference = {
        "type": "Function",
        "dataTypeRef": "Number",
        "refName": "ReturnsNumber5",
        "module": {
            "moduleName": "../../../testing/core/expression/parser/await-evaluation-factory-number-5",
            "functionName": "awaitEvaluationFactoryNumber5"
        }
    }

Finally, we programmatically create an Expression from the reference to evaluate it:

    (new FunctionExpression(ref, scope)).evaluate({}, scope); // Returns 5

Which of course returns the value 5.  Contrived for such a simple example, but consider that we can create any 
custom expression, even with a custom Data Type, and have it evaluate as any other expression within the Rules 
Engine! 

## Multivariate Function Expressions

The rules engine allows Function Expressions to return multivariate values at run time; essentially it allows 
the Function Expression to resolve to whole arrays which can then be used with comparators supporting multivariate 
values.  This is similar to the Set Expression type.

There are several caveats similar to Set Expressions that must exist.  The Data Type of Function Expression must be
consistent with the Expression's contents, i.e. at run time every member of the array must be consistent with Data Type
of the Function Expression.  This includes Custom Data Types.

Unlike Set Expressions which are explicitly known to be multivariate prior to "run time", it is not possible for the
Rules Engine to infer that an Function Expression result will be multivariate.  To ensure Text Format parsing catches 
issues ahead of time, the multivariate hint needs to be used by default for such Function Expressions.  This will cause
the parser to fail if it parses a condition with a Comparator that does not support multivariate values.

    <<ex multivariate=true>> @stockTickers

or using a unary hint:

    <<ex multivariate>> @stockTickers

Which could then be used in the following conditions, for example:

    <<ex data-type=Text multivariate>> @stockTickers like "GOOG*"

    "GOOGL" like <<ex multivariate>> @stockTickers

    "GOOGL" in <<ex multivariate>> @stockTickers
    

To effectively use multivariate Function Expressions (and Set Expressions, and other multivariate expressions), the 
Comparator must support left-hand-side, right-hand-side or both sides to be multivariate values, such as the Standard Like Comparator.

While the multivariate hint can be used optionally for readability, it is the value at run time along with the
compatible Comparator that matters.  It can be helpful to enforce its usage for clarity and to do so you can set
the parsing option multivariateHints to true.  Regardless, at run time, the contractor for Comparators will enforce
the rules and throw an error if it encounters an inconsistent result.  Note that if an Function Expression
Reference or Text Format is provided for parsing with a multivariate flag, it will preserve it and stringify it as
well.

If a Function Expression returns a multi-variate result asynchronously (Promise result), the result should be 
similar to the Promise.all() output. 

## Known Function Expressions
The Rules Engine publishes a number of "known" Function Expressions.  These are:

### Text Functions

    @length

### Math Functions
    
    @square
    @sqrt
    @exp // Also can be done with formula                      
    @sum
    @avg
    @sum
    @avg
    @cos
    @sin
    @tan
    @acos
    @asin
    @atan
    
### Financial Functions

### Statistical Functions



        


