import { BaseRoute } from "./BaseRoute";
import { handleServerRoot } from "../handlers/serverHandlers/api";

export default class ServerRoute extends BaseRoute {
  public routes(): void {
    
    this.router.post("/", handleServerRoot);
  }
}
