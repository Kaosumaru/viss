import {
  variantAllScalarsVectors,
  variantScalarVector,
  type Type,
} from "@glsl/types/types";
import { CompilerNode, type NodeContext, type NodeInfo } from "../compilerNode";
import type { Context, Expression } from "@compiler/context";
import { defaultExpressionForType } from "@glsl/types/defaultExpressionForType";
import { componentType } from "@glsl/types/componentType";

export interface BinaryOperatorTypes {
  a: Type;
  b: Type;
  out?: Type;
}

export abstract class BinaryOperator extends CompilerNode {
  constructor() {
    super();
    this.addInput("a", variantAllScalarsVectors());
    this.addInput("b", variantAllScalarsVectors());
  }

  override compile(node: NodeContext): Context {
    const types = this.getTypes(node);
    if (!types.out) {
      return this.createOutputs(node, []);
    }
    const inA = this.getOperatorInput(node, types, "a");
    const inB = this.getOperatorInput(node, types, "b");

    const out = `(${inA.data} ${this.operationSymbol()} ${inB.data})`;

    return this.createOutput(node, {
      data: out,
      type: types.out,
      trivial: false,
    });
  }

  protected abstract operationSymbol(): string;

  override getLabel(): string {
    return this.operationSymbol();
  }

  protected getOperatorInput(
    node: NodeContext,
    type: BinaryOperatorTypes,
    inputName: "a" | "b"
  ): Expression {
    const input = node.tryGetInput(inputName);
    if (input) {
      return input;
    }
    const expectedType = type[inputName];
    return defaultExpressionForType(expectedType);
  }

  protected getTypes(node: NodeContext): BinaryOperatorTypes {
    const inA = node.tryGetInput("a");
    const inB = node.tryGetInput("b");

    if (!inA && !inB) {
      return {
        a: variantAllScalarsVectors(),
        b: variantAllScalarsVectors(),
        out: undefined,
      };
    }

    const inputType = (inA ?? inB)!.type;
    const typeName = componentType(inputType);
    const genericIInputType = variantScalarVector(typeName);

    const outputType = this.getOutputType(inA, inB)!;

    return {
      a: genericIInputType,
      b: genericIInputType,
      out: outputType,
    };
  }

  override getInfo(node: NodeContext): NodeInfo {
    try {
      const types = this.getTypes(node);

      return {
        name: this.getLabel(),
        description: this.getDescription(),
        inputs: [
          { name: "a", type: types.a },
          { name: "b", type: types.b },
        ],
        outputs: types.out ? [{ name: "out", type: types.out }] : [],
        parameters: [],
      };
    } catch (error) {
      return {
        name: this.getLabel(),
        description: this.getDescription(),
        inputs: [],
        outputs: [],
        parameters: [],
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  protected getOutputType(
    inA: Expression | undefined,
    inB: Expression | undefined
  ): Type | undefined {
    if (!inA || !inB) {
      return inA?.type ?? inB?.type;
    }

    return inA.type.id == "scalar" ? inB.type : inA.type;
  }
}

/*
• The arithmetic binary operators add (+), subtract (-), multiply (*), and divide (/) operate on 
integer and floating-point scalars, vectors, and matrices. 

If the fundamental types in the operands do not match, then the conversions from “Implicit Conversions” 
are applied to create matching types. 
All arithmetic binary operators result in the same fundamental type 
(signed integer, unsigned integer, single-precision floating-point, or double-precision floating-point) as the operands they operate on, 
after operand type conversion. After conversion, the following cases are valid:

1. The two operands are scalars. In this case the operation is applied, resulting in a scalar.
2. One operand is a scalar, and the other is a vector or matrix. In this case, 
the scalar operation is applied independently to each component of the vector or matrix, resulting in the same size vector or matrix.
3. The two operands are vectors of the same size. In this case, the operation is done component-wise resulting in the same size vector.
4. The operator is add (+), subtract (-), or divide (/), and the operands are 
matrices with the same number of rows and the same number of columns. 
In this case, the operation is done component-wise resulting in the same size matrix.
The operator is multiply (*), where both operands are matrices or one operand is a vector and the other a matrix.
A right vector operand is treated as a column vector and a left vector operand as a row vector.
In all these cases, it is required that the number of columns of the left operand is equal to the number of rows of the right operand.
Then, the multiply (*) operation does a linear algebraic multiply, yielding an object that has the same number of rows as the left operand and the same number of columns as the right operand. “Vector and Matrix Operations” explains in more detail how vectors and matrices are operated on.

All other cases result in a compile-time error.

*/
