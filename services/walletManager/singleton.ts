import WalletManager from ".";

let instance: WalletManager; 

export function newWalletManager() {
   if (!instance) {
      instance = new WalletManager();
   }
   return instance;
  }

export function getWalletManagerInstance() {
 if (!instance) {
   throw new Error("Wallet Manager instance not set");
 }
 return instance;
}
