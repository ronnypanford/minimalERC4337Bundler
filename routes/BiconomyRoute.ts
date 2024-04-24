import { BaseRoute } from "./BaseRoute";
// import {
//   handleGetUserOperationStatus,
// } from "../handlers/ethHandlers/userOperations";

export default class BiconomyRoute extends BaseRoute {
  public routes(): void {
    // User operations

    // uncomment this to support the getUserOperationStatus method
    // this.router.post("/biconomy_getUserOperationStatus", handleGetUserOperationStatus);
  }
}
