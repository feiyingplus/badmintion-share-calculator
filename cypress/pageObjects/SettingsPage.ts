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
    // 等待设置区域可见并点击
    cy.get(this.selectors.settingsCollapsible, { timeout: 10000 })
      .should('be.visible')
      .click();

    // 等待 CollapsibleContent 元素变为可见状态
    // 使用多种方法确保内容完全展开
    cy.get(this.selectors.settingsCollapsible)
      .siblings()
      .filter('[data-state], [data-radix-collapsible-content]')
      .should(($content) => {
        // 检查 data-state 属性（如果存在）
        const state = $content.attr('data-state');
        if (state) {
          expect(state).to.equal('open');
        }

        // 检查元素是否可见
        expect($content).to.be.visible;

        // 检查高度不为 0
        const height = $content.height();
        expect(height).to.be.greaterThan(0);
      });

    // 验证重置按钮现在可见且可交互
    cy.get(this.selectors.resetSettingsButton, { timeout: 5000 })
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');

    return this;
  }

  closeSettings() {
    // 检查重置按钮是否可见，如果可见则需要关闭设置
    cy.get('body').then(($body) => {
      const isButtonVisible = $body.find(this.selectors.resetSettingsButton + ':visible').length > 0;

      if (isButtonVisible) {
        cy.get(this.selectors.settingsCollapsible).click();

        // 等待 CollapsibleContent 完全收起
        cy.get(this.selectors.settingsCollapsible)
          .siblings()
          .filter('[data-state], [data-radix-collapsible-content]')
          .should(($content) => {
            // 检查状态变为 closed（如果有 data-state）
            const state = $content.attr('data-state');
            if (state) {
              expect(state).to.equal('closed');
            }

            // 或者检查元素不可见或高度为 0
            const isVisible = $content.is(':visible');
            const height = $content.height();
            expect(isVisible === false || height === 0).to.be.true;
          });
      }
    });

    return this;
  }

  ensureSettingsOpen() {
    // 首先检查重置按钮是否已经可见
    cy.get('body').then(($body) => {
      const isButtonVisible = $body.find(this.selectors.resetSettingsButton + ':visible').length > 0;

      if (!isButtonVisible) {
        // 如果按钮不可见，点击打开设置
        cy.get(this.selectors.settingsCollapsible).click();

        // 等待 CollapsibleContent 完全展开
        cy.get(this.selectors.settingsCollapsible)
          .siblings()
          .filter('[data-state], [data-radix-collapsible-content]')
          .should(($content) => {
            // 检查各种可能的状态指示器
            const state = $content.attr('data-state');
            if (state) {
              expect(state).to.equal('open');
            }

            // 确保内容可见且有高度
            expect($content).to.be.visible;
            expect($content.height()).to.be.greaterThan(0);
          });
      }
    });

    // 最终确保重置按钮可见且可交互
    cy.get(this.selectors.resetSettingsButton, { timeout: 5000 })
      .should('be.visible')
      .should('not.be.disabled');

    return this;
  }

  setBucketPrice(price: number) {
    this.ensureSettingsOpen();
    cy.get(this.selectors.bucketPriceInput, { timeout: 5000 }).should('be.visible').clear().type(price.toString());
    return this;
  }

  setBucketQuantity(quantity: number) {
    this.ensureSettingsOpen();
    cy.get(this.selectors.bucketQuantityInput, { timeout: 5000 }).should('be.visible').clear().type(quantity.toString());
    return this;
  }

  setSinglePrice(price: number) {
    this.ensureSettingsOpen();
    this.switchToSinglePriceMode();
    cy.get(this.selectors.singlePriceInput, { timeout: 5000 }).should('be.visible').clear().type(price.toString());
    return this;
  }

  setVenue2HoursPrice(price: number) {
    this.ensureSettingsOpen();
    cy.get(this.selectors.venue2HoursInput, { timeout: 5000 }).should('be.visible').clear().type(price.toString());
    return this;
  }

  setVenue3HoursPrice(price: number) {
    this.ensureSettingsOpen();
    cy.get(this.selectors.venue3HoursInput, { timeout: 5000 }).should('be.visible').clear().type(price.toString());
    return this;
  }

  switchToBucketPriceMode() {
    this.ensureSettingsOpen();
    cy.get(this.selectors.bucketModeButton, { timeout: 5000 }).should('be.visible').click();
    cy.get(this.selectors.bucketPriceInput, { timeout: 5000 }).should('be.visible');
    return this;
  }

  switchToSinglePriceMode() {
    this.ensureSettingsOpen();
    cy.get(this.selectors.singleModeButton, { timeout: 5000 }).should('be.visible').click();
    cy.get(this.selectors.singlePriceInput, { timeout: 5000 }).should('be.visible');
    return this;
  }

  resetSettings() {
    this.ensureSettingsOpen();
    cy.get(this.selectors.resetSettingsButton, { timeout: 5000 }).should('be.visible').click();
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