// Elementos da interface
const elements = {
  // Navegação
  header: document.querySelector('.site-header'),
  footer: document.querySelector('.site-footer'),
  
  // Filtros e busca
  searchInput: document.getElementById('searchInput'),
  categoryChips: document.getElementById('categoryChips'),
  
  // Conteúdo
  menuGrid: document.getElementById('menuGrid'),
  emptyState: document.getElementById('emptyState'),
  
  // Tema
  themeToggle: document.getElementById('themeToggle'),
  
  // Lightbox
  lightbox: document.getElementById('logoLightbox'),
  lightboxImg: document.getElementById('lightboxImg'),
  footerLogo: document.getElementById('footerLogo'),
  headerLogo: document.getElementById('headerLogo'),
  enlargedLogo: document.getElementById('enlargedLogo'),
  closeLightbox: document.querySelector('.close-lightbox'),
  
  // Ano no rodapé
  yearElement: document.getElementById('year')
};

// Estado da aplicação
const state = {
  menuItems: [],
  categories: ['Tudo'],
  activeCategory: 'Tudo',
  searchQuery: ''
};

// Inicialização
function init() {
  // Carrega os dados do menu
  loadMenuData();
  
  // Configura os eventos
  setupEventListeners();
  
  // Atualiza o ano no rodapé
  updateYear();
}

// Carrega os dados do menu
function loadMenuData() {
  try {
    // Usa os dados embutidos no HTML
    if (window.MENU_DATA && Array.isArray(window.MENU_DATA.items)) {
      state.menuItems = window.MENU_DATA.items;
      
      // Extrai categorias únicas
      extractCategories();
      
      // Renderiza a interface
      renderCategories();
      renderMenuItems();
      
      console.log('Dados do menu carregados com sucesso!', state.menuItems);
    } else {
      throw new Error('Dados do menu não encontrados');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do menu:', error);
    showError('Não foi possível carregar o cardápio. Por favor, recarregue a página.');
  }
}

// Extrai categorias únicas dos itens do menu
function extractCategories() {
  const categorySet = new Set(state.menuItems.map(item => item.category));
  state.categories = ['Tudo', ...Array.from(categorySet).sort()];
}

// Renderiza os botões de categoria
function renderCategories() {
  if (!elements.categoryChips) return;
  
  elements.categoryChips.innerHTML = state.categories
    .map(category => `
      <button class="chip ${state.activeCategory === category ? 'active' : ''}" 
              data-category="${category}">
        ${category}
      </button>
    `)
    .join('');
}

// Renderiza os itens do menu
function renderMenuItems() {
  if (!elements.menuGrid) return;
  
  // Filtra os itens com base na categoria ativa e na busca
  const filteredItems = filterItems();
  
  // Limpa a grade
  elements.menuGrid.innerHTML = '';
  
  // Se não houver itens, mostra o estado vazio
  if (filteredItems.length === 0) {
    elements.emptyState.classList.remove('hidden');
    return;
  }
  
  // Esconde o estado vazio
  elements.emptyState.classList.add('hidden');
  
  // Adiciona os itens à grade
  filteredItems.forEach(item => {
    const card = createMenuItemCard(item);
    elements.menuGrid.appendChild(card);
  });
}

// Filtra os itens com base na categoria ativa e na busca
function filterItems() {
  return state.menuItems.filter(item => {
    // Filtra por categoria
    const matchesCategory = state.activeCategory === 'Tudo' || 
                          item.category === state.activeCategory;
    
    // Filtra por busca
    const matchesSearch = !state.searchQuery || 
                         item.name.toLowerCase().includes(state.searchQuery) ||
                         (item.description && item.description.toLowerCase().includes(state.searchQuery)) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(state.searchQuery)));
    
    return matchesCategory && matchesSearch;
  });
}

// Cria um card de item do menu
function createMenuItemCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  
  // Formata o preço
  const price = formatPrice(item.price);
  
  // Cria o HTML do card
  card.innerHTML = `
    <div class="card-content">
      <div class="card-header">
        <h3 class="card-title">${item.name} ${item.emoji || ''}</h3>
        <span class="card-price">${price}</span>
      </div>
      ${item.description ? `<p class="card-description">${item.description}</p>` : ''}
      ${item.tags && item.tags.length > 0 ? `
        <div class="card-tags">
          ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  return card;
}

