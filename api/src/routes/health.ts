/**
 * Health probe (Presentation layer — thin). Confirms the process is up. Does
 * NOT report database status yet; DB wiring is a later step.
 */
import { Router } from "express";
import { sendOk } from "../lib/http.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  sendOk(res, { status: "ok", service: "micro-lms-api" });
});
