/// <reference types="cypress" />

export class SettingsPage {
  private selectors = {
    settingsCollapsible: '[data-cy=settings-collapsible]',
    bucketPriceInput: '[data-cy=bucket-price-input]',
    bucketQuantityInput: '[data-cy=bucket-quantity-input]',
    singlePriceInput: '[data-cy=single-price-input]',
    venue2HoursInput: '[data-cy=venue-2hours-input]',
    venue3HoursInput: '[data-cy=venue-3hours-input]',
    resetSettingsButton: '[data-cy=reset-settings-button]',
    priceModeToggle: '[data-cy=price-mode-toggle]',
    bucketModeButton: '[data-cy=bucket-mode-button]',
    singleModeButton: '[data-cy=single-mode-button]',
    calculatedPriceDisplay: '[data-cy=calculated-price-display]',
    currentPriceDisplay: '[data-cy=current-price-display]'
  };

  openSettings() {
    cy.get(this.selectors.settingsCollapsible).click();
    cy.get(this.selectors.resetSettingsButton).should('be.visible');
    return this;
  }

  closeSettings() {
    cy.get(this.selectors.settingsCollapsible).click();
    return this;
  }

  setBucketPrice(price: number) {
    cy.get(this.selectors.bucketPriceInput).clear().type(price.toString());
    return this;
  }

  setBucketQuantity(quantity: number) {
    cy.get(this.selectors.bucketQuantityInput).clear().type(quantity.toString());
    return this;
  }

  setSinglePrice(price: number) {
    this.switchToSinglePriceMode();
    cy.get(this.selectors.singlePriceInput).clear().type(price.toString());
    return this;
  }

  setVenue2HoursPrice(price: number) {
    cy.get(this.selectors.venue2HoursInput).clear().type(price.toString());
    return this;
  }

  setVenue3HoursPrice(price: number) {
    cy.get(this.selectors.venue3HoursInput).clear().type(price.toString());
    return this;
  }

  switchToBucketPriceMode() {
    cy.get(this.selectors.bucketModeButton).click();
    cy.get(this.selectors.bucketPriceInput).should('be.visible');
    return this;
  }

  switchToSinglePriceMode() {
    cy.get(this.selectors.singleModeButton).click();
    cy.get(this.selectors.singlePriceInput).should('be.visible');
    return this;
  }

  resetSettings() {
    cy.get(this.selectors.resetSettingsButton).click();
    return this;
  }

  getCalculatedPrice() {
    return cy.get(this.selectors.calculatedPriceDisplay);
  }

  getCurrentPrice() {
    return cy.get(this.selectors.currentPriceDisplay);
  }

  verifyCalculatedPrice(expectedPrice: number) {
    this.switchToBucketPriceMode();
    this.getCalculatedPrice().should('contain.text', `¥${expectedPrice.toFixed(2)}`);
    return this;
  }

  verifyCurrentPrice(expectedPrice: number) {
    this.getCurrentPrice().should('contain.text', `¥${expectedPrice.toFixed(2)}`);
    return this;
  }
}

export default SettingsPage;