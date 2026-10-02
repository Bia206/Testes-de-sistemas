const assert = require('node:assert/strict')
const test = require('node:test')

const app = require('./app')

function produto(nome, preco) {
    return { nome, preco }
}

test.beforeEach(() => {
    app.resetarDados()
})

// TESTES DE CLIENTE

test('01 - Deve permitir criar cliente com nome válido', () => {
    const cliente = app.criarCliente({ nome: 'Beatriz', email: 'bia@email.com' })
    assert.equal(cliente.nome, 'Beatriz')
    assert.equal(app.getEstado().clientes.length, 1)
})

test('02 - Não deve permitir cliente com nome vazio', () => {
    assert.throws(() => app.criarCliente({ nome: '', email: 'bia@email.com' }), /Nome inválido/)
    assert.equal(app.getEstado().clientes.length, 0)
})

test('03 - Deve permitir cadastrar cliente com email válido', () => {
    const cliente = app.criarCliente({ nome: 'Beatriz', email: 'bia@email.com' })
    assert.equal(cliente.email, 'bia@email.com')
})

test('04 - Não deve permitir email inválido', () => {
    assert.throws(() => app.criarCliente({ nome: 'Beatriz', email: 'biaemail.com' }), /Email inválido/)
    assert.equal(app.getEstado().clientes.length, 0)
})

test('05 - Deve permitir marcar cliente como VIP', () => {
    const cliente = app.criarCliente({ nome: 'Beatriz', email: 'bia@email.com' })
    app.marcarClienteVip(cliente)
    assert.equal(cliente.vip, true)
})

// TESTES DE PET

test('06 - Deve permitir cadastrar um pet', () => {
    const pet = app.cadastrarPet({ nome: 'Thor', tipo: 'Cachorro', idade: 3 })
    assert.deepEqual(pet, { nome: 'Thor', tipo: 'Cachorro', idade: 3 })
})

test('07 - Pet deve possuir nome obrigatório', () => {
    assert.throws(() => app.cadastrarPet({ nome: '', tipo: 'Cachorro', idade: 3 }), /Pet precisa de nome/)
})

test('08 - Pet deve possuir tipo (cachorro, gato, etc)', () => {
    assert.throws(() => app.cadastrarPet({ nome: 'Thor', tipo: '', idade: 3 }), /Pet precisa de tipo/)
})

test('09 - Pet deve possuir idade válida (número)', () => {
    assert.throws(() => app.cadastrarPet({ nome: 'Thor', tipo: 'Cachorro', idade: 'abc' }), /Idade inválida/)
    const pet = app.cadastrarPet({ nome: 'Thor', tipo: 'Cachorro', idade: 3 })
    assert.equal(typeof pet.idade, 'number')
})

// TESTES DE PRODUTO

test('10 - Deve permitir criar produto com nome', () => {
    const produtoCriado = app.criarProduto({ nome: 'Ração', preco: 50 })
    assert.equal(produtoCriado.nome, 'Ração')
})

test('11 - Produto deve possuir preço maior que zero', () => {
    const produtoCriado = app.criarProduto({ nome: 'Ração', preco: 50 })
    assert.ok(produtoCriado.preco > 0)
})

test('12 - Produto não pode possuir preço negativo', () => {
    assert.throws(() => app.criarProduto({ nome: 'Ração', preco: -10 }), /Preço inválido/)
})

test('13 - Produto deve aparecer na lista de produtos cadastrados', () => {
    app.criarProduto({ nome: 'Ração', preco: 50 })
    const lista = app.listarProdutos()
    assert.equal(lista.length, 1)
    assert.equal(lista[0].nome, 'Ração')
})

// TESTES DE CARRINHO

test('14 - Deve permitir adicionar produto ao carrinho', () => {
    const p = produto('Ração', 50)
    app.adicionarCarrinho(p)
    assert.equal(app.getEstado().carrinho.length, 1)
})

test('15 - Deve permitir remover produto do carrinho', () => {
    const p = produto('Ração', 50)
    app.adicionarCarrinho(p)
    const removido = app.removerCarrinho()
    assert.deepEqual(removido, p)
    assert.equal(app.getEstado().carrinho.length, 0)
})

test('16 - Carrinho deve listar todos os produtos adicionados', () => {
    app.adicionarCarrinho(produto('Ração', 50))
    app.adicionarCarrinho(produto('Brinquedo', 20))
    assert.equal(app.getEstado().carrinho.length, 2)
    assert.deepEqual(app.getEstado().carrinho.map(p => p.nome), ['Ração', 'Brinquedo'])
})

test('17 - Carrinho deve calcular o valor total da compra', () => {
    app.adicionarCarrinho(produto('Ração', 50))
    app.adicionarCarrinho(produto('Brinquedo', 20))
    assert.equal(app.calcularTotal(), 70)
})

// TESTES DE REGRAS DE NEGÓCIO

test('18 - Compra acima de R$100 deve aplicar desconto de 10%', () => {
    app.adicionarCarrinho(produto('Ração', 120))
    assert.equal(app.calcularTotal(), 108)
})

test('19 - Cliente VIP deve receber desconto de 15%', () => {
    app.adicionarCarrinho(produto('Ração', 100))
    assert.equal(app.calcularTotal(true), 85)
})

test('20 - Carrinho não deve aceitar produto com preço igual a zero', () => {
    assert.throws(() => app.adicionarCarrinho(produto('Produto grátis', 0)), /Produto inválido/)
    assert.equal(app.getEstado().carrinho.length, 0)
})

// OUTROS TESTES

test('21 - Carrinho vazio deve retornar total igual a 0', () => {
    assert.equal(app.calcularTotal(), 0)
})

test('22 - Ao finalizar compra o carrinho deve ser limpo', () => {
    app.adicionarCarrinho(produto('Ração', 50))
    const total = app.finalizarCompra()
    assert.equal(total, 50)
    assert.equal(app.getEstado().carrinho.length, 0)
})

test('23 - O carrossel deve trocar automaticamente as imagens', () => {
    let chamada = null
    const originalSetInterval = global.setInterval
    global.setInterval = (fn, tempo) => {
        chamada = { fn, tempo }
        return 'timer-teste'
    }

    try {
        const timer = app.iniciarCarrossel()
        assert.equal(timer, 'timer-teste')
        assert.equal(chamada.tempo, 4000)
        assert.equal(typeof chamada.fn, 'function')
    } finally {
        global.setInterval = originalSetInterval
    }
})

test('24 - Os botões Adicionar / Remover / Finalizar devem funcionar corretamente', () => {
    const p = produto('Ração', 50)

    app.adicionarCarrinho(p)
    assert.equal(app.getEstado().carrinho.length, 1)

    app.removerCarrinho()
    assert.equal(app.getEstado().carrinho.length, 0)

    app.adicionarCarrinho(p)
    app.finalizarCompra()
    assert.equal(app.getEstado().carrinho.length, 0)
})
