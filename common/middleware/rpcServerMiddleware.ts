import { Request, Response, NextFunction } from "express";
import { JsonRpcRequestSchema } from "../validation/schemas";
import { ZodError } from "zod";

export function jsonRpcMethodExtractor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validationResult = JsonRpcRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const method = validationResult.data?.method;
    if (!method) {
      return res
        .status(400)
        .json({ error: "Method is required in the JSON-RPC request" });
    }
    req.url = `/${method}`;
    req.originalUrl = `/${method}`;
    console.log(`Method: ${method}`);

    // force put the id in the request object, safe since id does not exist in the request object
    (req as any).id = validationResult.data?.id;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: "Invalid JSON-RPC request" });
    } else {
      return res
        .status(500)
        .json({ error: "An error occurred while processing the request" });
    }
  }
}
