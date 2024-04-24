import { z } from "zod";

const JsonRpcErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  data: z.any(),
});

export const JsonRpcResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.any().optional(),
  error: JsonRpcErrorSchema.optional(),
});

export const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0"), // only 2.0 is supported
  method: z.string(),
  params: z
    .union([z.array(z.unknown()), z.record(z.unknown()), z.literal(null)])
    .optional(),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
});

export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;
export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;
