import express from "express";
import morgan from "morgan";
import { jsonRpcMethodExtractor } from "./common/middleware/rpcServerMiddleware";
import routes from "./routes";
import config from "./config";
import { newWalletManager } from "./services/walletManager/singleton";

const app = express();
const port = 3000;

// Set the base URL for the API
app.set("base", config.BASE_URL);

// Middleware
app.use(express.json());
app.use(jsonRpcMethodExtractor);
app.use(morgan("common"));

// Routes
app.use(routes);

async function startServer() {
  try {
    const walletManager = newWalletManager();
    await walletManager.loadWallets();

    app.listen(port, () => {
      console.log(
        `Server running at http://localhost:${port}${app.get("base")}`
      );
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `An error occurred while starting the server: ${error.message}`
      );
    } else {
      console.error("An error occurred while starting the server");
      console.error(error);
    }
    process.exit(1);
  }
}

startServer();
