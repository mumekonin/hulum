import type { Response } from "express";
import type { ApiResponse } from "@hulum/shared";

export function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiResponse<T> = { data, error: null };
  res.status(status).json(body);
}

export function fail(res: Response, message: string, status = 400, code?: string) {
  const body: ApiResponse<null> = { data: null, error: { message, code } };
  res.status(status).json(body);
}
