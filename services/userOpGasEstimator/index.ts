import axios from "axios";
import config from "../../config";

// This implementation is ignored for the scope of the
// coding assignent. It is a placeholder for internal implementation, for now
// all requests would be forwarded to the biconomy bundler

export async function estimateUserOpGas(
  reqBody: any)
    : Promise<any> {
  try {
    const response = await axios.post(config.BICONOMY_BUNDLER_URL, reqBody);
    return response.data;
  }
  catch (error) {
    throw error;
  }
}