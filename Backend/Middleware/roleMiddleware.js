export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
        requestId: req.requestId,
        fields: {},
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
        requestId: req.requestId,
        fields: {},
      });
    }

    next();
  };
};
