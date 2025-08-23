import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    testIsolation: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    experimentalStudio: true,
    experimentalMemoryManagement: true,
  },
  video: false,
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
  fixturesFolder: "cypress/fixtures",
  env: {
    apiBaseUrl: "http://localhost:5000",
  },
  chromeWebSecurity: false,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },
});
