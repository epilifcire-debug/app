/* ========================= */
/* VARIÁVEIS GLOBAIS */
/* ========================= */
let valorFinalGlobal = 0;

/* ========================= */
/* INICIALIZAÇÃO */
/* ========================= */
document.addEventListener("DOMContentLoaded", () => {

    iniciarSplash();
    iniciarEventos();
    listarClientes();
    iniciarParticulas();
    registrarServiceWorker();

});

/* ========================= */
/* SPLASH CONTROLADA */
/* ========================= */
function iniciarSplash() {
    const splash = document.getElementById("splash");

    if (!splash) return;

    // Garante que a splash saia mesmo se algo falhar
    setTimeout(() => {
        splash.classList.add("fadeOut");

        // Remove totalmente da tela depois da animação
        setTimeout(() => {
            splash.style.display = "none";
        }, 1000);

    }, 3000);
}

/* ========================= */
/* EVENTOS */
/* ========================= */
function iniciarEventos() {

    const form = document.getElementById("formOrcamento");
    const btnPDF = document.getElementById("btnPDF");

    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();
            calcular();
        });
    }

    if (btnPDF) {
        btnPDF.addEventListener("click", gerarPDF);
    }
}

/* ========================= */
/* FUNÇÃO AUXILIAR */
/* ========================= */
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

/* ========================= */
/* CÁLCULO */
/* ========================= */
function calcular() {

    const cliente = getVal("cliente");
    const descricao = getVal("descricao");
    const horas = parseFloat(getVal("horas"));
    const valorHora = parseFloat(getVal("valorHora"));
    const complexidade = parseFloat(getVal("complexidade"));
    const taxaExtra = parseFloat(getVal("taxaExtra")) || 0;

    if (!cliente || !horas || !valorHora) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    valorFinalGlobal = (horas * valorHora) * complexidade + taxaExtra;

    const resultado = document.getElementById("resultado");

    if (resultado) {
        resultado.innerHTML = `
            <h2>Valor Final</h2>
            <h1 style="color:#00ff99">R$ ${valorFinalGlobal.toFixed(2)}</h1>
        `;
    }

    salvarCliente(cliente, descricao, valorFinalGlobal);
}

/* ========================= */
/* HISTÓRICO */
/* ========================= */
function salvarCliente(cliente, descricao, valor) {

    const historico = JSON.parse(localStorage.getItem("clientes")) || [];

    historico.push({
        nome: cliente,
        descricao: descricao,
        valor: valor,
        data: new Date().toLocaleDateString()
    });

    localStorage.setItem("clientes", JSON.stringify(historico));

    listarClientes();
}

function listarClientes() {

    const listaClientes = document.getElementById("listaClientes");
    if (!listaClientes) return;

    const historico = JSON.parse(localStorage.getItem("clientes")) || [];

    let html = "";

    historico.forEach(c => {
        html += `
            <p>
                <strong>${c.nome}</strong> 
                - R$ ${c.valor.toFixed(2)} 
                (${c.data})
            </p>
        `;
    });

    listaClientes.innerHTML = html;
}

/* ========================= */
/* PDF */
/* ========================= */
function gerarPDF() {

    if (valorFinalGlobal === 0) {
        alert("Calcule primeiro o valor.");
        return;
    }

    if (!window.jspdf) {
        alert("Erro ao carregar biblioteca PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("PROPOSTA COMERCIAL - FC TECNOLOGIA", 20, 20);

    doc.setFontSize(12);
    doc.text(`Valor Total: R$ ${valorFinalGlobal.toFixed(2)}`, 20, 40);

    doc.save("proposta.pdf");
}

/* ========================= */
/* PARTÍCULAS */
/* ========================= */
function iniciarParticulas() {

    const canvas = document.getElementById("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const particles = [];

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            speed: Math.random() * 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff99";

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y += p.speed;
            if (p.y > canvas.height) {
                p.y = 0;
                p.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ========================= */
/* SERVICE WORKER */
/* ========================= */
function registrarServiceWorker() {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("Service Worker registrado com sucesso"))
            .catch(err => console.log("Erro ao registrar SW:", err));
    }
}
