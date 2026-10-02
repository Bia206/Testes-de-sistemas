let clientes = []
let pets = []
let produtos = []
let carrinho = []
let slideIndex = 0
let carrosselTimer = null

// ==================== REGRAS DE NEGÓCIO ====================

function criarCliente(dados) {
    const nome = String(dados?.nome ?? '').trim()
    const email = String(dados?.email ?? '').trim()
    const vip = Boolean(dados?.vip)

    if (!nome) throw new Error('Nome inválido')
    if (!email.includes('@')) throw new Error('Email inválido')

    const cliente = { nome, email, vip }
    clientes.push(cliente)
    return cliente
}

function cadastrarPet(dados) {
    const nome = String(dados?.nome ?? '').trim()
    const tipo = String(dados?.tipo ?? '').trim()
    const idade = Number(dados?.idade)

    if (!nome) throw new Error('Pet precisa de nome')
    if (!tipo) throw new Error('Pet precisa de tipo')
    if (!Number.isInteger(idade) || idade < 0) throw new Error('Idade inválida')

    const pet = { nome, tipo, idade }
    pets.push(pet)
    return pet
}

function criarProduto(dados) {
    const nome = String(dados?.nome ?? '').trim()
    const preco = Number(dados?.preco)

    if (!nome) throw new Error('Produto precisa de nome')
    if (!Number.isFinite(preco) || preco <= 0) throw new Error('Preço inválido')

    const produto = { nome, preco }
    produtos.push(produto)
    return produto
}

function adicionarCarrinho(produto) {
    const preco = Number(produto?.preco)

    if (!produto || !Number.isFinite(preco) || preco <= 0) {
        throw new Error('Produto inválido')
    }

    carrinho.push(produto)
    return produto
}

function removerCarrinho() {
    if (carrinho.length === 0) return null
    return carrinho.shift()
}

function listarProdutos() {
    return [...produtos]
}

function calcularTotal(clienteVip = false) {
    let total = carrinho.reduce(
        (soma, produto) => soma + Number(produto.preco),
        0
    )

    if (clienteVip) {
        total *= 0.85
    } else if (total > 100) {
        total *= 0.90
    }

    return Number(total.toFixed(2))
}

function finalizarCompra(clienteVip = false) {
    const total = calcularTotal(clienteVip)
    carrinho = []
    return total
}

function marcarClienteVip(cliente) {
    cliente.vip = true
    return cliente
}

function resetarDados() {
    clientes = []
    pets = []
    produtos = []
    carrinho = []
    slideIndex = 0

    if (carrosselTimer !== null && typeof clearInterval === 'function') {
        clearInterval(carrosselTimer)
        carrosselTimer = null
    }
}

function getEstado() {
    return {
        clientes: [...clientes],
        pets: [...pets],
        produtos: [...produtos],
        carrinho: [...carrinho]
    }
}

// ==================== INTERFACE ====================

function renderClientes() {
    if (typeof document === 'undefined') return

    const lista = document.getElementById('listaClientes')
    if (!lista) return

    lista.innerHTML = ''

    clientes.forEach(cliente => {
        const li = document.createElement('li')
        li.innerText = cliente.nome + ' - ' + cliente.email
        lista.appendChild(li)
    })
}

function renderPets() {
    if (typeof document === 'undefined') return

    const lista = document.getElementById('listaPets')
    if (!lista) return

    lista.innerHTML = ''

    pets.forEach(pet => {
        const li = document.createElement('li')
        li.innerText = pet.nome + ' (' + pet.tipo + ')'
        lista.appendChild(li)
    })
}

function renderProdutos() {
    if (typeof document === 'undefined') return

    const lista = document.getElementById('listaProdutos')
    const select = document.getElementById('produtoSelect')

    if (!lista || !select) return

    lista.innerHTML = ''
    select.innerHTML = ''

    produtos.forEach((produto, index) => {
        const li = document.createElement('li')
        li.innerText = produto.nome + ' - R$ ' + Number(produto.preco).toFixed(2)
        lista.appendChild(li)

        const option = document.createElement('option')
        option.value = index
        option.innerText = produto.nome
        select.appendChild(option)
    })
}

