# Condition Expressions
A Condition Expression is an expression that logically compares two other Expressions using a Comparator.  As a result,
the [Data Type](../data-type/DataType.md) of a Condition Expression is _always_ Boolean.

The Condition Expression is related to the [Condition](../condition/Condition.md) construct.  A 
Condition exists within the context of a Logical Condition.  It takes no hints, and is part of the overall Logical Rule 
construct.  A Logical Expression is a standalone concept that can be used in other constructs (including within a Condition).

# Attributes
In addition to the Expression type and dataType properties a Condition Expression contains the Left Hand Side (LHS) 
Expression, the Right Hand Side (RHS) Expression and a [Comparator](../comparator/Comparator.md) that compares the 
two at "run time".

The LHS and RHS Expressions (or their result if Formula etc) must be of the same Data Type.

# Reference Format
The Reference Format is:

    type ExpressionReferences = <all Expression Shapes or'ed together>

    interface ConditionReference {
        type: 'Condition';
        dataTypeRef: 'Boolean';
        lhsRef: ExpressionReferences;
        rhsRef: ExpressionReferences;
        comparatorRef: string;
    }


# Text Format
A Logical Expression's Text Format has the shape:

    ?[lhsExpression comparator rhsExpression]

    or
    
    <<ex type=Condition>> lhsExpression comparator rhsExpression

Note that this differs from a Condition which is not prefixed or bounded, and does not take hints.

For example:

    ?[5.0 <= stock.price]

    or
    
    <<ex type=Condition>> 5.0 <= stock.price


