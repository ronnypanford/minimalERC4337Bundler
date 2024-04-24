import { EntryPointABI } from "../../common/constants/entryPointABI";
import { Hex, encodeFunctionData } from "viem";
import config from "../../config";
import { getWalletManagerInstance } from "../walletManager/singleton";
import WalletManager from "../walletManager";

export async function sendUserOperation(userOp: any) {
  try {
    const walletManager: WalletManager = getWalletManagerInstance();
    const entryPointContractAddress: Hex = config.ENTRYPOINT_CONTRACT_ADDRESS;

    // Using the likely least funded wallet as the beneficiary
    // help distribute the node funds automatically as well, for any returned funds
    const beneficiary = await walletManager.getWalletAddress(-1);

    const data = encodeFunctionData({
      abi: EntryPointABI,
      functionName: "handleOps",
      args: [[userOp], beneficiary],
    });

    const hash = await walletManager.redundancySendTransaction(
      {
        to: entryPointContractAddress,
        data: data,
      },
      2,
      config.TX_WAIT
    );

    return { result: hash };
  } catch (error) {
    throw new Error("An error occurred while sending the UserOperation");
  }
}
