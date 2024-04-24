import { createInterface } from "readline";
import {
  createWalletClient,
  createPublicClient,
  http,
  PrivateKeyAccount,
  WalletClient,
  PublicClient,
  TransactionExecutionError,
  TransactionReceiptNotFoundError,
  Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import config from "../../config";
import { decryptPrivateKeys } from "../pkManager";
import { Mutex } from "async-mutex";
import { ensureHexPrefix } from "../../common/helpers";

const ac = new AbortController();

class WalletManager {
  private publicClient: PublicClient;
  private wallets: { account: PrivateKeyAccount; client: WalletClient }[] = [];
  private walletBalances: { [address: string]: BigInt } = {};
  private unlocked: boolean = false;
  private mutex = new Mutex();

  constructor() {
    setTimeout(() => {
      if (!this.unlocked) {
        console.error(
          "\nWallet Manager set up but not unlocked in time. Exiting..."
        );
        process.exit(1);
      }
    }, 100000);

    process.on("SIGINT", () => {
      console.log("\nExiting...");
      ac.abort();
      process.exit(0);
    });

    this.publicClient = createPublicClient({
      chain: config.CHAIN,
      transport: http(),
    });
  }

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.mutex.acquire();
    try {
      return await fn();
    } catch (error) {
      throw error;
    } finally {
      release();
    }
  }

  private promptForPassword(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Manually write the question to the output stream
      process.stdout.write(
        "In order to load the wallets, please enter the security password. This password is used to decrypt the private keys on boot-up, and is not stored anywhere.\n"
      );
      process.stdout.write("Enter the security password: ");

      const rl = createInterface({
        input: process.stdin,
      });

      rl.question("", (password) => {
        rl.close();
        resolve(password);
      });

      rl.on("SIGINT", () => {
        rl.close();
        reject(new Error("Interrupted"));
      });
    });
  }

  private createClient(account: PrivateKeyAccount): WalletClient {
    const walletClient = createWalletClient({
      account,
      chain: config.CHAIN,
      transport: http(),
    });
    console.log("Loaded node wallet:", account.address);
    return walletClient;
  }

  getWalletCount() {
    return this.wallets.length;
  }

  async loadWallets() {
    return this.withLock(async () => {
      let password = await this.promptForPassword();
      const privateKeyPaths = config.PRIVATE_KEY_PATHS;

      if (privateKeyPaths.length === 0) {
        console.log("No private keys found.");
        return;
      }

      const { successfulDecryptions, unsuccessfulDecryptions } =
        decryptPrivateKeys(privateKeyPaths, password);
      if (successfulDecryptions.length > 0) {
        console.log(
          `\nSuccessfully decrypted ${successfulDecryptions.length} private keys.\n`
        );
      }
      if (unsuccessfulDecryptions > 0) {
        console.log(
          `Failed to decrypt ${unsuccessfulDecryptions} private keys.`
        );
      }

      for (const privateKey of successfulDecryptions) {
        try {
          const account = privateKeyToAccount(
            ensureHexPrefix(privateKey) as Hex
          );
          const client = this.createClient(account);
          this.wallets.push({ account, client });
        } catch (error) {
          console.error("Error creating wallet client");
          continue;
        }
      }

      if (this.wallets.length < 2) {
        throw new Error("At least 2 wallets are required to run the node.");
      }

      console.log(
        `\nSuccessfully loaded ${this.wallets.length} node wallets.\n`
      );
      password = "";
      this.unlocked = true;
      this.reorganizeWallets();
    });
  }

  getWalletAddress(index: number) {
    return this.withLock(async () => {
      if (index < 0 || index >= this.wallets.length) {
        index = this.wallets.length - 1;
      }
      return this.wallets[index].account.address;
    });
  }

  private async reorganizeWallets() {
    return this.withLock(async () => {
      const balancePromises = this.wallets.map((wallet) =>
        this.publicClient
          .getBalance({
            address: wallet.account.address,
          })
          .then((balance) => {
            this.walletBalances[wallet.account.address] = balance;
          })
      );
      await Promise.all(balancePromises);

      // Sort wallets based on their balance values using the walletBalances dictionary
      this.wallets.sort((a, b) => {
        return Number(
          BigInt(this.walletBalances[b.account.address].toString()) -
            BigInt(this.walletBalances[a.account.address].toString())
        );
      });
    });
  }

  private async monitorTransaction(
    hash: string,
    wallet: any,
    maxRetries: number = 5,
    initialDelay: number = 1000
  ): Promise<boolean> {
    let retries = 0;
    let delay = initialDelay;

    console.log(
      `Monitoring transaction ${hash} sent from wallet ${wallet.account.address}...`
    );

    while (retries < maxRetries) {
      try {
        const receipt = await this.publicClient.getTransactionReceipt({
          hash: ensureHexPrefix(hash) as Hex,
        });

        if (receipt && receipt.status === "success") {
          console.log(`Transaction ${hash} was successful.`);
          this.reorganizeWallets();
          return true;
        } else {
          console.log(`Transaction ${hash} failed.`);
          this.reorganizeWallets();
          return false;
        }
      } catch (error) {
        if (error instanceof TransactionReceiptNotFoundError) {
          retries++;

          delay = delay * 2;

          // console.log(
          //   `Retrying transaction ${hash} monitoring in ${
          //     delay / 1000
          //   } seconds...`
          // );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`Error monitoring transaction ${hash}`);
          return false;
        }
      }
    }

    throw new Error(
      `Failed to monitor transaction ${hash} after ${maxRetries} attempts.`
    );
  }

  async redundancySendTransaction(
    params: any,
    numberOfWallets: number = 2,
    wait: boolean = false,
    maxRetries: number = 3, // Maximum number of retries for each wallet
    initialDelay: number = 1000 // Initial delay before retrying
  ) {
    let firstError: Error | null = null;
    let resultSuccess: boolean = false;
    let resultsMutex = new Mutex();

    if (!this.unlocked) {
      throw new Error("Wallet Manager is not unlocked.");
    }

    if (this.wallets.length === 0) {
      throw new Error("No wallets loaded.");
    }

    const executeWithWallets = await this.withLock(async () => {
      return this.wallets.slice(
        0,
        Math.min(numberOfWallets, this.wallets.length)
      );
    });

    const promises = executeWithWallets.map(async (wallet) => {
      let retries: number = 0;
      let delay: number = initialDelay;
      let success: boolean = false;
      let hash: string = "";
      let mutexAcquired: boolean = false;

      while (retries < maxRetries) {
        try {
          await resultsMutex.acquire();
          mutexAcquired = true;
          if (resultSuccess) {
            // If we already have a successful result we dont need to retry
            return { error: null, success: false };
          }
          resultsMutex.release();
          mutexAcquired = false;
          console.log(
            `Sending UserOperation transaction with wallet ${wallet.account.address}...`
          );
          hash = await wallet.client.sendTransaction(params);
          if (!wait) {
            await resultsMutex.acquire();
            mutexAcquired = true;
            success = true;
            resultSuccess = true;
            break; // not waiting for transaction confirmation
          }
          success = await this.monitorTransaction(hash, wallet);
          if (success) {
            await resultsMutex.acquire();
            mutexAcquired = true;
            resultSuccess = true;
            break; // transaction is successful
          }
        } catch (error) {
          await resultsMutex.acquire();
          mutexAcquired = true;
          if (resultSuccess) {
            // If we already have a successful result we dont need to retry
            return { error, success: false };
          } else if (!firstError) {
            try {
              firstError = error as Error;
            } catch (e) {
              if (hash != "" && !success) {
                firstError = new Error(
                  "Error waiting for transaction confirmation"
                );
              } else if (hash === "") {
                firstError = new Error("Error sending transaction");
              } else {
                firstError = new Error(
                  "Error sending and waiting for transaction confirmation"
                );
              }
            }
          }

          if (error instanceof TransactionExecutionError) {
            let baseError = error.cause;
            // console.error(`Error sending transaction:`, baseError.shortMessage);
          } else {
            // console.error(`Error sending transaction`);
          }
          retries++;
          if (retries >= maxRetries) {
            return { error, success: false };
          }
          console.log(`Retrying transaction in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } finally {
          if (mutexAcquired) {
            resultsMutex.release();
            mutexAcquired = false;
          }
        }
      }

      if (mutexAcquired) {
        resultsMutex.release();
        mutexAcquired = false;
      }

      return { result: hash, success };
    });

    let successfullHash: string = "";
    await Promise.allSettled(promises).then((results) => {
      for (let result of results) {
        if (result.status === "fulfilled") {
          if (result.value.success && result.value.result !== undefined) {
            if (!wait) {
              this.reorganizeWallets();
            }

            successfullHash = result.value.result;
            break;
          } else {
            // console.error(`Error sending transaction:`, result.value.error);
          }
        } else {
          // console.error(`Error sending transaction:`, result.reason);
        }
      }
    });

    if (successfullHash !== "") {
      console.log(
        `Transaction ${successfullHash} executed the UserOperation successfully.`
      );
      return successfullHash;
    }

    throw firstError || new Error("All transaction attempts failed.");
  }
}

export default WalletManager;
