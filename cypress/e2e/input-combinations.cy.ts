/// <reference types="cypress" />

import { BasePage, SettingsPage, CalculatorPage } from '../pageObjects';

describe('Input Field Combinations', () => {
  let basePage: BasePage;
  let settingsPage: SettingsPage;
  let calculatorPage: CalculatorPage;

  beforeEach(() => {
    basePage = new BasePage();
    settingsPage = new SettingsPage();
    calculatorPage = new CalculatorPage();

    basePage.navigate().waitForPageLoad();
    
    // Reset to default settings before each test
    settingsPage.openSettings().ensureSettingsOpen().resetSettings().closeSettings();
  });

  describe('Basic Input Validation', () => {
    it('should handle empty inputs gracefully', () => {
      calculatorPage.clearAllInputs();
      calculatorPage.verifyNoActivityMessage();
    });

    it('should accept zero values', () => {
      calculatorPage
        .setPeople3Hours(0)
        .setPeople2Hours(0)
        .setBalls6to7(0)
        .setBalls7to9(0);
      calculatorPage.verifyNoActivityMessage();
    });

    it('should accept positive integer values', () => {
      calculatorPage
        .setPeople3Hours(5)
        .setPeople2Hours(3)
        .setBalls6to7(12)
        .setBalls7to9(15);
      calculatorPage.verifyResultsVisible();
    });

    it('should handle decimal values appropriately', () => {
      calculatorPage
        .setPeople3Hours(2.5)
        .setPeople2Hours(1.5)
        .setBalls6to7(10.5)
        .setBalls7to9(8.5);
      calculatorPage.verifyResultsVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      calculatorPage
        .setPeople3Hours(999)
        .setPeople2Hours(888)
        .setBalls6to7(9999)
        .setBalls7to9(8888);
      calculatorPage.verifyResultsVisible();
    });

    it('should handle single participant scenarios', () => {
      calculatorPage
        .calculateWithInputs({ people3Hours: 1, balls6to7: 6, balls7to9: 8 });
      calculatorPage.verifyResultsVisible();
    });

    it('should handle only 3-hour participants', () => {
      calculatorPage
        .calculateWithInputs({ people3Hours: 4, balls6to7: 12, balls7to9: 16 });
      calculatorPage.verifyResultsVisible();
    });

    it('should handle only 2-hour participants', () => {
      calculatorPage
        .calculateWithInputs({ people2Hours: 3, balls7to9: 10 });
      calculatorPage.verifyResultsVisible();
    });
  });

  describe('Combination Scenarios', () => {
    const testScenarios = [
      { name: 'Typical weekday', people3Hours: 6, people2Hours: 4, balls6to7: 12, balls7to9: 16 },
      { name: 'Weekend game', people3Hours: 8, people2Hours: 6, balls6to7: 15, balls7to9: 20 },
      { name: 'Small group', people3Hours: 2, people2Hours: 1, balls6to7: 6, balls7to9: 8 },
      { name: 'Large tournament', people3Hours: 12, people2Hours: 8, balls6to7: 24, balls7to9: 32 },
      { name: 'Mixed session', people3Hours: 5, people2Hours: 3, balls6to7: 0, balls7to9: 18 },
      { name: 'Early birds', people3Hours: 3, people2Hours: 0, balls6to7: 8, balls7to9: 0 }
    ];

    testScenarios.forEach(scenario => {
      it(`should handle ${scenario.name} scenario`, () => {
        calculatorPage.calculateWithInputs(scenario);
        calculatorPage.verifyResultsVisible();
      });
    });
  });

  describe('Input Field Interactions', () => {
    it('should update calculations when inputs change', () => {
      calculatorPage
        .setPeople3Hours(5)
        .setPeople2Hours(3)
        .setBalls6to7(12)
        .setBalls7to9(16);
      
      calculatorPage.verifyResultsVisible();
      
      // Change inputs and verify updates
      calculatorPage
        .setPeople3Hours(6)
        .setBalls7to9(20);
      
      calculatorPage.verifyResultsVisible();
    });

    it('should clear calculations when inputs are cleared', () => {
      calculatorPage
        .calculateWithInputs({ people3Hours: 5, people2Hours: 3, balls6to7: 12, balls7to9: 16 });
      
      calculatorPage.verifyResultsVisible();
      
      calculatorPage.clearAllInputs();
      calculatorPage.verifyNoActivityMessage();
    });

    it('should handle sequential input changes', () => {
      // Start with partial inputs
      calculatorPage.setPeople3Hours(4);
      calculatorPage.verifyNoActivityMessage();
      
      // Add more inputs
      calculatorPage.setBalls6to7(8);
      calculatorPage.verifyResultsVisible();
      
      // Complete the inputs
      calculatorPage
        .setPeople2Hours(2)
        .setBalls7to9(12);
      calculatorPage.verifyResultsVisible();
    });
  });
});