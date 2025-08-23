/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to create a new task
       * @example cy.createTask('My Task', 'Task description')
       */
      createTask(topic: string, description: string): Chainable<void>;

      /**
       * Custom command to edit the first visible task
       * @example cy.editTask('New Topic', 'New Description')
       */
      editTask(newTopic: string, newDescription: string): Chainable<void>;

      /**
       * Custom command to delete the first visible task
       * @example cy.deleteFirstTask()
       */
      deleteFirstTask(): Chainable<void>;

      /**
       * Custom command to setup task API interceptors
       * @example cy.setupTaskInterceptors([mockTask1, mockTask2])
       */
      setupTaskInterceptors(initialTasks?: any[]): Chainable<void>;

      /**
       * Custom command to wait for task list to load
       * @example cy.waitForTasks()
       */
      waitForTasks(): Chainable<void>;

      /**
       * Custom command to verify task exists in the UI
       * @example cy.verifyTaskExists('My Task')
       */
      verifyTaskExists(topic: string): Chainable<void>;

      /**
       * Custom command to verify error message is displayed
       * @example cy.verifyErrorMessage('Failed to create task')
       */
      verifyErrorMessage(message: string): Chainable<void>;
    }
  }
}

// Custom command implementations
Cypress.Commands.add("createTask", (topic: string, description: string) => {
  cy.get('[data-cy="create-task-btn"]').click();
  cy.get('[data-cy="task-modal"]').should("be.visible");
  cy.get('[data-cy="topic-input"]').type(topic);
  cy.get('[data-cy="description-input"]').type(description);
  cy.get('[data-cy="submit-btn"]').click();
});

Cypress.Commands.add("editTask", (newTopic: string, newDescription: string) => {
  cy.get('[data-cy="edit-btn"]').first().click();
  cy.get('[data-cy="task-modal"]').should("be.visible");
  cy.get('[data-cy="topic-input"]').clear().type(newTopic);
  cy.get('[data-cy="description-input"]').clear().type(newDescription);
  cy.get('[data-cy="submit-btn"]').click();
});

Cypress.Commands.add("deleteFirstTask", () => {
  cy.get('[data-cy="delete-btn"]').first().click();
});

Cypress.Commands.add("setupTaskInterceptors", (initialTasks: any[] = []) => {
  const apiBaseUrl = Cypress.env("apiBaseUrl") || "http://localhost:5000";

  // Setup all API interceptors
  cy.intercept("GET", `${apiBaseUrl}/task/get-all`, {
    statusCode: 200,
    body: initialTasks,
  }).as("getTasks");

  cy.intercept("POST", `${apiBaseUrl}/task/create`, {
    statusCode: 201,
    body: { success: true },
  }).as("createTask");

  cy.intercept("PUT", `${apiBaseUrl}/task/*/update`, {
    statusCode: 200,
    body: { success: true },
  }).as("updateTask");

  cy.intercept("DELETE", `${apiBaseUrl}/task/*/delete`, {
    statusCode: 200,
    body: { success: true },
  }).as("deleteTask");
});

Cypress.Commands.add("waitForTasks", () => {
  cy.wait("@getTasks");
});

Cypress.Commands.add("verifyTaskExists", (topic: string) => {
  cy.contains(topic).should("be.visible");
  cy.get('[data-cy="task-card"]').should("contain", topic);
});

Cypress.Commands.add("verifyErrorMessage", (message: string) => {
  cy.contains(message).should("be.visible");
  cy.get('[data-cy="error-message"]').should("contain", message);
});

export {};
