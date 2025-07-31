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
      
      /**
       * Custom command to ensure settings panel is open
       */
      ensureSettingsOpen(): Chainable<void>
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
  // 使用自定义命令确保设置打开
  cy.ensureSettingsOpen();
  
  // 点击重置按钮
  cy.get('[data-cy=reset-settings-button]')
    .should('be.visible')
    .should('not.be.disabled')
    .click();
  
  // 关闭设置区域
  cy.get('[data-cy=settings-collapsible]').click();
  
  // 等待设置区域完全关闭
  cy.get('[data-cy=settings-collapsible]')
    .siblings()
    .filter('[data-state], [data-radix-collapsible-content]')
    .should(($content) => {
      const state = $content.attr('data-state');
      if (state) {
        expect(state).to.equal('closed');
      }
      const isVisible = $content.is(':visible');
      const height = $content.height();
      expect(isVisible === false || height === 0).to.be.true;
    });
})

Cypress.Commands.add('ensureSettingsOpen', () => {
  // 检查重置按钮是否可见
  cy.get('body').then(($body) => {
    const isButtonVisible = $body.find('[data-cy=reset-settings-button]:visible').length > 0;
    
    if (!isButtonVisible) {
      // 点击打开设置
      cy.get('[data-cy=settings-collapsible]').click();
      
      // 等待 CollapsibleContent 完全展开
      cy.get('[data-cy=settings-collapsible]')
        .siblings()
        .filter('[data-state], [data-radix-collapsible-content]')
        .should(($content) => {
          const state = $content.attr('data-state');
          if (state) {
            expect(state).to.equal('open');
          }
          expect($content).to.be.visible;
          expect($content.height()).to.be.greaterThan(0);
        });
    }
  });
  
  // 确保重置按钮最终可见且可交互
  cy.get('[data-cy=reset-settings-button]')
    .should('be.visible')
    .should('not.be.disabled');
})

export {} // Prevent TypeScript from complaining about duplicate identifiers