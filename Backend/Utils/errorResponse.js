export const errorResponse = (
  res,
  status,
  code,
  message,
  requestId,
  fields = {}
) => {
  return res.status(status).json({
    code,
    message,
    requestId,
    fields,
  });
};
