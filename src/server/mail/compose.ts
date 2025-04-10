import MailComposer from "nodemailer/lib/mail-composer";
import { type SendMailOptions } from "nodemailer";
import { fromByteArray } from "base64-js";

export function composeMail(options: SendMailOptions): Promise<string> {
  const mailComposer = new MailComposer(options);
  return new Promise((resolve, reject) => {
    mailComposer.compile().build((err, message) => {
      if (err) return reject(err);
      // Convert Buffer to base64url-encoded string
      resolve(fromByteArray(message));
    });
  });
}
