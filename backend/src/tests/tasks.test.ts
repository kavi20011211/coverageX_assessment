import request from "supertest";
import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import app from "..";

type MockQueryResult =
  | { insertId: number }
  | { affectedRows: number }
  | { task_id: number; topic: string; description: string }
  | []
  | MockQueryResult[];

interface DBError extends Error {
  code?: string;
}

const mockQuery = jest.fn<(...args: any[]) => Promise<MockQueryResult[]>>();

jest.mock("../services/database_service", () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn(),
    },
    connectDatabase: jest.fn(),
  };
});

// Get the mocked database service to assign our mockQuery
const mockedDb = jest.mocked(require("../services/database_service").default);
mockedDb.query = mockQuery;

describe("Task Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /task/create - Create a Task", () => {
    test("should create a task successfully with valid data", async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const taskData = {
        topic: "Test Task",
        description: "This is a test task description",
      };

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(201);

      expect(response.body).toEqual({ success: "Task added successfully" });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO assignment_todo_app_db.task (topic,description) VALUES(?,?)",
        ["Test Task", "This is a test task description"]
      );
    });

    test("should return 400 when topic is missing", async () => {
      const taskData = {
        description: "This is a test task description",
      };

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Required fields cannot be empty",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test("should return 400 when description is missing", async () => {
      const taskData = {
        topic: "Test Task",
      };

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Required fields cannot be empty",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test("should return 400 when both topic and description are missing", async () => {
      const response = await request(app)
        .post("/task/create")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: "Required fields cannot be empty",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test("should return 500 when database error occurs", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database connection failed"));

      const taskData = {
        topic: "Test Task",
        description: "This is a test task description",
      };

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(500);

      expect(response.body.error).toContain("Server error");
    });
  });

  describe("GET /task/get-all - Fetch All Tasks", () => {
    test("should fetch all tasks successfully", async () => {
      const mockTasks = [
        { task_id: 1, topic: "Task 1", description: "Description 1" },
        { task_id: 2, topic: "Task 2", description: "Description 2" },
      ];

      mockQuery.mockResolvedValueOnce([mockTasks]);

      const response = await request(app).get("/task/get-all").expect(200);

      expect(response.body).toEqual(mockTasks);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM assignment_todo_app_db.task ORDER BY task_id DESC"
      );
    });

    test("should return empty array when no tasks exist", async () => {
      mockQuery.mockResolvedValueOnce([[]]);

      const response = await request(app).get("/task/get-all").expect(200);

      expect(response.body).toEqual([]);
    });

    test("should return 500 when database error occurs", async () => {
      const dbError: DBError = new Error("Database connection failed");
      dbError.code = "ECONNREFUSED";
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await request(app).get("/task/get-all").expect(500);

      expect(response.body).toEqual({
        error: "Database error",
        code: "ECONNREFUSED",
        message: "Database connection failed",
      });
    });
  });

  describe("PUT /task/:task_id/update - Update a Task", () => {
    test("should update a task successfully", async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const updateData = {
        topic: "Updated Task",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/task/123/update")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({ message: "Task updated successfully" });
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE assignment_todo_app_db.task SET topic = ?, description = ? WHERE task_id = ?",
        ["Updated Task", "Updated description", "123"]
      );
    });

    test("should return 400 when topic is missing", async () => {
      const updateData = { description: "Updated description" };

      const response = await request(app)
        .put("/task/123/update")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Topic and description cannot be empty",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test("should return 400 when description is missing", async () => {
      const updateData = { topic: "Updated Task" };

      const response = await request(app)
        .put("/task/123/update")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Topic and description cannot be empty",
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test("should return 404 when task is not found", async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const updateData = {
        topic: "Updated Task",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/task/999/update")
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({ error: "Task not found" });
    });

    test("should return 500 when database error occurs", async () => {
      const dbError: DBError = new Error("Database connection failed");
      dbError.code = "ECONNREFUSED";
      mockQuery.mockRejectedValueOnce(dbError);

      const updateData = {
        topic: "Updated Task",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/task/123/update")
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        error: "Database error",
        code: "ECONNREFUSED",
        message: "Database connection failed",
      });
    });
  });

  describe("DELETE /task/:task_id/delete - Delete a Task", () => {
    test("should delete a task successfully", async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete("/task/123/delete")
        .expect(200);

      expect(response.body).toEqual({
        message: "Task deleted successfully",
        taskId: "123",
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM assignment_todo_app_db.task WHERE task_id = ?",
        ["123"]
      );
    });

    test("should return 404 when task is not found", async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const response = await request(app)
        .delete("/task/999/delete")
        .expect(404);

      expect(response.body).toEqual({ error: "Task not found" });
    });

    test("should return 500 when database error occurs", async () => {
      const dbError: DBError = new Error("Database connection failed");
      dbError.code = "ECONNREFUSED";
      mockQuery.mockRejectedValueOnce(dbError);

      const response = await request(app)
        .delete("/task/123/delete")
        .expect(500);

      expect(response.body).toEqual({
        error: "Database error",
        code: "ECONNREFUSED",
        message: "Database connection failed",
      });
    });

    test("should return 500 when non-database error occurs", async () => {
      const generalError = new Error("Some other error");
      mockQuery.mockRejectedValueOnce(generalError);

      const response = await request(app)
        .delete("/task/123/delete")
        .expect(500);

      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty strings in create task", async () => {
      const taskData = { topic: "", description: "" };

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Required fields cannot be empty",
      });
    });

    test("should handle empty strings in update task", async () => {
      const updateData = { topic: "", description: "" };

      const response = await request(app)
        .put("/task/123/update")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({
        error: "Topic and description cannot be empty",
      });
    });

    test("should handle whitespace-only strings in create task", async () => {
      const taskData = { topic: "   ", description: "   " };

      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request(app)
        .post("/task/create")
        .send(taskData)
        .expect(201);

      expect(response.body).toEqual({ success: "Task added successfully" });
    });
  });
});
