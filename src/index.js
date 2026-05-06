import "dotenv/config";
import logger from "./utils/logger.js";
import connectDB from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// console.log(process.env.MONGO_URI)
connectDB()
  .then(() => {
    logger.info("MongoDB connected");

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Mongo connection error", error);
    process.exit(1);
  });

logger.info("Hello world");
