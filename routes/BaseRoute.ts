import { Router } from 'express';

export abstract class BaseRoute {
 protected router: Router;

 constructor() {
    this.router = Router();
 }

 public abstract routes(): void;

 public getRouter(): Router {
    return this.router;
 }
}
