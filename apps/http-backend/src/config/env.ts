import dotenv from "dotenv";

const alreadyConfigured = Boolean(process.env.__HTTP_BACKEND_ENV_LOADED__);

if (!alreadyConfigured) {
  dotenv.config();
  process.env.__HTTP_BACKEND_ENV_LOADED__ = "true";
}
