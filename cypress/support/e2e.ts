// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import Allure Cypress
import 'allure-cypress'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Disable CSS animations and transitions for faster, more stable tests
Cypress.on('window:before:load', (win) => {
  const css = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }
    
    /* Disable specific animation properties */
    * {
      -webkit-animation-duration: 0s !important;
      -webkit-animation-delay: 0s !important;
      -webkit-transition-duration: 0s !important;
      -webkit-transition-delay: 0s !important;
      -moz-animation-duration: 0s !important;
      -moz-animation-delay: 0s !important;
      -moz-transition-duration: 0s !important;
      -moz-transition-delay: 0s !important;
      -o-animation-duration: 0s !important;
      -o-animation-delay: 0s !important;
      -o-transition-duration: 0s !important;
      -o-transition-delay: 0s !important;
    }
  `

  const style = win.document.createElement('style')
  style.innerHTML = css
  style.setAttribute('data-cypress-disable-animations', '')
  win.document.head.appendChild(style)
})

// Hide fetch/XHR requests from command log
const app = window.top
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}