describe("gerenciamento de Pets - retorno nulo", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/pets?*", {
            statusCode: 200,
            body: {
                content: [],
                totalPages: 0,
                number: 0,
            },
        }).as("listarPets");

        cy.visit("/pets");

        cy.wait("@listarPets");
    });


    //valida se o front lida com a ausencia de dados
    it("deve exibir mensagem quando não existem pets cadastrados", () => {

        //encontrar elementos pelo id
        cy.get('[data-cy="mensagem-lista-vazia"]')
            .should("be.visible");


        //encontrar elementos pelo texto
        cy.contains("Nenhum pet encontrado").should("be.visible");

    })


})




describe("gerenciamento de Pets", () => {
    //abre a página de pets com a lista mockada; se logado, salva um token falso no sessionStorage
    const visitarPets = (logado = false) => {
        cy.intercept("GET", "**/pets?*", { fixture: "pets.json" }).as("listarPets");

        cy.visit("/pets", {
            onBeforeLoad(win) {
                if (logado) {
                    win.sessionStorage.setItem("auth_token", "dGVzdGU6dGVzdGU=");
                }
            },
        });

        cy.wait("@listarPets");
    };

    describe("gerenciamento de Pets - com pets cadastrados", () => {
        //smoke test: a página carrega com o essencial
        it("deve exibir filtros e a lista de pets", () => {
            visitarPets();


            cy.get('[data-cy="filtro-nome"]').should("be.visible");

            cy.get('[data-cy="filtro-especie"]').should("be.visible");

            cy.get('[data-cy="filtro-status"]').should("be.visible");

            cy.get('[data-cy="item-pet"]').should("have.length", 2);

            cy.get('[data-cy="item-pet"]').first().within(() => {
                cy.get('[data-cy="pet-nome"]').should("have.text", "Rex");
                cy.get('[data-cy="pet-status"]').should("contain", "Disponível");
                cy.get('[data-cy="pet-detalhes"]').should("contain", "Cachorro").and("contain", "3 anos");
            });
        });

        //usuário deslogado não pode criar, editar ou excluir
        it("não deve exibir ações de cadastro quando deslogado", () => {
            visitarPets();

            cy.get('[data-cy="botao-novo-pet"]').should("not.exist");
            cy.get('[data-cy="botao-editar-pet"]').should("not.exist");
            cy.get('[data-cy="botao-excluir-pet"]').should("not.exist");
        });

        //usuário logado vê as ações e os links apontam para as rotas certas
        it("deve exibir ações de cadastro quando logado", () => {
            visitarPets(true);

            cy.get('[data-cy="botao-novo-pet"]').should("be.visible").and("have.attr", "href", "/pets/new");
            cy.get('[data-cy="botao-editar-pet"]').first().should("have.attr", "href", "/pets/1/edit");
            cy.get('[data-cy="botao-excluir-pet"]').should("have.length", 2);
        });

        //o filtro por nome envia o parâmetro "nome" para a API
        it("deve buscar pets pelo nome", () => {
            visitarPets();

            cy.intercept("GET", "**/pets?*nome=Rex*").as("buscarPorNome");
            cy.get('[data-cy="filtro-nome"]').type("Rex");

            cy.wait("@buscarPorNome").its("request.url").should("include", "nome=Rex");
        });

        //o filtro por espécie envia o parâmetro "especie" para a API
        it("deve filtrar pets pela espécie", () => {
            visitarPets();

            cy.intercept("GET", "**/pets?*especie=Gato*").as("buscarPorEspecie");
            cy.get('[data-cy="filtro-especie"]').type("Gato");

            cy.wait("@buscarPorEspecie").its("request.url").should("include", "especie=Gato");
        });

        //o filtro por status envia o parâmetro "status" para a API
        it("deve filtrar pets pelo status", () => {
            visitarPets();

            cy.intercept("GET", "**/pets?*status=ADOTADO*").as("buscarPorStatus");
            cy.get('[data-cy="filtro-status"]').select("Adotado");

            cy.wait("@buscarPorStatus").its("request.url").should("include", "status=ADOTADO");
        });

        //a paginação pede a próxima página para a API
        it("deve navegar para a próxima página", () => {
            visitarPets();

            cy.get('[data-cy="pagina-atual"]').should("contain", "Página 1 de 2");

            cy.intercept("GET", "**/pets?*page=1*").as("segundaPagina");
            cy.get('[data-cy="botao-pagina-2"]').click();

            cy.wait("@segundaPagina").its("request.url").should("include", "page=1");
        });

        //excluir pede confirmação, chama o DELETE e recarrega a lista
        it("deve excluir um pet após confirmação", () => {
            visitarPets(true);

            cy.intercept("DELETE", "**/pets/1", { statusCode: 204 }).as("excluirPet");
            cy.on("window:confirm", () => true);

            cy.get('[data-cy="botao-excluir-pet"]').first().click();

            cy.wait("@excluirPet");
            cy.wait("@listarPets");
        });

        //se o usuário cancelar a confirmação, nada é excluído
        it("não deve excluir o pet se a confirmação for cancelada", () => {
            visitarPets(true);

            cy.intercept("DELETE", "**/pets/*", cy.spy().as("deleteSpy"));
            cy.on("window:confirm", () => false);

            cy.get('[data-cy="botao-excluir-pet"]').first().click();

            cy.get("@deleteSpy").should("not.have.been.called");
        });
    });

    describe("gerenciamento de Pets - cadastrado de pets", () => {
        //logado: cadastrar um pet novo envia POST e volta para a lista
        it("deve cadastrar um novo pet quando logado", () => {
            visitarPets(true);

            cy.intercept("POST", "**/pets", { statusCode: 201, body: { id: 3 } }).as("criarPet");

            cy.get('[data-cy="botao-novo-pet"]').click();
            cy.location("pathname").should("eq", "/pets/new");
            cy.get('[data-cy="titulo-form-pet"]').should("contain", "Novo Pet");

            cy.get('[data-cy="input-nome"]').type("Bolt");
            cy.get('[data-cy="input-especie"]').type("Cachorro");
            cy.get('[data-cy="input-idade"]').type("4");
            cy.get('[data-cy="botao-salvar-pet"]').click();

            cy.wait("@criarPet").its("request.body").should("deep.equal", {
                nome: "Bolt",
                especie: "Cachorro",
                idade: 4,
            });

            cy.location("pathname").should("eq", "/pets");
            cy.wait("@listarPets");
        });

        //logado: editar carrega os dados do pet, envia PUT e volta para a lista
        it("deve editar um pet quando logado", () => {
            visitarPets(true);

            cy.intercept("GET", "**/pets/1", {
                statusCode: 200,
                body: { id: 1, nome: "Rex", especie: "Cachorro", idade: 3, status: "DISPONIVEL" },
            }).as("buscarPet");
            cy.intercept("PUT", "**/pets/1", { statusCode: 200, body: {} }).as("editarPet");

            cy.get('[data-cy="botao-editar-pet"]').first().click();
            cy.location("pathname").should("eq", "/pets/1/edit");
            cy.wait("@buscarPet");

            cy.get('[data-cy="titulo-form-pet"]').should("contain", "Editar Pet");
            cy.get('[data-cy="input-nome"]').should("have.value", "Rex");
            cy.get('[data-cy="input-especie"]').should("have.value", "Cachorro");
            cy.get('[data-cy="input-idade"]').should("have.value", "3");

            cy.get('[data-cy="input-nome"]').clear().type("Rex Editado");
            cy.get('[data-cy="input-idade"]').clear().type("5");
            cy.get('[data-cy="botao-salvar-pet"]').click();

            cy.wait("@editarPet").its("request.body").should("deep.equal", {
                nome: "Rex Editado",
                especie: "Cachorro",
                idade: 5,
            });

            cy.location("pathname").should("eq", "/pets");
            cy.wait("@listarPets");
        });

        //deslogado: acessar a rota de edição direto redireciona para o login
        it("deve redirecionar para o login ao tentar editar deslogado", () => {
            cy.visit("/pets/1/edit");

            cy.location("pathname").should("eq", "/login");
        });

        //valida se o front lida com erro da API
        it("deve exibir mensagem de erro quando a API falhar", () => {
            cy.intercept("GET", "**/pets?*", { statusCode: 500, body: {} }).as("listarPetsErro");

            cy.visit("/pets");
            cy.wait("@listarPetsErro");

            cy.get('[data-cy="mensagem-erro"]').should("be.visible").and("contain", "Erro ao carregar pets");
        });
    });


});
