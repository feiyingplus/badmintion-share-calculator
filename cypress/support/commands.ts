/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to clear and type in an input field
       * @example cy.clearAndType('input[name="test"]', 'value')
       */
      clearAndType(selector: string, value: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to reset calculator settings to defaults
       */
      resetCalculatorSettings(): Chainable<void>
    }
  }
}

Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

Cypress.Commands.add('clearAndType', (selector: string, value: string) => {
  cy.get(selector).clear().type(value)
})

Cypress.Commands.add('resetCalculatorSettings', () => {
  cy.get('[data-cy=settings-collapsible]').click()
  cy.get('[data-cy=reset-settings-button]').click()
  cy.get('[data-cy=settings-collapsible]').click()
})

export {} // Prevent TypeScript from complaining about duplicate identifiers