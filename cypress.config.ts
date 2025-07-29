import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    projectId: "fgic4o",
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      API_URL: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      // 在这里实现节点事件监听器
    },
  },
  watchForFileChanges: false,
})
