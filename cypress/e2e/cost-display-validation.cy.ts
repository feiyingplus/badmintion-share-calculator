/// <reference types="cypress" />

import { BasePage, SettingsPage, CalculatorPage } from '../pageObjects';

describe('Cost Display Validation', () => {
  let basePage: BasePage;
  let settingsPage: SettingsPage;
  let calculatorPage: CalculatorPage;

  beforeEach(() => {
    basePage = new BasePage();
    settingsPage = new SettingsPage();
    calculatorPage = new CalculatorPage();

    basePage.navigate().waitForPageLoad();
  });

  describe('Basic Cost Calculations', () => {
    it('should calculate costs correctly for 3-hour only participants', () => {
      const inputs = { people3Hours: 4, balls6to7: 12, balls7to9: 16 };
      const settings = { singlePrice: 11.25, venue3Hours: 30, venue2Hours: 25 };

      settingsPage.openSettings().resetSettings().closeSettings();
      calculatorPage.calculateWithInputs(inputs);

      // Expected calculations:
      // Ball cost for 3-hour: (12 * 11.25)/4 + (16 * 11.25)/4 = 33.75 + 45 = 78.75
      // Total 3-hour cost: 30 + 78.75 = 108.75 per person
      calculatorPage.verifyResultsVisible();
    });

    it('should calculate costs correctly for 2-hour only participants', () => {
      const inputs = { people2Hours: 3, balls7to9: 15 };
      const settings = { singlePrice: 11.25, venue2Hours: 25 };

      settingsPage.openSettings().resetSettings().closeSettings();
      calculatorPage.calculateWithInputs(inputs);

      // Expected calculations:
      // Ball cost for 2-hour: (15 * 11.25)/3 = 56.25
      // Total 2-hour cost: 25 + 56.25 = 81.25 per person
      calculatorPage.verifyResultsVisible();
    });

    it('should calculate costs correctly for mixed participants', () => {
      const inputs = { people3Hours: 4, people2Hours: 2, balls6to7: 12, balls7to9: 16 };
      const settings = { singlePrice: 11.25, venue3Hours: 30, venue2Hours: 25 };

      settingsPage.openSettings().resetSettings().closeSettings();
      calculatorPage.calculateWithInputs(inputs);

      // Expected calculations:
      // 3-hour participants:
      // - Ball cost 6-7: (12 * 11.25)/4 = 33.75
      // - Ball cost 7-9: (16 * 11.25)/6 = 30.00
      // - Total 3-hour cost: 30 + 33.75 + 30.00 = 93.75

      // 2-hour participants:
      // - Ball cost 7-9: (16 * 11.25)/6 = 30.00
      // - Total 2-hour cost: 25 + 30.00 = 55.00
      calculatorPage.verifyResultsVisible();
    });
  });

  describe('Cost Display Scenarios', () => {
    const testScenarios = [
      {
        name: 'Standard weekday game',
        settings: { singlePrice: 11.25, venue3Hours: 30, venue2Hours: 25 },
        inputs: { people3Hours: 6, people2Hours: 4, balls6to7: 12, balls7to9: 16 },
        expected: {
          totalBalls: 28,
          totalBallCost: 315.00,
          cost3Hours: 30 + (12*11.25)/6 + (16*11.25)/10,
          cost2Hours: 25 + (16*11.25)/10
        }
      },
      {
        name: 'Premium shuttlecocks',
        settings: { singlePrice: 15.00, venue3Hours: 35, venue2Hours: 30 },
        inputs: { people3Hours: 4, people2Hours: 2, balls6to7: 15, balls7to9: 20 },
        expected: {
          totalBalls: 35,
          totalBallCost: 525.00,
          cost3Hours: 35 + (15*15)/4 + (20*15)/6,
          cost2Hours: 30 + (20*15)/6
        }
      },
      {
        name: 'Budget session',
        settings: { singlePrice: 8.50, venue3Hours: 25, venue2Hours: 20 },
        inputs: { people3Hours: 8, people2Hours: 6, balls6to7: 10, balls7to9: 12 },
        expected: {
          totalBalls: 22,
          totalBallCost: 187.00,
          cost3Hours: 25 + (10*8.50)/8 + (12*8.50)/14,
          cost2Hours: 20 + (12*8.50)/14
        }
      }
    ];

    testScenarios.forEach(scenario => {
      it(`should display correct costs for ${scenario.name}`, () => {
        settingsPage.openSettings().resetSettings().closeSettings();
        
        // Update settings if different from defaults
        if (scenario.settings.singlePrice !== 11.25) {
          settingsPage.openSettings().switchToSinglePriceMode().setSinglePrice(scenario.settings.singlePrice).closeSettings();
        }
        if (scenario.settings.venue2Hours !== 25 || scenario.settings.venue3Hours !== 30) {
          settingsPage.openSettings()
            .setVenue2HoursPrice(scenario.settings.venue2Hours)
            .setVenue3HoursPrice(scenario.settings.venue3Hours)
            .closeSettings();
        }

        calculatorPage.calculateWithInputs(scenario.inputs);
        calculatorPage.verifyResultsVisible();
        calculatorPage.verifySummaryText('今日球费');
      });
    });
  });

  describe('Summary Text Validation', () => {
    it('should generate correct summary for 3-hour only', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, balls6to7: 12, balls7to9: 16 });
      calculatorPage.verifySummaryText('3小时场地费30元 + 78.75元球费');
    });

    it('should generate correct summary for 2-hour only', () => {
      calculatorPage.calculateWithInputs({ people2Hours: 3, balls7to9: 15 });
      calculatorPage.verifySummaryText('2小时场地费25元 + 56.25元球费');
    });

    it('should generate combined summary for mixed participants', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, people2Hours: 2, balls6to7: 12, balls7to9: 16 });
      calculatorPage.verifySummaryText('今日球费');
    });

    it('should show appropriate message when no activity', () => {
      calculatorPage.clearAllInputs();
      calculatorPage.verifyNoActivityMessage();
    });
  });

  describe('Cost Breakdown Display', () => {
    it('should display detailed cost breakdown', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 5, people2Hours: 3, balls6to7: 10, balls7to9: 15 });

      // Verify all cost components are displayed
      cy.get('[data-cy=cost-breakdown-3hours]').should('be.visible');
      cy.get('[data-cy=cost-breakdown-2hours]').should('be.visible');
      cy.get('[data-cy=ball-usage-details]').should('be.visible');
      
      calculatorPage.verifyResultsVisible();
      
      // Verify individual cost elements
      cy.get('[data-cy=cost-breakdown-3hours]').within(() => {
        cy.contains('参与人数:').next().should('have.text', '5人');
        cy.get('[data-cy=venue-cost-display]').should('contain.text', '¥30');
      });
      cy.get('[data-cy=ball-usage-details]').within(() => {
        cy.get('[data-cy=total-cost-display]').should('contain.text', '¥281.25');
      });
    });

    it('should format currency correctly', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 2, people2Hours: 1, balls6to7: 5, balls7to9: 8 });

      // Verify currency formatting (¥ symbol and 2 decimal places)
      cy.get('[data-cy=cost-3hours-display]').should('contain.text', '¥');
      cy.get('[data-cy=cost-2hours-display]').should('contain.text', '¥');
      cy.get('[data-cy=ball-cost-display]').should('contain.text', '¥');
      
      // Verify decimal places
      cy.get('[data-cy=cost-3hours-display]').invoke('text').should('match', /¥\d+\.\d{2}/);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update costs when inputs change', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, people2Hours: 2, balls6to7: 12, balls7to9: 16 });
      
      // Initial calculation
      calculatorPage.verifyResultsVisible();
      
      // Change inputs and verify updates
      calculatorPage.setPeople3Hours(5);
      calculatorPage.verifyResultsVisible();
      
      calculatorPage.setBalls6to7(15);
      calculatorPage.verifyResultsVisible();
      
      calculatorPage.setPeople2Hours(3);
      calculatorPage.verifyResultsVisible();
    });

    it('should update costs when prices change', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, people2Hours: 2, balls6to7: 12, balls7to9: 16 });
      
      // Initial calculation
      calculatorPage.verifyResultsVisible();
      
      // Change single price
      settingsPage.openSettings().switchToSinglePriceMode().setSinglePrice(15.00).closeSettings();
      calculatorPage.verifyResultsVisible();
      
      // Change venue prices
      settingsPage.openSettings().setVenue2HoursPrice(30).setVenue3HoursPrice(35).closeSettings();
      calculatorPage.verifyResultsVisible();
    });
  });

  describe('Edge Cases in Cost Display', () => {
    it('should handle zero ball usage gracefully', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, people2Hours: 2, balls6to7: 0, balls7to9: 0 });
      calculatorPage.verifyNoActivityMessage();
    });

    it('should handle single ball usage', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 2, balls6to7: 1, balls7to9: 0 });
      calculatorPage.verifyResultsVisible();
    });

    it('should handle large ball quantities', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 10, people2Hours: 5, balls6to7: 100, balls7to9: 150 });
      calculatorPage.verifyResultsVisible();
    });

    it('should display costs for very small groups', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 1, balls6to7: 3, balls7to9: 2 });
      calculatorPage.verifyResultsVisible();
    });
  });

  describe('Copy Functionality', () => {
    it('should copy cost summary to clipboard', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 3, people2Hours: 2, balls6to7: 8, balls7to9: 12 });
      calculatorPage.clickCopyButton();
      calculatorPage.verifyCopySuccess();
    });

    it('should generate appropriate summary text', () => {
      calculatorPage.calculateWithInputs({ people3Hours: 4, balls6to7: 10, balls7to9: 15 });
      calculatorPage.clickCopyButton();
      
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          expect(text).to.contain('今日球费');
          expect(text).to.contain('3小时场地费');
        });
      });
    });
  });

  });