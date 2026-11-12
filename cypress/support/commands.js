Cypress.Commands.add("login", (email, senha) => {
  cy.visit("/login");

  cy.get('input[data-cy="login-username"]')
    .type(email, { delay: 300 });

  cy.get('input[data-cy="login-password"]')
    .type(senha, { delay: 300 });
});

