import { google } from "googleapis";
import { env } from "@/env";

const oauth2Client = new google.auth.OAuth2(
  env.AUTH_GOOGLE_ID,
  env.AUTH_GOOGLE_SECRET,
  env.AUTH_GOOGLE_CALLBACK_URL,
);

export default oauth2Client;
