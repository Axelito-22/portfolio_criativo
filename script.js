// Dados das competências (edita à vontade)
const competencias = [
  {
    titulo: "Sobre mim",
    desc: "Sou Axel, um entusiasta de programação com paixao por criar soluções inovadoras.",
  },
  {
    titulo: "Estudos",
    desc: "Cursor Profissional de Programador Informático | Escola Básica e Secundária da Calheta & Programação em Sistemas de Informações | ESTGA - Universidade de Aveiro.",
  },
  {
    titulo: "Estágio",
    desc: "Estágio curricular - Programador Informático | ARDITI | 3 meses",
  },
  {
    titulo: "Projeto de aptidão profissional (PAP)",
    desc: "Website para a organização de jogos desportivos na Ilha da Madeira | Tecnologias: HTML, CSS, JavaScript, Python, flask, MySQL.",
  },
];

// Estado do jogo
let estado = {
  nivel: 0,
  desbloqueios: 0,
  concluido: false,
};

// Desafios de cultura geral
const desafios = [
  {
    titulo: "Desafio 1: Geografia",
    descricao: "Qual é o maior país do mundo em área territorial?",
    tipo: "radio",
    opcoes: ["China", "Estados Unidos", "Rússia", "Canadá"],
    corretaIndex: 2,
  },
  {
    titulo: "Desafio 5: Geografia de Portugal",
    descricao: "Qual é a capital de Portugal?",
    tipo: "radio",
    opcoes: ["Porto", "Lisboa", "Coimbra", "Braga"],
    corretaIndex: 1,
  },
  {
    titulo: "Desafio 9: Música",
    descricao: "Qual é o género musical tradicional português conhecido mundialmente?",
    tipo: "select",
    opcoes: ["Fado", "Samba", "Tango", "Flamenco"],
    corretaIndex: 0,
  },
  {
    titulo: "Desafio 15: Língua",
    descricao: "Quantas letras tem o alfabeto português moderno?",
    tipo: "input",
    placeholder: "Ex.: 26",
    validar: (valor) => valor.trim() === "26",
  },
];

// Elementos
const challengeTitle = document.getElementById("challengeTitle");
const challengeDesc = document.getElementById("challengeDesc");
const challengeContent = document.getElementById("challengeContent");
const submitBtn = document.getElementById("submitBtn");
const skipBtn = document.getElementById("skipBtn");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const skillsGrid = document.getElementById("skillsGrid");
const toast = document.getElementById("toast");
const modalFinal = document.getElementById("modalFinal");

// Inicialização
init();

function init() {
  renderSkillsLocked();
  carregarDesafio(estado.nivel);
  if (submitBtn) submitBtn.addEventListener("click", submeterDesafio);
  if (skipBtn) skipBtn.addEventListener("click", () => avancar(false));
  atualizarProgresso();

  // Delegação de eventos para fechar/recomeçar no modal (mais robusto)
  document.addEventListener("click", (e) => {
    const tgt = e.target;
    if (!tgt) return;

    if (tgt.id === "closeBtn") {
      e.preventDefault();
      fecharModal();
    }
    if (tgt.id === "restartBtn") {
      e.preventDefault();
      reiniciar();
      fecharModal();
    }
  });
}

function renderSkillsLocked() {
  skillsGrid.innerHTML = "";
  competencias.forEach((c, idx) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <h4 class="skill-title">${c.titulo}</h4>
      <p class="skill-body">${c.desc}</p>
      <div class="lock-overlay" data-lock="${idx}">
        <div class="lock-chip">🔒 Bloqueado</div>
      </div>
    `;
    skillsGrid.appendChild(card);
  });
}

function carregarDesafio(i) {
  const d = desafios[i];
  if (!d) {
    finalizar();
    return;
  }
  challengeTitle.textContent = d.titulo;
  challengeDesc.textContent = d.descricao;
  challengeContent.innerHTML = gerarUI(d);
}

function gerarUI(d) {
  switch (d.tipo) {
    case "radio":
      return `
        <div class="radio-group">
          ${d.opcoes
            .map(
              (o, i) => `
            <label class="radio">
              <input type="radio" name="radio" value="${i}"/>
              <span>${o}</span>
            </label>
          `
            )
            .join("")}
        </div>
      `;
    case "input":
      return `<input class="input" id="inp" placeholder="${d.placeholder || ""}" />`;
    case "select":
      return `
        <select class="select" id="sel">
          <option value="" disabled selected>Seleciona...</option>
          ${d.opcoes.map((o, i) => `<option value="${i}">${o}</option>`).join("")}
        </select>
      `;
    default:
      return `<p>Tipo de desafio desconhecido.</p>`;
  }
}

function submeterDesafio() {
  const d = desafios[estado.nivel];
  let correto = false;

  if (d.tipo === "radio") {
    const sel = document.querySelector('input[name="radio"]:checked');
    correto = sel && Number(sel.value) === d.corretaIndex;
  } else if (d.tipo === "input") {
    const v = document.getElementById("inp").value || "";
    correto = d.validar ? d.validar(v) : v.trim().length > 0;
  } else if (d.tipo === "select") {
    const sel = document.getElementById("sel");
    correto = sel && Number(sel.value) === d.corretaIndex;
  }

  avancar(correto);
}

function avancar(correto) {
  if (correto) {
    desbloquearSkill(estado.desbloqueios);
    estado.desbloqueios++;
    showToast("Competência desbloqueada!");
  } else {
    showToast("Tentativa falhou. Ainda assim, a próxima missão aguarda.", 1800);
  }

  estado.nivel++;
  atualizarProgresso();
  carregarDesafio(estado.nivel);
}

function desbloquearSkill(index) {
  const overlay = document.querySelector(`.lock-overlay[data-lock="${index}"]`);
  if (overlay) {
    overlay.classList.add("unlocked");
    overlay.querySelector(".lock-chip").textContent = "✅ Desbloqueado";
  }
}

function atualizarProgresso() {
  const total = desafios.length;
  const percent = Math.min(100, Math.round((estado.nivel / total) * 100));
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% concluído`;
}

function finalizar() {
  estado.concluido = true;
  modalFinal.classList.remove("hidden");
}

function fecharModal() {
  modalFinal.classList.add("hidden");
}

function reiniciar() {
  estado = { nivel: 0, desbloqueios: 0, concluido: false };
  modalFinal.classList.add("hidden");
  renderSkillsLocked();
  carregarDesafio(0);
  atualizarProgresso();
}

function showToast(msg, dur = 1200) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), dur);
}