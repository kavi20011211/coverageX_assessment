import "./commands";

// Hide fetch/XHR requests in command log for cleaner output
const app = window.top;
if (!app?.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app?.document.createElement("style");
  if (style) {
    style.innerHTML =
      ".command-name-request, .command-name-xhr { display: none }";
    style.setAttribute("data-hide-command-log-request", "");
    app?.document.head.appendChild(style);
  }
}

// Global error handling
Cypress.on("uncaught:exception", (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // Return false only for specific errors you want to ignore
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }

  // Ignore React hydration warnings in development
  if (err.message.includes("Hydration")) {
    return false;
  }

  // Ignore network-related errors during testing
  if (err.message.includes("Network")) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// Add any global before hooks if needed
before(() => {
  // Clear any existing interceptors
  cy.window().then((win) => {
    // Clear localStorage/sessionStorage if needed for clean state
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});
