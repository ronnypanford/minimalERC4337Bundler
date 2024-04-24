import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

function isRouteFile(file: string): boolean {
  return file.endsWith("Route.ts") && file !== "BaseRoute.ts";
}

// Dynamically import and initialize all route files in the directory
fs.readdirSync(__dirname).forEach((file) => {
  if (file === "index.ts" || file === "index.ts.map" || !isRouteFile(file))
    return; // Skip this file, source map, and non-route files

  try {
    const route = require(path.join(__dirname, file)).default;
    const routeInstance = new route();
    routeInstance.routes(); // Initialize the routes for this file
    router.use(routeInstance.getRouter()); // Add the subclass router to the main router
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn(`Failed to load route from file ${file}: ${error.message}`);
    } else {
      console.warn(`Failed to load route from file ${file}: Unknown error`);
    }
  }
});

router.use("*", (req, res) => {
  res.status(404).json({ error: "Invalid method" });
});

export default router;
