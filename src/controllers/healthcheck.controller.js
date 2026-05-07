import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const healthCheckController = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is healthy" }, "OK"));
});

export { healthCheckController };
