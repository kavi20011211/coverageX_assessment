import pool from "../services/database_service";
import { Request, Response } from "express";

// POST: create a task
export const createATask = async (req: Request, res: Response) => {
  try {
    const { topic, description } = req.body;
    if (!topic || !description) {
      return res.status(400).json({ error: "Required fields cannot be empty" });
    }

    const values = [topic, description];
    const query =
      "INSERT INTO assignment_todo_app_db.task (topic,description) VALUES(?,?)";

    const [result] = await pool.query(query, values);
    return res.status(201).json({ success: "Task added successfully" });
  } catch (error: any) {
    console.log("error: error occured in create a task controller");
    return res.status(500).json({ error: `Server error ${error}` });
  }
};

// GET: fetch all the tasks
export const fetchAllTasks = async (req: Request, res: Response) => {
  try {
    const query =
      "SELECT * FROM assignment_todo_app_db.task ORDER BY task_id DESC";
    const [rows] = await pool.query(query);
    if (!rows) {
      return res.status(200).json([]);
    }
    return res.status(200).json(rows);
  } catch (error: any) {
    console.log("error: error occured in fetch all tasks controller");

    if (error.code) {
      return res.status(500).json({
        error: "Database error",
        code: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({ error: `Server error ${error}` });
  }
};

// PUT: update a task
export const updateATask = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;
    const { topic, description } = req.body;
    if (!task_id) {
      return res.status(400).json({ error: "Task ID  cannot be empty" });
    }

    if (!topic || !description) {
      return res
        .status(400)
        .json({ error: "Topic and description cannot be empty" });
    }

    const values = [topic, description, task_id];
    const query =
      "UPDATE assignment_todo_app_db.task SET topic = ?, description = ? WHERE task_id = ?";

    const [result]: any = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      message: "Task updated successfully",
    });
  } catch (error: any) {
    console.log("error: error occured in update a tasks controller");
    if (error.code) {
      return res.status(500).json({
        error: "Database error",
        code: error.code,
        message: error.message,
      });
    }
    return res.status(500).json({ error: `Server error ${error}` });
  }
};

// DELETE: delete a task
export const deleteATask = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.params;

    if (!task_id) {
      return res.status(400).json({ error: "Task ID cannot be empty" });
    }

    const query = "DELETE FROM assignment_todo_app_db.task WHERE task_id = ?";
    const [result]: any = await pool.query(query, [task_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
      taskId: task_id,
    });
  } catch (error: any) {
    console.error("Error occurred in deleteATask controller:", error);

    if (error.code) {
      return res.status(500).json({
        error: "Database error",
        code: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
