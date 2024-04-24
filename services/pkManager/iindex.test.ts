import { decryptPrivateKeys } from ".";
import fs from "fs";
import crypto from "crypto";

// Mocking external dependencies
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("crypto", () => ({
  scryptSync: jest.fn(),
  createDecipheriv: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(""),
    final: jest.fn().mockReturnValue("decryptedData"),
  }),
}));

describe("decryptPrivateKeys", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should decrypt private keys successfully", () => {
    // Mocking the file read operation to return a predefined encrypted data
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({
        encryptedData: "encryptedData",
        iv: "iv",
        salt: "salt",
      })
    );

    // Mocking the crypto operations to return a predefined decrypted data
    (crypto.scryptSync as jest.Mock).mockReturnValue(Buffer.from("key"));

    const result = decryptPrivateKeys(
      ["path/to/encryptedPrivateKey"],
      "password"
    );

    expect(result).toEqual({
      successfulDecryptions: ["decryptedData"],
      unsuccessfulDecryptions: 0,
    });

    expect(fs.readFileSync).toHaveBeenCalledWith(
      "path/to/encryptedPrivateKey",
      "utf8"
    );
    expect(crypto.scryptSync).toHaveBeenCalledWith(
      "password",
      Buffer.from("salt", "hex"),
      32
    );
  });

  it("should handle decryption failure", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    const result = decryptPrivateKeys(
      ["path/to/encryptedPrivateKey"],
      "password"
    );

    expect(result).toEqual({
      successfulDecryptions: [],
      unsuccessfulDecryptions: 1,
    });

    expect(fs.readFileSync).toHaveBeenCalledWith(
      "path/to/encryptedPrivateKey",
      "utf8"
    );
  });
});
