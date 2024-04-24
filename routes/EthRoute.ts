import { BaseRoute } from "./BaseRoute";
import {
  handleSendUserOperations,
  handleEstimateUserOperationGas,
} from "../handlers/ethHandlers/userOperations";

export default class EthRoute extends BaseRoute {
  public routes(): void {
    // User operations
    this.router.post("/eth_sendUserOperation", handleSendUserOperations);
    this.router.post(
      "/eth_estimateUserOperationGas",
      handleEstimateUserOperationGas
    );

    // other eth rpc methods
  }
}