function renderCarrinho() {
    if (typeof document === 'undefined') return

    const lista = document.getElementById('listaCarrinho')
    const total = document.getElementById('total')

    if (!lista || !total) return

    lista.innerHTML = ''

    carrinho.forEach(produto => {
        const li = document.createElement('li')
        li.innerText = produto.nome + ' - R$ ' + Number(produto.preco).toFixed(2)
        lista.appendChild(li)
    })

    total.innerText = calcularTotal().toFixed(2)
}

function criarClienteDaTela() {
    try {
        const nome = document.getElementById('clienteNome')
        const email = document.getElementById('clienteEmail')
        const vip = document.getElementById('clienteVip')

        if (!nome || !email || !vip) return

        criarCliente({
            nome: nome.value,
            email: email.value,
            vip: vip.checked
        })

        renderClientes()
        nome.value = ''
        email.value = ''
        vip.checked = false
    } catch (erro) {
        alert(erro.message)
    }
}

function cadastrarPetDaTela() {
    try {
        const nome = document.getElementById('petNome')
        const tipo = document.getElementById('petTipo')
        const idade = document.getElementById('petIdade')

        if (!nome || !tipo || !idade) return

        cadastrarPet({
            nome: nome.value,
            tipo: tipo.value,
            idade: idade.value
        })

        renderPets()
        nome.value = ''
        tipo.value = ''
        idade.value = ''
    } catch (erro) {
        alert(erro.message)
    }
}

function criarProdutoDaTela() {
    try {
        const nome = document.getElementById('produtoNome')
        const preco = document.getElementById('produtoPreco')

        if (!nome || !preco) return

        criarProduto({
            nome: nome.value,
            preco: preco.value
        })

        renderProdutos()
        nome.value = ''
        preco.value = ''
    } catch (erro) {
        alert(erro.message)
    }
}

function adicionarCarrinhoDaTela() {
    try {
        const select = document.getElementById('produtoSelect')

        if (!select || produtos.length === 0 || select.value === '') {
            throw new Error('Nenhum produto selecionado')
        }

        const produto = produtos[Number(select.value)]
        adicionarCarrinho(produto)
        renderCarrinho()
    } catch (erro) {
        alert(erro.message)
    }
}

function removerCarrinhoDaTela() {
    removerCarrinho()
    renderCarrinho()
}

function finalizarCompraDaTela() {
    try {
        const total = finalizarCompra()
        alert('Compra finalizada: ' + total.toFixed(2))
        renderCarrinho()
    } catch (erro) {
        alert(erro.message)
    }
}

// ==================== CARROSSEL ====================

function nextSlide() {
    slideIndex++
    updateSlide()
    return slideIndex
}

function prevSlide() {
    slideIndex--
    updateSlide()
    return slideIndex
}

function updateSlide() {
    if (typeof document === 'undefined') return slideIndex

    const slides = document.querySelector('.slides')
    const total = document.querySelectorAll('.slide').length

    if (!slides || total === 0) return slideIndex

    if (slideIndex >= total) slideIndex = 0
    if (slideIndex < 0) slideIndex = total - 1

    slides.style.transform = 'translateX(-' + slideIndex * 100 + '%)'
    return slideIndex
}

function iniciarCarrossel(intervalo = 4000) {
    if (carrosselTimer !== null && typeof clearInterval === 'function') {
        clearInterval(carrosselTimer)
    }

    carrosselTimer = setInterval(nextSlide, intervalo)
    return carrosselTimer
}

// Mantém as funções usadas pelo HTML disponíveis no navegador.
if (typeof window !== 'undefined') {
    window.criarCliente = criarClienteDaTela
    window.cadastrarPet = cadastrarPetDaTela
    window.criarProduto = criarProdutoDaTela
    window.adicionarCarrinho = adicionarCarrinhoDaTela
    window.removerCarrinho = removerCarrinhoDaTela
    window.finalizarCompra = finalizarCompraDaTela
    window.nextSlide = nextSlide
    window.prevSlide = prevSlide
    window.iniciarCarrossel = iniciarCarrossel

    iniciarCarrossel()
}

if (typeof module !== 'undefined') {
    module.exports = {
        criarCliente,
        cadastrarPet,
        criarProduto,
        adicionarCarrinho,
        removerCarrinho,
        listarProdutos,
        calcularTotal,
        finalizarCompra,
        marcarClienteVip,
        resetarDados,
        getEstado,
        nextSlide,
        prevSlide,
        updateSlide,
        iniciarCarrossel
    }
}
