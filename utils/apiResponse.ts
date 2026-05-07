export const successResponse = (
  data: any,
  message = "Success"
) => {
  return Response.json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  message = "Something went wrong",
  status = 500
) => {
  return Response.json(
    {
      success: false,
      message,
    },
    {
      status,
    }
  );
};