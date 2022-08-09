# Formula Expressions
A Formula Expression resembles a Function Expression in that it operates on Expression parameters; however it is 
focused not on some encapsulated functionality but on direct operation between the contained expressions.

A Formula Expression is a potentially nested set of Expressions separated by mathematical Operators.  The contained 
Expressions may be any type of Expression.

Finally, a Formula Expression can be given a unique name, and it can be reused using that name instead of the 
formula itself.  If a formula is given a name, then it can also accept replaceable parameters, so that more context 
can be pumped into the formula each place it is used.

## Reference Format
The reference format is surprisingly simple; the complexity is introduced by what the expressionOperations contain.

    type Operator = string | StandardOperator;
    type OperationReference = {operator: Operator, ref: ExpressionReference};

    {
        type: string,
        dataTypeRef: string,
        refName?: string,
        parameters: ExpressionReference[] 
        operations: OperatorReference[]
    }

Note that the Data Type of Formula Expression is the resultant data type that will reflect the run time resulting 
value.  Each contained expression may have a different Data Type that, through various means, will result into the 
Formula Expression Data Type.

Let us say we want to model the following math formula in the reference format

    stock.price / stock.earningsPerShare

First we realize that the resultant Data Type is Float.  We also note that this simply divides one Attribute 
Expression by another.  Therefore, the reference format will is:

    {
        type: ExpressionType.Formula,
        dataTypeRef: StandardDataType.Float,
        operations: [{
            operator: StandardOperator.Addition,
            ref:  {
                type: ExpressionType.Attribute,
                dataTypeRef: StandardDataType.Float,
                path: 'stock.price'
            }
        }, {
            operator: StandardOperator.Division,
            ref: {
                type: ExpressionType.Attribute,
                dataTypeRef:  StandardDataType.Flaot,
                path: 'stock.earningsPerShare'
            }
        }]
    }

Taking a contrived nesting where someone wants to simulate a $1 increase on price the math formula looks like:

    (stock.price + 1.0) / stock.earningsPerShare

The reference format with the nesting would look like below.  In this case we name the top level Formula Expression 
for re-use, introduce a parameter instead of the hards coded 1.0, and pass the parameter down to the contained formula.
To pass the parameter down from the ancestor formula to the child formula we reference the parent formula parameter 
in the child parameters.  Then we reference the child's parameter in the value field.  Note that indexing of nested 
formula parameters is in the order they are encountered.

    {
        type: ExpressionType.Formula,
        refName: 'ModifiedPERatio',
        dataTypeRef: StandardDataType.Float,
        parameters: [1.0]
        operations: [{
            operator: StandardOperator.Addition,
            ref: {
                type: ExpressionType.Formula,
                dataTypeRef: StandardsDataType.Float,
                operations: [{
                    operator: StandardOperator.Addition,
                    ref: {
                        type: ExpressionType.Attribute,
                        dataTypeRef: StandardDataType.Float,
                        path: 'stock.price'
                    },
                },{
                    operator: StandardOperator.Addtion
                    ref: ExpressionType.Value,
                    dataTypeRef: StandardsDataType.Float,
                    value: '$0'
                }]
            }
        },{
            operator: StandardOperator.Division,
            expression: {
                type: ExpressionType.Attribute,
                dataTypeRef: StandardDataType.Float,
                path: 'stock.earningsPerShare'
            }
        }]
    }

The next time we use the formula, we can simply reference it and its new parameters:


    {
        type: ExpressionType.Formula,
        refName: 'ModifiedPERatio',
        dataTypeRef: StandardDataType.Float,
        parameters: [1.75]
    }

Pretty complex looking, right?  That's why we have the Text Format!

## Text Format
The Text Format is a more compact format to express just about anything in the Rules Engine. For example, the 
unnamed version of the ModifiedPERatio Reference Format example above would be this in the Text Format:

    @+[(stock.price + 1.0) / stock.earningsPerShare]

If we name the formula it looks like:

    @+ModifiedPERatio[(stock.price + 1.0) / stock.earningsPerShare]

If we parametrize the formula it looks like:

    @+ModifiedPERatio[1.0][(stock.price + $0) / stock.earningsPerShare]

And the next time we use it, it looks like:

    @+ModifiedPERatio[1.0]

Of course, we could have just written a Function Expression that accepts parameters and invoked something very similar:

    @ModifiedPERatio[1.0]

But the name formula allows us to create reusable formula outside the scope of changing a system programmatically.

The general Text Format is described below.

To indicate a Formula Expression without type hints, use the "@+" prefix, otherwise use a hint:

    <<ex type=Formula>> [stock.price / stock.earningsPerShare]

A Data Type hint for the Formula Expression itself is needed if it cannot be inferred.  For example, it can be 
inferred if it is on the RHS of a Condition.

    <<ex type=Formula data-type=Float>> [stock.price / stock.earningsPerShare]

The Data Type hint for the Formula can also be omitted if the Formula Expression has an explicit or inferrable and 
consistent data type in the formula itself. In the above, it does not.  However, the following examples do:

    @+[stock.price / <<ex data-type=Float>> stock.earningsPerShare]  // The explicit Float

    @+[@+[stock.price + 1.0] / stock.earningsPerShare]  // The inferred float from the Value Expression

A name may be provided.  It either follows the hint block or the ? (or both, as the ? does not preclude the hint 
block).  There must not be a space between the "?" and the name.  The name must be alpha numeric only, no spaces or 
special characters.

The formula itself is delimited by square brackets.  If a ? or ?name is present, the opening square bracket is 
appended with no space in between. 

The formula is inside the square brackets and can be nested using normal brackets "(" and ")".
