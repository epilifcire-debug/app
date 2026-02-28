let valorFinalGlobal = 0;

document.addEventListener("DOMContentLoaded", () => {

setTimeout(()=>{
document.getElementById("splash").classList.add("fadeOut");
},3500);

document.getElementById("formOrcamento").addEventListener("submit", e=>{
e.preventDefault();
calcular();
});

document.getElementById("btnPDF").addEventListener("click", gerarPDF);

listarClientes();
iniciarParticulas();
registrarServiceWorker();
});

function calcular(){
const cliente = getVal("cliente");
const descricao = getVal("descricao");
const horas = parseFloat(getVal("horas"));
const valorHora = parseFloat(getVal("valorHora"));
const complexidade = parseFloat(getVal("complexidade"));
const taxaExtra = parseFloat(getVal("taxaExtra"));

if(!cliente||!horas||!valorHora){alert("Preencha os campos");return;}

valorFinalGlobal=(horas*valorHora)*complexidade+taxaExtra;

document.getElementById("resultado").innerHTML=
`<h2>Valor Final</h2>
<h1 style="color:#00ff99">R$ ${valorFinalGlobal.toFixed(2)}</h1>`;

salvarCliente(cliente,descricao,valorFinalGlobal);
}

function getVal(id){return document.getElementById(id).value;}

function salvarCliente(cliente,descricao,valor){
const historico=JSON.parse(localStorage.getItem("clientes"))||[];
historico.push({nome:cliente,descricao,valor,data:new Date().toLocaleDateString()});
localStorage.setItem("clientes",JSON.stringify(historico));
listarClientes();
}

function listarClientes(){
const historico=JSON.parse(localStorage.getItem("clientes"))||[];
let lista="";
historico.forEach(c=>{
lista+=`<p><strong>${c.nome}</strong> - R$ ${c.valor.toFixed(2)} (${c.data})</p>`;
});
document.getElementById("listaClientes").innerHTML=lista;
}

function gerarPDF(){
if(valorFinalGlobal===0){alert("Calcule primeiro");return;}
const { jsPDF } = window.jspdf;
const doc=new jsPDF();
doc.text("PROPOSTA COMERCIAL - FC TECNOLOGIA",20,20);
doc.text(`Valor Total: R$ ${valorFinalGlobal.toFixed(2)}`,20,40);
doc.save("proposta.pdf");
}

function iniciarParticulas(){
const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const particles=[];
for(let i=0;i<70;i++){
particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3,
speed:Math.random()*1
});
}

function animate(){
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.fillStyle="#00ff99";
particles.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();
p.y+=p.speed;
if(p.y>canvas.height)p.y=0;
});
requestAnimationFrame(animate);
}
animate();
}

function registrarServiceWorker(){
if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}
}