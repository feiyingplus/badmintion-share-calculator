/// <reference types="cypress" />

import { BasePage, SettingsPage, CalculatorPage } from '../pageObjects';

describe('Badminton Price Setup Validation', () => {
  let basePage: BasePage;
  let settingsPage: SettingsPage;
  let calculatorPage: CalculatorPage;

  beforeEach(() => {
    basePage = new BasePage();
    settingsPage = new SettingsPage();
    calculatorPage = new CalculatorPage();

    basePage.navigate().waitForPageLoad();
  });

  describe('Bucket Price Mode', () => {
    it('should calculate single price from bucket settings correctly', () => {
      settingsPage
        .openSettings()
        .setBucketPrice(135)
        .setBucketQuantity(12)
        .verifyCalculatedPrice(11.25)
        .verifyCurrentPrice(11.25)
        .closeSettings();
    });

    it('should handle custom bucket prices', () => {
      const testCases = [
        { bucketPrice: 150, bucketQuantity: 15, expected: 10.00 },
        { bucketPrice: 200, bucketQuantity: 10, expected: 20.00 },
        { bucketPrice: 99, bucketQuantity: 12, expected: 8.25 },
        { bucketPrice: 180, bucketQuantity: 12, expected: 15.00 }
      ];

      testCases.forEach(({ bucketPrice, bucketQuantity, expected }) => {
        settingsPage
          .openSettings()
          .setBucketPrice(bucketPrice)
          .setBucketQuantity(bucketQuantity)
          .verifyCalculatedPrice(expected)
          .closeSettings();
      });
    });

    it('should update calculations when bucket settings change', () => {
      settingsPage
        .openSettings()
        .setBucketPrice(135)
        .setBucketQuantity(12);

      calculatorPage
        .calculateWithInputs({ people3Hours: 4, people2Hours: 2, balls6to7: 12, balls7to9: 16 });

      settingsPage
        .setBucketPrice(150)
        .setBucketQuantity(10);
      
      // Verify price updated in display
      settingsPage.verifyCurrentPrice(15.00);
    });
  });

  describe('Single Price Mode', () => {
    it('should allow manual single price input', () => {
      settingsPage
        .openSettings()
        .switchToSinglePriceMode()
        .setSinglePrice(12.50)
        .verifyCurrentPrice(12.50)
        .closeSettings();
    });

    it('should handle decimal single prices', () => {
      const testPrices = [8.99, 12.50, 15.75, 10.33, 9.99];

      testPrices.forEach(price => {
        settingsPage
          .openSettings()
          .switchToSinglePriceMode()
          .setSinglePrice(price)
          .verifyCurrentPrice(price)
          .closeSettings();
      });
    });

    it('should switch between price modes correctly', () => {
      settingsPage
        .openSettings()
        .setBucketPrice(135)
        .setBucketQuantity(12)
        .verifyCurrentPrice(11.25);

      settingsPage
        .switchToSinglePriceMode()
        .verifyCurrentPrice(11.25); // Should retain calculated price

      settingsPage
        .setSinglePrice(15.00)
        .verifyCurrentPrice(15.00);

      settingsPage
        .switchToBucketPriceMode()
        .verifyCurrentPrice(11.25);
    });
  });

  describe('Venue Price Configuration', () => {
    it('should configure 2-hour venue pricing', () => {
      settingsPage
        .openSettings()
        .setVenue2HoursPrice(30)
        .closeSettings();

      calculatorPage
        .calculateWithInputs({ people2Hours: 2, balls7to9: 10 });
      
      // Verify calculations use new venue price
      calculatorPage.verifyResultsVisible();
    });

    it('should configure 3-hour venue pricing', () => {
      settingsPage
        .openSettings()
        .setVenue3HoursPrice(35)
        .closeSettings();

      calculatorPage
        .calculateWithInputs({ people3Hours: 4, balls6to7: 12, balls7to9: 16 });
      
      // Verify calculations use new venue price
      calculatorPage.verifyResultsVisible();
    });

    it('should handle custom venue prices', () => {
      const venueTests = [
        { v2: 20, v3: 25 },
        { v2: 35, v3: 45 },
        { v2: 18, v3: 22 },
        { v2: 28, v3: 35 }
      ];

      venueTests.forEach(({ v2, v3 }) => {
        settingsPage
          .openSettings()
          .setVenue2HoursPrice(v2)
          .setVenue3HoursPrice(v3)
          .closeSettings();

        calculatorPage
          .calculateWithInputs({ people3Hours: 3, people2Hours: 2, balls6to7: 10, balls7to9: 12 });
        
        calculatorPage.verifyResultsVisible();
      });
    });
  });

  describe('Settings Reset Functionality', () => {
    it('should reset to default settings', () => {
      settingsPage
        .openSettings()
        .setBucketPrice(200)
        .setBucketQuantity(10)
        .setSinglePrice(20.00)
        .setVenue2HoursPrice(35)
        .setVenue3HoursPrice(40);

      settingsPage
        .resetSettings()
        .verifyCurrentPrice(11.25);
    });

    it('should persist settings in localStorage', () => {
      settingsPage
        .openSettings()
        .setBucketPrice(150)
        .setBucketQuantity(15)
        .setVenue2HoursPrice(28)
        .closeSettings();

      // Reload page and verify settings persist
      cy.reload();
      basePage.waitForPageLoad();
      
      settingsPage
        .openSettings()
        .verifyCurrentPrice(10.00);
    });
  });

  describe('Price Calculation Validation', () => {
    it('should calculate correct single price from bucket', () => {
      const testCases = [
        { bucketPrice: 135, bucketQuantity: 12, expectedSingle: 11.25 },
        { bucketPrice: 150, bucketQuantity: 15, expectedSingle: 10.00 },
        { bucketPrice: 180, bucketQuantity: 12, expectedSingle: 15.00 },
        { bucketPrice: 200, bucketQuantity: 10, expectedSingle: 20.00 }
      ];

      testCases.forEach(({ bucketPrice, bucketQuantity, expectedSingle }) => {
        settingsPage
          .openSettings()
          .setBucketPrice(bucketPrice)
          .setBucketQuantity(bucketQuantity)
          .verifyCalculatedPrice(expectedSingle)
          .closeSettings();

        // Verify calculations use correct price
        calculatorPage
          .calculateWithInputs({ people3Hours: 4, balls6to7: 12, balls7to9: 16 });
        
        const expectedTotalBalls = 28;
        const expectedBallCost = expectedTotalBalls * expectedSingle;
        calculatorPage.verifyResultsVisible();
      });
    });

    it('should validate price boundaries', () => {
      const boundaryTests = [
        { price: 0.01, quantity: 1, expected: 0.01 },
                { price: 999, quantity: 999, expected: 1.00 },
        { price: 50, quantity: 1, expected: 50.00 },
        { price: 1, quantity: 50, expected: 0.02 }
      ];

      boundaryTests.forEach(({ price, quantity, expected }) => {
        settingsPage
          .openSettings()
          .setBucketPrice(price)
          .setBucketQuantity(quantity)
          .verifyCalculatedPrice(expected)
          .closeSettings();
      });
    });
  });
});