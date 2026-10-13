const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const sections = document.querySelectorAll('section[id], header[id], footer[id]');
const navLinkByHash = new Map(
    Array.from(navLinks.querySelectorAll('.nav-link')).map((link) => [link.getAttribute('href'), link])
);

const spyObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const link = navLinkByHash.get(`#${entry.target.id}`);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinkByHash.forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    },
    { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => spyObserver.observe(section));

// Gráfico interativo das manchas solares no card do projeto
function desenharGraficoManchas(figura, dados) {
    const W = 400, H = 190, esq = 26, dir = 6, topo = 10, base = 172;
    const anoMin = dados[0][0], anoMax = dados[dados.length - 1][0];
    const valorMax = 300;
    const x = (ano) => esq + ((ano - anoMin) / (anoMax - anoMin)) * (W - esq - dir);
    const y = (v) => base - (v / valorMax) * (base - topo);
    const ns = 'http://www.w3.org/2000/svg';

    const pontos = dados.map(([ano, v]) => `${x(ano).toFixed(1)},${y(v).toFixed(1)}`);
    const pico = dados.reduce((a, b) => (b[1] > a[1] ? b : a));

    const grade = [0, 100, 200, 300].map((v) => `
        <line class="grade" x1="${esq}" x2="${W - dir}" y1="${y(v)}" y2="${y(v)}"/>
        <text class="eixo" x="${esq - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`).join('');
    const anos = [1750, 1800, 1850, 1900, 1950, 2000].map((a) =>
        `<text class="eixo" x="${x(a)}" y="${H - 3}" text-anchor="middle">${a}</text>`).join('');

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.atualizarRotulo = () => svg.setAttribute('aria-label', textos().grafico_aria(anoMin, anoMax, pico[0], pico[1]));
    svg.atualizarRotulo();
    svg.innerHTML = `
        ${grade}${anos}
        <polygon class="area" points="${x(anoMin)},${base} ${pontos.join(' ')} ${x(anoMax)},${base}"/>
        <polyline class="linha" points="${pontos.join(' ')}"/>
        <text class="rotulo-pico" x="${x(pico[0]) - 6}" y="${y(pico[1]) + 4}" text-anchor="end">${pico[0]}</text>
        <line class="mira" y1="${topo}" y2="${base}" visibility="hidden"/>
        <circle class="ponto" r="5" visibility="hidden"/>`;
    figura.appendChild(svg);

    const dica = document.createElement('div');
    dica.className = 'grafico-dica';
    dica.hidden = true;
    figura.appendChild(dica);

    const mira = svg.querySelector('.mira');
    const ponto = svg.querySelector('.ponto');

    function mostrar(ev) {
        const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
        const xSvg = pt.x;
        const ano = Math.round(anoMin + ((xSvg - esq) / (W - esq - dir)) * (anoMax - anoMin));
        const item = dados.find((d) => d[0] === Math.min(anoMax, Math.max(anoMin, ano)));
        if (!item) return;
        const [a, v] = item;
        mira.setAttribute('x1', x(a)); mira.setAttribute('x2', x(a));
        ponto.setAttribute('cx', x(a)); ponto.setAttribute('cy', y(v));
        mira.setAttribute('visibility', 'visible');
        ponto.setAttribute('visibility', 'visible');
        const formato = new Intl.NumberFormat(textos().numero, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        dica.textContent = `${a} · ${formato.format(v)} ${textos().grafico_unidade}`;
        dica.hidden = false;
        const tela = new DOMPoint(x(a), 0).matrixTransform(svg.getScreenCTM());
        const posX = tela.x - figura.getBoundingClientRect().left;
        const largura = dica.offsetWidth;
        dica.style.left = `${Math.min(Math.max(posX - largura / 2, 4), figura.clientWidth - largura - 4)}px`;
    }

    function esconder() {
        mira.setAttribute('visibility', 'hidden');
        ponto.setAttribute('visibility', 'hidden');
        dica.hidden = true;
    }

    svg.addEventListener('pointermove', mostrar);
    svg.addEventListener('pointerdown', mostrar);
    svg.addEventListener('pointerleave', esconder);
}

// Idioma (PT/EN)
const CHAVE_IDIOMA = 'idioma';
let idiomaAtual = 'pt';
const textos = () => TEXTOS_JS[idiomaAtual];
const originais = new Map();

document.querySelectorAll('[data-i18n]').forEach((el) => originais.set(el, { html: el.innerHTML }));
document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const salvo = originais.get(el) || {};
    salvo.attrs = {};
    el.dataset.i18nAttr.split(',').forEach((par) => {
        const [attr] = par.split(':');
        salvo.attrs[attr] = el.getAttribute(attr);
    });
    originais.set(el, salvo);
});

function aplicarIdioma(idioma) {
    idiomaAtual = idioma;
    const en = idioma === 'en';
    document.documentElement.lang = en ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.innerHTML = en ? TRADUCOES_EN[el.dataset.i18n] : originais.get(el).html;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        el.dataset.i18nAttr.split(',').forEach((par) => {
            const [attr, chave] = par.split(':');
            el.setAttribute(attr, en ? TRADUCOES_EN[chave] : originais.get(el).attrs[attr]);
        });
    });

    const botao = document.getElementById('trocaIdioma');
    botao.textContent = textos().botao_idioma;
    botao.setAttribute('aria-label', textos().botao_idioma_aria);
    botao.setAttribute('lang', textos().botao_idioma_lang);

    const svg = document.querySelector('#graficoManchas svg');
    if (svg) svg.atualizarRotulo();
    atualizarFiltro();
}

document.getElementById('trocaIdioma').addEventListener('click', () => {
    const novo = idiomaAtual === 'pt' ? 'en' : 'pt';
    localStorage.setItem(CHAVE_IDIOMA, novo);
    aplicarIdioma(novo);
});

// Tecnologias ligadas aos projetos
const filtroAtivo = document.getElementById('filtroAtivo');
const filtroTexto = document.getElementById('filtroTexto');
const cardsProjeto = document.querySelectorAll('.project-card[data-techs]');
const chipsTech = document.querySelectorAll('.tech-chip[data-tech]');
let techFiltrada = null;

function atualizarFiltro() {
    const usados = [];
    cardsProjeto.forEach((card) => {
        const usa = !techFiltrada || card.dataset.techs.split(' ').includes(techFiltrada.dataset.tech);
        card.classList.toggle('apagado', !usa);
        if (usa) usados.push(card);
    });
    chipsTech.forEach((chip) => chip.setAttribute('aria-pressed', String(chip === techFiltrada)));
    filtroAtivo.hidden = !techFiltrada;
    if (techFiltrada) filtroTexto.innerHTML = textos().filtro(techFiltrada.textContent.trim(), usados.length);
}

chipsTech.forEach((chip) => {
    chip.addEventListener('click', () => {
        techFiltrada = techFiltrada === chip ? null : chip;
        atualizarFiltro();
        if (techFiltrada) document.getElementById('projetos').scrollIntoView({ behavior: 'smooth' });
    });
});

document.getElementById('limparFiltro').addEventListener('click', () => {
    techFiltrada = null;
    atualizarFiltro();
});

const figuraManchas = document.getElementById('graficoManchas');
if (figuraManchas && typeof MANCHAS_ANUAIS !== 'undefined') {
    desenharGraficoManchas(figuraManchas, MANCHAS_ANUAIS);
}

const idiomaInicial = new URLSearchParams(location.search).get('lang') || localStorage.getItem(CHAVE_IDIOMA);
aplicarIdioma(idiomaInicial === 'en' ? 'en' : 'pt');
