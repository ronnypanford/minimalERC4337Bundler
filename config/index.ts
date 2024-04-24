import dotenv from "dotenv";
import { Hex } from "viem";
import { sepolia } from "viem/chains";
import { ensureHexPrefix } from "../common/helpers";

dotenv.config();

const config = {
  BASE_URL: `/api/v2/11155111/${process.env.API_KEY || "testAPIKey"}`,
  API_KEY: process.env.API_KEY || "testAPIKey",
  CHAIN_ID: "11155111", // can be set by the environment variable CHAIN_ID later, however for the scope of this assignment, it is set to the default value sepolia
  CHAIN: sepolia, // settable based on the CHAIN_ID, can viems extractChain in its utils to get the chain based on the CHAIN_ID
  BICONOMY_BUNDLER_URL:
    "https://bundler.biconomy.io/api/v2/11155111/A5CBjLqSc.0dcbc53e-anPe-44c7-b22d-21071345f76a", // set specifically for this task, just to forward some responses, not need in real implementation
  ENTRYPOINT_CONTRACT_ADDRESS: ensureHexPrefix(
    process.env.ENTRYPOINT_CONTRACT_ADDRESS ||
      "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789"
  ) as Hex,
  PRIVATE_KEY_PATHS: process.env.PRIVATE_KEY_PATHS?.split(",") || [],
  TX_WAIT: process.env.TX_WAIT
    ? process.env.TX_WAIT.toLowerCase() === "true"
    : true,
};

export default config;
