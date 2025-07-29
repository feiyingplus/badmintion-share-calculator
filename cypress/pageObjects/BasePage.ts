/// <reference types="cypress" />

export class BasePage {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000';
  }

  navigate() {
    cy.visit('/');
    return this;
  }

  waitForPageLoad() {
    cy.get('[data-cy=calculator-title]').should('be.visible');
    return this;
  }

  getTitle() {
    return cy.get('[data-cy=calculator-title]');
  }

  getSubtitle() {
    return cy.get('[data-cy=calculator-subtitle]');
  }
}

export default BasePage;