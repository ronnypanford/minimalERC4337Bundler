import { Request, Response } from "express";
import { estimateUserOpGas } from "../../services/userOpGasEstimator";
import { sendUserOperation } from "../../services/userOp";
import { getUserOpStatus } from "../../services/userOperationStatus";
import { JsonRpcResponseSchema } from "../../common/validation/schemas";

// These handlers are for the eth namespace

export async function handleSendUserOperations(req: Request, res: Response) {
  try {
    const userOperation = req.body.params[0];
    const result = await sendUserOperation(userOperation);
    const response = JsonRpcResponseSchema.safeParse({
      jsonrpc: "2.0",
      id: (req as any).id,
      result: result,
    }).data;
    res.json(response);
    console.log("User operation sent");
    console.log(response);
    console.log("Transaction hash: ", result?.result);
  } catch (error) {
    res.status(500).json(
      JsonRpcResponseSchema.safeParse({
        jsonrpc: "2.0",
        id: (req as any).id,
        error: {
          code: "-32603",
          message: "Internal server error",
          data: error,
        },
      }).data
    );
  }
}

export async function handleEstimateUserOperationGas(
  req: Request,
  res: Response
) {
  try {
    const result = await estimateUserOpGas(req.body);
    res.json(result); // since from teh biconomy service we are returning the result directly
  } catch (error) {
    res.status(500).json(
      JsonRpcResponseSchema.safeParse({
        jsonrpc: "2.0",
        id: (req as any).id,
        error: {
          code: "-32603",
          message: "Internal server error",
          data: error,
        },
      }).data
    );
  }
}
