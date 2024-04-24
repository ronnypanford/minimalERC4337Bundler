import fs from "fs";
import crypto from "crypto";

function decrypt(
  encryptedData: string,
  password: string,
  iv: string,
  salt: string
): string {
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), 32);
  const ivBuffer = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBuffer);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function decryptPrivateKey(
  encryptedPrivateKeyPath: string,
  password: string
): string | null {
  try {
    const encryptedDataFile = fs.readFileSync(encryptedPrivateKeyPath, "utf8");
    const { encryptedData, iv, salt } = JSON.parse(encryptedDataFile);
    const decryptedPrivateKey = decrypt(encryptedData, password, iv, salt);
    return decryptedPrivateKey;
  } catch (error) {
    if (error instanceof Error) {
      // console.error(`Error decrypting private key: ${error.message}`);
    } else {
      // console.error(`Error decrypting private key: ${error}`);
    }
    return null; // Return null if decryption fails
  }
}

export function decryptPrivateKeys(
  encryptedPrivateKeyPaths: string[],
  password: string
): { successfulDecryptions: string[]; unsuccessfulDecryptions: number } {
  const successfulDecryptions: string[] = [];
  let unsuccessfulDecryptions = 0;

  for (const encryptedPrivateKeyPath of encryptedPrivateKeyPaths) {
    const decryptedPrivateKey = decryptPrivateKey(
      encryptedPrivateKeyPath,
      password
    );
    if (decryptedPrivateKey) {
      successfulDecryptions.push(decryptedPrivateKey);
    } else {
      unsuccessfulDecryptions++;
    }
  }

  return { successfulDecryptions, unsuccessfulDecryptions };
}
