import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/task_routes";
import healthRoute from "./routes/test_route";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

// CORS initialization
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Health route
app.use("/app", healthRoute);

// Task routes
app.use("/task", taskRoutes);

app.listen(PORT, () => console.log(`SERVER RUN ON PORT ${PORT}`));

export default app;
