import crypto from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] || crypto.randomUUID();

  res.setHeader("X-Request-ID", req.requestId);

  next();
};