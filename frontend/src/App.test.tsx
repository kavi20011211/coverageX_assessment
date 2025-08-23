import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi, beforeEach, afterEach, describe } from "vitest";
import TodoApp from "./App";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Sample test data to test
const mockTasks = [
  {
    task_id: 1,
    topic: "Complete project",
    description: "Finish the React todo application with tests",
    created_at: "2024-01-01T10:00:00Z",
  },
  {
    task_id: 2,
    topic: "Review code",
    description: "Conduct code review for the team",
    created_at: "2024-01-01T11:00:00Z",
  },
];

describe("TodoApp", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders main header and task count", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<TodoApp />);

    // Check main header
    expect(screen.getByText("Task Manager Pro")).toBeInTheDocument();
    expect(
      screen.getByText("Streamline your workflow, boost your productivity")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument(); // Task count
    });

    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
  });

  test("displays loading state while fetching tasks", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<TodoApp />);

    // Should show loading spinner
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("displays empty state when no tasks exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("All caught up!")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Create your first task to get started on your productivity journey."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  test("displays task cards when tasks exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(
        screen.getByText("Finish the React todo application with tests")
      ).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(
        screen.getByText("Conduct code review for the team")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("ID: 1")).toBeInTheDocument();
    expect(screen.getByText("ID: 2")).toBeInTheDocument();
  });

  test("opens create task modal when create button is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument();
    });

    // Click the create button
    fireEvent.click(screen.getByText("Create New Task"));

    await waitFor(() => {
      expect(
        screen.getByText("Create New Task", { selector: "h2" })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter task topic")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter task description")
      ).toBeInTheDocument();
    });
  });

  test("can fill out and submit create task form", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<TodoApp />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create New Task"));
    });

    const topicInput = screen.getByPlaceholderText("Enter task topic");
    const descriptionInput = screen.getByPlaceholderText(
      "Enter task description"
    );

    fireEvent.change(topicInput, { target: { value: "New Task" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Task description" },
    });

    // Mock create task API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Mock refetch tasks after creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          task_id: 3,
          topic: "New Task",
          description: "Task description",
        },
      ],
    });

    // Submit form
    fireEvent.click(screen.getByText("Create Task"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5000/task/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "New Task",
            description: "Task description",
          }),
        }
      );
    });
  });

  test("shows validation error when submitting empty form", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<TodoApp />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create New Task"));
    });

    // Try to submit without filling form
    fireEvent.click(screen.getByText("Create Task"));

    await waitFor(() => {
      expect(
        screen.getByText("Topic and description are required")
      ).toBeInTheDocument();
    });
  });

  test("can open edit modal for existing task", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByTitle("Edit task");
    fireEvent.click(editButtons[0]);

    // Should open popup with existing data
    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Complete project")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Finish the React todo application with tests")
      ).toBeInTheDocument();
    });
  });

  test("can delete a task", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Complete project")).toBeInTheDocument();
    });

    // Mock delete API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    // Mock refetch after delete
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTasks[1]],
    });

    // Click delete button
    const deleteButtons = screen.getAllByTitle("Delete task");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5000/task/1/delete",
        {
          method: "DELETE",
        }
      );
    });
  });

  test("handles API errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load tasks")).toBeInTheDocument();
    });
  });

  test("can close modal without saving", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<TodoApp />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create New Task"));
    });

    fireEvent.change(screen.getByPlaceholderText("Enter task topic"), {
      target: { value: "Test" },
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(
        screen.queryByText("Create New Task", { selector: "h2" })
      ).not.toBeInTheDocument();
    });

    // Reopen modal and check form is empty
    fireEvent.click(screen.getByText("Create New Task"));
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter task topic")).toHaveValue("");
    });
  });

  test("updates task count correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(
        screen.getByText("You have 2 tasks to manage")
      ).toBeInTheDocument();
    });
  });

  test("shows correct message for single task", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTasks[0]],
    });

    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("You have 1 task to manage")).toBeInTheDocument();
    });
  });
});