// Formata o preço para o formato brasileiro
function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

// Configura os event listeners
function setupEventListeners() {
  // Busca
  if (elements.searchInput) {
    let searchTimeout;
    
    elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderMenuItems();
      }, 300);
    });
  }
  
  // Filtros de categoria
  if (elements.categoryChips) {
    elements.categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      
      const category = chip.dataset.category;
      if (!category) return;
      
      state.activeCategory = category;
      renderCategories();
      renderMenuItems();
      
      // Rola para a seção de cardápio
      document.querySelector('.menu-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Lightbox
  if (elements.footerLogo) {
    elements.footerLogo.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(elements.footerLogo.src);
    });
  }
  
  if (elements.lightbox) {
    elements.lightbox.addEventListener('click', (e) => {
      if (e.target === elements.lightbox) {
        closeLightbox();
      }
    });
  }
  
  // Fechar lightbox com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
  
  // Lightbox do Logo
  if (elements.headerLogo && elements.lightbox && elements.enlargedLogo && elements.closeLightbox) {
    // Abrir lightbox ao clicar no logo do cabeçalho
    elements.headerLogo.addEventListener('click', (e) => {
      e.preventDefault();
      elements.enlargedLogo.src = 'Gemini_Generated_Image_1t5ygt1t5ygt1t5y.png';
      elements.lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    });

    // Fechar lightbox ao clicar no X
    elements.closeLightbox.addEventListener('click', () => {
      elements.lightbox.classList.remove('show');
      document.body.style.overflow = 'auto';
    });

    // Fechar lightbox ao clicar fora da imagem
    elements.lightbox.addEventListener('click', (e) => {
      if (e.target === elements.lightbox) {
        elements.lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.lightbox.classList.contains('show')) {
        elements.lightbox.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Lightbox do logo do rodapé
  if (elements.footerLogo) {
    elements.footerLogo.addEventListener('click', (e) => {
      e.preventDefault();
      elements.enlargedLogo.src = 'Gemini_Generated_Image_1t5ygt1t5ygt1t5y.png';
      elements.lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }
}

// Alterna entre tema claro e escuro
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Atualiza o atributo data-theme
  html.setAttribute('data-theme', newTheme);
  
  // Atualiza o ícone do botão
  const themeIcon = document.getElementById('themeToggle');
  themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Salva a preferência do usuário
  localStorage.setItem('theme', newTheme);
}

// Verifica o tema salvo ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  html.setAttribute('data-theme', savedTheme);
  
  // Define o ícone correto do botão
  const themeIcon = document.getElementById('themeToggle');
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  
  // Adiciona o evento de clique ao botão de tema
  themeIcon.addEventListener('click', toggleTheme);
});

// Atualiza o ano no rodapé
function updateYear() {
  if (elements.yearElement) {
    elements.yearElement.textContent = new Date().getFullYear();
  }
}

// Abre o lightbox com uma imagem
function openLightbox(imageSrc) {
  if (!elements.lightbox || !elements.lightboxImg) return;
  
  elements.lightboxImg.src = imageSrc;
  elements.lightbox.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

// Fecha o lightbox
function closeLightbox() {
  if (!elements.lightbox) return;
  
  elements.lightbox.classList.remove('visible');
  document.body.style.overflow = '';
  
  // Limpa o src da imagem após a animação
  setTimeout(() => {
    if (elements.lightboxImg) {
      elements.lightboxImg.removeAttribute('src');
    }
  }, 300);
}

// Exibe uma mensagem de erro
function showError(message) {
  console.error(message);
  
  if (!elements.menuGrid) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  elements.menuGrid.innerHTML = '';
  elements.menuGrid.appendChild(errorDiv);
  
  // Estilos inline para garantir que o erro seja visível
  errorDiv.style.padding = '20px';
  errorDiv.style.background = '#ffebee';
  errorDiv.style.color = '#c62828';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.textAlign = 'center';
  errorDiv.style.gridColumn = '1 / -1';
}

// Inicializa a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
