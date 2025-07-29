/// <reference types="cypress" />

export class CalculatorPage {
  private selectors = {
    people3HoursInput: '[data-cy=people-3hours-input]',
    people2HoursInput: '[data-cy=people-2hours-input]',
    balls6to7Input: '[data-cy=balls-6to7-input]',
    balls7to9Input: '[data-cy=balls-7to9-input]',
    costResultsSection: '[data-cy=cost-results-section]',
    cost3HoursDisplay: '[data-cy=cost-3hours-display]',
    cost2HoursDisplay: '[data-cy=cost-2hours-display]',
    ballCostDisplay: '[data-cy=ball-cost-display]',
    venueCostDisplay: '[data-cy=venue-cost-display]',
    totalCostDisplay: '[data-cy=total-cost-display]',
    summaryText: '[data-cy=summary-text]',
    copyButton: '[data-cy=copy-button]',
    noActivityMessage: '[data-cy=no-activity-message]'
  };

  setPeople3Hours(count: number) {
    cy.get(this.selectors.people3HoursInput).clear().type(count.toString());
    return this;
  }

  setPeople2Hours(count: number) {
    cy.get(this.selectors.people2HoursInput).clear().type(count.toString());
    return this;
  }

  setBalls6to7(count: number) {
    cy.get(this.selectors.balls6to7Input).clear().type(count.toString());
    return this;
  }

  setBalls7to9(count: number) {
    cy.get(this.selectors.balls7to9Input).clear().type(count.toString());
    return this;
  }

  clearAllInputs() {
    cy.get(this.selectors.people3HoursInput).clear();
    cy.get(this.selectors.people2HoursInput).clear();
    cy.get(this.selectors.balls6to7Input).clear();
    cy.get(this.selectors.balls7to9Input).clear();
    return this;
  }

  calculateWithInputs(inputs: {
    people3Hours?: number;
    people2Hours?: number;
    balls6to7?: number;
    balls7to9?: number;
  }) {
    if (inputs.people3Hours !== undefined) this.setPeople3Hours(inputs.people3Hours);
    if (inputs.people2Hours !== undefined) this.setPeople2Hours(inputs.people2Hours);
    if (inputs.balls6to7 !== undefined) this.setBalls6to7(inputs.balls6to7);
    if (inputs.balls7to9 !== undefined) this.setBalls7to9(inputs.balls7to9);
    
    // Trigger calculation by blurring last input
    cy.get(this.selectors.balls7to9Input).blur();
    return this;
  }

  verifyResultsVisible() {
    cy.get(this.selectors.costResultsSection).should('be.visible');
    return this;
  }

  verifyNoActivityMessage() {
    cy.get(this.selectors.noActivityMessage).should('be.visible').and('contain.text', '请输入人数和羽毛球数量开始计算');
    return this;
  }

  verifyCost3Hours(expectedCost: number) {
    cy.get(this.selectors.cost3HoursDisplay).should('contain.text', `¥${expectedCost.toFixed(2)}`);
    return this;
  }

  verifyCost2Hours(expectedCost: number) {
    cy.get(this.selectors.cost2HoursDisplay).should('contain.text', `¥${expectedCost.toFixed(2)}`);
    return this;
  }

  verifyBallCost(expectedCost: number) {
    cy.get(this.selectors.ballCostDisplay).should('contain.text', `¥${expectedCost.toFixed(2)}`);
    return this;
  }

  verifyVenueCost(expectedCost: number) {
    cy.get(this.selectors.venueCostDisplay).should('contain.text', `¥${expectedCost.toFixed(2)}`);
    return this;
  }

  verifyTotalCost(expectedCost: number) {
    cy.get(this.selectors.totalCostDisplay).should('contain.text', `¥${expectedCost.toFixed(2)}`);
    return this;
  }

  verifySummaryText(contains: string) {
    cy.get(this.selectors.summaryText).should('contain.text', contains);
    return this;
  }

  clickCopyButton() {
    cy.get(this.selectors.copyButton).click();
    return this;
  }

  verifyCopySuccess() {
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
        expect(text).to.not.be.empty;
      });
    });
    return this;
  }

  calculateExpectedCosts(settings: {
    singlePrice: number;
    venue2Hours: number;
    venue3Hours: number;
  }, inputs: {
    people3Hours: number;
    people2Hours: number;
    balls6to7: number;
    balls7to9: number;
  }) {
    const totalBalls = inputs.balls6to7 + inputs.balls7to9;
    const totalBallCost = totalBalls * settings.singlePrice;
    
    let cost3Hours = 0;
    let cost2Hours = 0;

    if (inputs.people3Hours > 0) {
      const ballCost3Hours = (inputs.balls6to7 * settings.singlePrice) / inputs.people3Hours + 
                           (inputs.balls7to9 * settings.singlePrice) / (inputs.people3Hours + inputs.people2Hours);
      cost3Hours = settings.venue3Hours + ballCost3Hours;
    }

    if (inputs.people2Hours > 0 && inputs.balls7to9 > 0) {
      const ballCost2Hours = (inputs.balls7to9 * settings.singlePrice) / (inputs.people3Hours + inputs.people2Hours);
      cost2Hours = settings.venue2Hours + ballCost2Hours;
    }

    return { cost3Hours, cost2Hours, totalBallCost };
  }
}

export default CalculatorPage;