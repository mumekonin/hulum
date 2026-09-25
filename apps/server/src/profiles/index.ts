import { Router } from "express";
import { ok, type ProfileDocument } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import { isUuid } from "../http/ids.js";
import { assertRequestSession } from "../security/session.js";
import {
  createPgDocumentStore,
  parseDocumentUpload,
  type DocumentStore,
} from "./documents.js";
import { createProfileService, type ProfileService } from "./service.js";
import { createPgProfileStore } from "./store.js";
import { parseCreateProfileRequest, parsePatchProfileRequest } from "./validate.js";

function defaultService(): ProfileService {
  return createProfileService(createPgProfileStore());
}

export function createProfileRouter(service?: ProfileService, documents?: DocumentStore): Router {
  const router = Router();
  const getService = (): ProfileService => service ?? defaultService();
  const getDocuments = (): DocumentStore => documents ?? createPgDocumentStore();

  function requireUserId(value: string | undefined): string {
    if (value === undefined || !isUuid(value)) {
      throw new HttpError(400, "INVALID_ID", "User id must be a UUID.");
    }
    return value;
  }

  function requireDocumentId(value: string | undefined): string {
    if (value === undefined || !isUuid(value)) {
      throw new HttpError(400, "INVALID_ID", "Document id must be a UUID.");
    }
    return value;
  }

  router.post("/", async (req, res, next) => {
    try {
      const input = parseCreateProfileRequest(req.body);
      const view = await getService().create(input);
      res.status(201).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:userId/documents", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      assertRequestSession(req, userId);
      const items = await getDocuments().list(userId);
      res.status(200).json(ok(items));
    } catch (error) {
      next(error);
    }
  });

  router.post("/:userId/documents", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      assertRequestSession(req, userId);
      const input = parseDocumentUpload(req.body);
      const created: ProfileDocument = await getDocuments().create({ userId, ...input });
      res.status(201).json(ok(created));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:userId/documents/:documentId", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      const documentId = requireDocumentId(req.params.documentId);
      assertRequestSession(req, userId);
      const file = await getDocuments().getFile(userId, documentId);
      if (file === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Document not found.");
      }
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Type", file.mimeType);
      res.status(200).send(file.bytes);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:userId/documents/:documentId", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      const documentId = requireDocumentId(req.params.documentId);
      assertRequestSession(req, userId);
      const removed = await getDocuments().remove(userId, documentId);
      if (!removed) {
        throw new HttpError(404, "NOT_FOUND", "Document not found.");
      }
      res.status(200).json(ok({ deleted: true }));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:userId", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      assertRequestSession(req, userId);
      const view = await getService().getByUserId(userId);
      if (view === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      res.status(200).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:userId", async (req, res, next) => {
    try {
      const userId = requireUserId(req.params.userId);
      assertRequestSession(req, userId);
      const patch = parsePatchProfileRequest(req.body);
      const view = await getService().update(userId, patch);
      if (view === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Profile not found.");
      }
      res.status(200).json(ok(view));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const profileRouter = createProfileRouter();
