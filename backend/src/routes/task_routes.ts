import express from "express";
import {
  createATask,
  deleteATask,
  fetchAllTasks,
  updateATask,
} from "../controllers/task_controller";
const router = express.Router();

router.post("/create", createATask);
router.get("/get-all", fetchAllTasks);
router.put("/:task_id/update", updateATask);
router.delete("/:task_id/delete", deleteATask);

export default router;
