/* =========================================
   FC TECNOLOGIA - APP.JS FINAL PRODUÇÃO
========================================= */

let valorFinalGlobal = 0;

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener("DOMContentLoaded", () => {

    iniciarSplash();
    iniciarEventos();
    listarClientes();
    iniciarParticulas();
    registrarServiceWorker();

});

/* =========================
   SPLASH SEGURA
========================= */
function iniciarSplash() {
    const splash = document.getElementById("splash");
    if (!splash) return;

    setTimeout(() => {
        splash.classList.add("fadeOut");

        setTimeout(() => {
            splash.style.display = "none";
        }, 1000);

    }, 3000);
}

/* =========================
   EVENTOS
========================= */
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

/* =========================
   UTIL
========================= */
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

/* =========================
   CÁLCULO
========================= */
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
            <h1 style="color:#00ff99">
                R$ ${valorFinalGlobal.toFixed(2)}
            </h1>
        `;
    }

    salvarCliente(cliente, descricao, valorFinalGlobal);
}

/* =========================
   HISTÓRICO
========================= */
function salvarCliente(cliente, descricao, valor) {

    const historico = JSON.parse(localStorage.getItem("clientes")) || [];

    historico.push({
        nome: cliente,
        descricao,
        valor,
        data: new Date().toLocaleDateString()
    });

    localStorage.setItem("clientes", JSON.stringify(historico));

    listarClientes();
}

function listarClientes() {

    const lista = document.getElementById("listaClientes");
    if (!lista) return;

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

    lista.innerHTML = html;
}

/* =========================
   PDF PREMIUM
========================= */
async function gerarPDF() {

    if (valorFinalGlobal === 0) {
        alert("Calcule primeiro o valor.");
        return;
    }

    const cliente = getVal("cliente");
    const descricao = getVal("descricao");
    const horas = parseFloat(getVal("horas"));
    const valorHora = parseFloat(getVal("valorHora"));
    const complexidade = parseFloat(getVal("complexidade"));
    const taxaExtra = parseFloat(getVal("taxaExtra")) || 0;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    /* Numeração automática */
    let numeroProposta = localStorage.getItem("numeroProposta") || 1;
    localStorage.setItem("numeroProposta", parseInt(numeroProposta) + 1);
    const numeroFormatado = String(numeroProposta).padStart(4, "0");

    /* Logo */
    const logoBase64 = await carregarImagemBase64("logo-horizontal.png");
    doc.addImage(logoBase64, "PNG", 20, 15, 60, 20);

    /* Cabeçalho */
    doc.setFontSize(16);
    doc.text("PROPOSTA COMERCIAL", pageWidth - 20, 20, { align: "right" });

    doc.setFontSize(10);
    doc.text(`Proposta Nº: ${numeroFormatado}`, pageWidth - 20, 28, { align: "right" });
    doc.text(`Data: ${new Date().toLocaleDateString()}`, pageWidth - 20, 34, { align: "right" });

    doc.line(20, 45, pageWidth - 20, 45);

    /* Cliente */
    doc.setFontSize(12);
    doc.text("Cliente:", 20, 60);
    doc.setFont(undefined, "bold");
    doc.text(cliente, 20, 68);
    doc.setFont(undefined, "normal");

    /* Descrição */
    doc.text("Descrição do Projeto:", 20, 85);
    const descricaoLines = doc.splitTextToSize(descricao, pageWidth - 40);
    doc.text(descricaoLines, 20, 95);

    /* Bloco de valores */
    let y = 120;

    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, pageWidth - 40, 50, "F");

    doc.setFontSize(11);
    doc.text("Horas estimadas:", 25, y + 12);
    doc.text(String(horas), pageWidth - 25, y + 12, { align: "right" });

    doc.text("Valor por hora:", 25, y + 22);
    doc.text(`R$ ${valorHora.toFixed(2)}`, pageWidth - 25, y + 22, { align: "right" });

    doc.text("Complexidade:", 25, y + 32);
    doc.text(String(complexidade), pageWidth - 25, y + 32, { align: "right" });

    doc.text("Taxa adicional:", 25, y + 42);
    doc.text(`R$ ${taxaExtra.toFixed(2)}`, pageWidth - 25, y + 42, { align: "right" });

    /* Total */
    y += 70;

    doc.setFillColor(0, 200, 83);
    doc.rect(20, y, pageWidth - 40, 20, "F");

    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.text(`VALOR TOTAL: R$ ${valorFinalGlobal.toFixed(2)}`, pageWidth / 2, y + 13, { align: "center" });

    doc.setTextColor(0);

    /* Condições */
    y += 40;

    doc.setFontSize(11);
    doc.text("Condições Comerciais:", 20, y);
    doc.text("- Prazo de entrega: A combinar", 20, y + 10);
    doc.text("- Validade da proposta: 7 dias", 20, y + 18);
    doc.text("- Pagamento: 50% início / 50% entrega", 20, y + 26);

    /* Assinatura */
    y += 50;

    doc.line(20, y, 100, y);
    doc.setFontSize(10);
    doc.text("Eric Filipe", 20, y + 6);
    doc.text("FC Tecnologia", 20, y + 12);

    /* Rodapé */
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("FC Tecnologia - Soluções Digitais Inteligentes", pageWidth / 2, 285, { align: "center" });

    doc.save(`Proposta_${numeroFormatado}_${cliente}.pdf`);
}

/* =========================
   CARREGAR IMAGEM
========================= */
function carregarImagemBase64(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
    });
}

/* =========================
   PARTÍCULAS
========================= */
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

/* =========================
   SERVICE WORKER
========================= */
function registrarServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}
