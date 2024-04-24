import { Request, Response } from "express";
import { JsonRpcResponseSchema } from "../../common/validation/schemas";

export async function handleServerRoot(req: Request, res: Response) {
  try {
    res.json(
      JsonRpcResponseSchema.safeParse({
        jsonrpc: "2.0",
        id: (req as any).id,
        result: "Server is running",
      }).data
    );
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
