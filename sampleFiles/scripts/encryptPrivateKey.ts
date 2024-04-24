import fs from "fs";
import crypto from "crypto";

function generateIV(): Buffer {
  return crypto.randomBytes(16);
}

function generateSalt(): Buffer {
  return crypto.randomBytes(16);
}

function encryptPrivateKey(
  privateKey: string,
  password: string
): { encryptedData: string; iv: string; salt: string } {
  const salt = generateSalt();
  const iv = generateIV();

  const key = crypto.scryptSync(password, salt, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
  };
}

function saveEncryptedData(
  encryptedData: string,
  iv: string,
  salt: string,
  outputPath: string
): void {
  const dataToSave = {
    encryptedData,
    iv,
    salt,
  };

  fs.writeFileSync(outputPath, JSON.stringify(dataToSave), "utf8");
}

const privateKey = "";
const password = "biconomyTeam";
const outputPath = "sampleFiles/testPrivateKeys/encryptedPrivateKey.json";

const encryptedData = encryptPrivateKey(privateKey, password);
saveEncryptedData(
  encryptedData.encryptedData,
  encryptedData.iv,
  encryptedData.salt,
  outputPath
);

console.log(`Private key encrypted and saved to ${outputPath}`);
