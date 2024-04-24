import { Request, Response } from "express";
import { getUserOpStatus } from "../../services/userOperationStatus";


// These handlers are for the biconomy namespace


export async function handleGetUserOperationStatus(
  req: Request,
  res: Response
) {
  try {
    const result = await getUserOpStatus(req.body);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching the status of the UserOperation.",
      });
  }
}
