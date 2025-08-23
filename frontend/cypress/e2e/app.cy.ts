/// <reference types="cypress" />

interface Task {
  task_id: number;
  topic: string;
  description: string;
  created_at?: string;
}

describe("React App", () => {
  beforeEach(() => {
    cy.setupTaskInterceptors();
  });

  it("should load homepage", () => {
    cy.visit("/");
    cy.contains("Task Manager Pro");
    cy.contains("Streamline your workflow, boost your productivity");
    cy.get('[data-cy="create-task-btn"]').should("be.visible");
  });

  it("should display initial state correctly", () => {
    cy.visit("/");
    cy.waitForTasks();
    cy.contains("Active Tasks");
    cy.contains("No tasks yet - time to get organized!").should("be.visible");
    cy.get('[data-cy="empty-state"]').should("be.visible");
  });
});

describe("Application WorkFlow", () => {
  beforeEach(() => {
    // Setup empty task list initially
    cy.setupTaskInterceptors([]);
    cy.visit("/");
    cy.waitForTasks();
  });

  it("should create a new task", () => {
    const newTask: Task = {
      task_id: 1,
      topic: "Complete Cypress Tests",
      description:
        "Write comprehensive end-to-end tests for the task manager application",
      created_at: new Date().toISOString(),
    };

    // Mock successful task creation and return updated tasks list
    const apiBaseUrl = Cypress.env("apiBaseUrl") || "http://localhost:5000";
    cy.intercept("POST", `${apiBaseUrl}/task/create`, {
      statusCode: 201,
      body: { success: true, task: newTask },
    }).as("createTaskSuccess");

    cy.intercept("GET", `${apiBaseUrl}/task/get-all`, {
      statusCode: 200,
      body: [newTask],
    }).as("getTasksAfterCreate");

    cy.createTask(newTask.topic, newTask.description);

    // Verify API calls
    cy.wait("@createTaskSuccess").then((interception) => {
      expect(interception.request.body).to.deep.include({
        topic: newTask.topic,
        description: newTask.description,
      });
    });
    cy.wait("@getTasksAfterCreate");

    // Verify modal closed and task appears
    cy.get('[data-cy="task-modal"]').should("not.exist");
    cy.verifyTaskExists(newTask.topic);
    cy.contains(newTask.description).should("be.visible");
    cy.contains("1").should("be.visible");
  });

  it("should fail the test if user submits the task with empty fields", () => {
    // Click create task button
    cy.get('[data-cy="create-task-btn"]').click();

    // Verify modal opened
    cy.get('[data-cy="task-modal"]').should("be.visible");

    // Try to submit with empty fields
    cy.get('[data-cy="submit-btn"]').click();

    // Verify error message appears
    cy.contains("Topic and description are required").should("be.visible");
    cy.get('[data-cy="error-message"]').should("be.visible");

    // Verify modal is still open
    cy.get('[data-cy="task-modal"]').should("be.visible");

    // Test with only topic filled
    cy.get('[data-cy="topic-input"]').type("Test Topic");
    cy.get('[data-cy="submit-btn"]').click();
    cy.contains("Topic and description are required").should("be.visible");

    // Clear topic and add only description
    cy.get('[data-cy="topic-input"]').clear();
    cy.get('[data-cy="description-input"]').type("Test Description");
    cy.get('[data-cy="submit-btn"]').click();
    cy.contains("Topic and description are required").should("be.visible");

    // Test with whitespace only
    cy.get('[data-cy="topic-input"]').clear().type("   ");
    cy.get('[data-cy="description-input"]').clear().type("   ");
    cy.get('[data-cy="submit-btn"]').click();
    cy.contains("Topic and description are required").should("be.visible");

    // Close modal to clean up
    cy.get('[data-cy="cancel-btn"]').click();
  });

  it("should display the newly created task", () => {
    const testTask: Task = {
      task_id: 1,
      topic: "Test Display Task",
      description: "This task should be displayed correctly in the UI",
      created_at: new Date().toISOString(),
    };

    // Mock API to return the test task
    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: [testTask],
    }).as("getTasksWithData");

    // Reload to get tasks
    cy.visit("/");
    cy.wait("@getTasksWithData");

    // Verify task is displayed
    cy.get('[data-cy="task-card"]').should("have.length", 1);
    cy.contains(testTask.topic).should("be.visible");
    cy.contains(testTask.description).should("be.visible");
    cy.contains(`ID: ${testTask.task_id}`).should("be.visible");

    // Verify action buttons are present
    cy.get('[data-cy="edit-btn"]').should("be.visible");
    cy.get('[data-cy="delete-btn"]').should("be.visible");

    // Verify stats update
    cy.contains("1").should("be.visible");
    cy.contains("You have 1 task to manage").should("be.visible");
  });

  it("should update the newly created task successfully", () => {
    const originalTask: Task = {
      task_id: 1,
      topic: "Original Task",
      description: "Original description",
      created_at: new Date().toISOString(),
    };

    const updatedTask: Task = {
      task_id: 1,
      topic: "Updated Task Title",
      description: "This is the updated description with more details",
      created_at: originalTask.created_at,
    };

    // Mock initial task load
    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: [originalTask],
    }).as("getInitialTask");
    cy.visit("/");
    cy.wait("@getInitialTask");

    // Click edit button
    cy.get('[data-cy="edit-btn"]').click();

    // Verify modal opened with existing data
    cy.get('[data-cy="task-modal"]').should("be.visible");
    cy.contains("Edit Task").should("be.visible");
    cy.get('[data-cy="topic-input"]').should("have.value", originalTask.topic);
    cy.get('[data-cy="description-input"]').should(
      "have.value",
      originalTask.description
    );

    // Update the fields
    cy.get('[data-cy="topic-input"]').clear().type(updatedTask.topic);
    cy.get('[data-cy="description-input"]')
      .clear()
      .type(updatedTask.description);

    // Mock successful update
    cy.intercept(
      "PUT",
      `http://localhost:5000/task/${originalTask.task_id}/update`,
      {
        statusCode: 200,
        body: { success: true },
      }
    ).as("updateTask");

    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: [updatedTask],
    }).as("getUpdatedTasks");

    // Submit the update
    cy.get('[data-cy="submit-btn"]').click();

    // Verify API calls
    cy.wait("@updateTask").then((interception) => {
      expect(interception.request.body).to.deep.include({
        topic: updatedTask.topic,
        description: updatedTask.description,
      });
    });
    cy.wait("@getUpdatedTasks");

    // Verify modal closed and updated task appears
    cy.get('[data-cy="task-modal"]').should("not.exist");
    cy.contains(updatedTask.topic).should("be.visible");
    cy.contains(updatedTask.description).should("be.visible");
    cy.contains(originalTask.topic).should("not.exist");
  });

  it("should delete the newly created task successfully", () => {
    const taskToDelete: Task = {
      task_id: 1,
      topic: "Task to Delete",
      description: "This task will be deleted",
      created_at: new Date().toISOString(),
    };

    // Mock initial task load
    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: [taskToDelete],
    }).as("getTaskToDelete");
    cy.visit("/");
    cy.wait("@getTaskToDelete");

    // Verify task exists
    cy.contains(taskToDelete.topic).should("be.visible");

    // Mock successful deletion
    cy.intercept(
      "DELETE",
      `http://localhost:5000/task/${taskToDelete.task_id}/delete`,
      {
        statusCode: 200,
        body: { success: true },
      }
    ).as("deleteTask");

    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: [],
    }).as("getEmptyTasksAfterDelete");

    // Click delete button
    cy.get('[data-cy="delete-btn"]').click();

    // Verify API calls
    cy.wait("@deleteTask");
    cy.wait("@getEmptyTasksAfterDelete");

    // Verify task is removed
    cy.contains(taskToDelete.topic).should("not.exist");
    cy.contains("No tasks yet - time to get organized!").should("be.visible");
    cy.contains("0").should("be.visible");
  });

  it("should handle multiple tasks correctly", () => {
    const multipleTasks: Task[] = [
      {
        task_id: 1,
        topic: "First Task",
        description: "First task description",
        created_at: new Date().toISOString(),
      },
      {
        task_id: 2,
        topic: "Second Task",
        description: "Second task description",
        created_at: new Date().toISOString(),
      },
      {
        task_id: 3,
        topic: "Third Task",
        description: "Third task description",
        created_at: new Date().toISOString(),
      },
    ];

    // Mock multiple tasks
    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 200,
      body: multipleTasks,
    }).as("getMultipleTasks");
    cy.visit("/");
    cy.wait("@getMultipleTasks");

    // Verify all tasks are displayed
    cy.get('[data-cy="task-card"]').should("have.length", 3);
    cy.contains("3").should("be.visible");
    cy.contains("You have 3 tasks to manage").should("be.visible");

    // Verify each task content
    multipleTasks.forEach((task) => {
      cy.contains(task.topic).should("be.visible");
      cy.contains(task.description).should("be.visible");
      cy.contains(`ID: ${task.task_id}`).should("be.visible");
    });
  });

  it("should handle API errors gracefully", () => {
    // Mock API error for fetching tasks
    cy.intercept("GET", "http://localhost:5000/task/get-all", {
      statusCode: 500,
      body: { error: "Internal server error" },
    }).as("getTasksError");
    cy.visit("/");
    cy.wait("@getTasksError");

    // Should show error state
    cy.contains("Failed to load tasks").should("be.visible");

    // Test create task error
    cy.intercept("POST", "http://localhost:5000/task/create", {
      statusCode: 500,
      body: { error: "Internal server error" },
    }).as("createTaskError");

    cy.get('[data-cy="create-task-btn"]').click();
    cy.get('[data-cy="topic-input"]').type("Test Task");
    cy.get('[data-cy="description-input"]').type("Test Description");
    cy.get('[data-cy="submit-btn"]').click();

    cy.wait("@createTaskError");
    cy.contains("Failed to create task").should("be.visible");
  });

  it("should close modal when cancel button is clicked", () => {
    cy.get('[data-cy="create-task-btn"]').click();
    cy.get('[data-cy="task-modal"]').should("be.visible");

    // Click cancel button
    cy.get('[data-cy="cancel-btn"]').click();
    cy.get('[data-cy="task-modal"]').should("not.exist");
  });

  it("should close modal when X button is clicked", () => {
    cy.get('[data-cy="create-task-btn"]').click();
    cy.get('[data-cy="task-modal"]').should("be.visible");

    // Click X button
    cy.get('[data-cy="close-btn"]').click();
    cy.get('[data-cy="task-modal"]').should("not.exist");
  });
});
