export class StandardError extends Error {
  public readonly name = "StandardError";

  constructor(
    public readonly statusCode: number,
    public readonly options: {
      code: string,
      message: string,
      metadata?: object,
    }
  ) {
    super(options.message);
  }
}

export interface StandardErrorResponseBody {
  error: {
    id?: string;
    /**
     * Developer readable code of error, such as "NOT_FOUND", "WRONG_PASSWORD" ...etc
     */
    code: string;
    /**
     * Developer readable metadata.
     */
    metadata?: object;
    /**
     * Human readable Error message, such as "You're not allowed to do this"
     */
    message: string;
  };
}

import * as crypto from "crypto";

export class ErrorResponseFormatter {
  private static readonly CipherAlgorithm = "aes-128-cbc";
  private static readonly SEPARATOR = "$";

  // If Password is provided, it will show detailed information (encrypted)
  constructor(private password: string | undefined) {}

  public format(error: Error) {
    if (error instanceof StandardError) {
      return {
        code: error.options.code,
        message: error.options.message,
        metadata: error.options.metadata,
      };
    } else {
      // For Non-Standard error,
      return {
        code: error.name,
        message: error.message,
        metadata: this.encryptErrorMetadata(error),
      };
    }
  }

  public encryptErrorMetadata(error: Error) {
    if (this.password) {
      // For both CBC mode and CFB mode, the initialization vector is the size of a block
      // So, AES-128-CBC requires 128bit IV block, which equals to 16 bytes.
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ErrorResponseFormatter.CipherAlgorithm, this.password, iv);

      const data = Buffer.from(
        JSON.stringify({
          name: error.name,
          message: error.message,
          stack: (error.stack || "").split("\n"),
        }),
        "utf8"
      );

      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final(),
      ]);

      return [encrypted, iv].map((buf) => buf.toString("hex")).join(ErrorResponseFormatter.SEPARATOR);
    } else {
      // Otherwise don't show metadata for security
      return undefined;
    }
  }

  public decryptErrorMetadata(message: string) {
    if (this.password) {
      const [encrypted, iv] = message.split(ErrorResponseFormatter.SEPARATOR).map((hex) => Buffer.from(hex, "hex"));
      const decipher = crypto.createDecipheriv(ErrorResponseFormatter.CipherAlgorithm, this.password, iv);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return JSON.parse(decrypted.toString("utf8"));
    }
  }
}
