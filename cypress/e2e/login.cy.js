describe("Autenticação", () => {
  beforeEach(() => {
    cy.fixture("usuarios").as("usuarios");
  });



  it("Deve realizar login com sucesso", function () {
    cy.login(
      this.usuarios.usuarioValido.email,
      this.usuarios.usuarioValido.senha
    );

    cy.url().should("include", "/pets");
  });

  it("Não deve realizar login com credenciais inválidas", function () {
    cy.login(
      this.usuarios.usuarioInvalido.email,
      this.usuarios.usuarioInvalido.senha
    );

    cy.contains("E-mail ou senha inválidos").should("be.visible");
  });
});