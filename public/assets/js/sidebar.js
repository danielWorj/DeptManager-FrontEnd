// sidebar-toggle.js
// Place ce fichier dans src/assets/js/
// Puis dans index.html : <script src="assets/js/sidebar-toggle.js" defer></script>

(function () {
  function initSidebarToggle() {
    const toggleBtn = document.querySelector('.layout-menu-toggle');
    const sidebar   = document.querySelector('#layout-menu, .layout-menu, [data-layout-menu]');
    const overlay   = document.getElementById('sidebar-overlay');

    if (!toggleBtn || !sidebar) return;

    // Toggle au clic sur le bouton burger
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleSidebar();
    });

    // Fermer en cliquant sur l'overlay
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Fermer si on redimensionne vers desktop (xl = 1200px)
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1200) {
        closeSidebar();
      }
    });

    function toggleSidebar() {
      const isOpen = document.body.classList.contains('layout-menu-expanded');
      isOpen ? closeSidebar() : openSidebar();
    }

    function openSidebar() {
      document.body.classList.add('layout-menu-expanded');
      sidebar.classList.add('show');
      if (overlay) overlay.style.display = 'block';
    }

    function closeSidebar() {
      document.body.classList.remove('layout-menu-expanded');
      sidebar.classList.remove('show');
      if (overlay) overlay.style.display = 'none';
    }
  }

  // Angular charge le DOM dynamiquement, on attend que le layout soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForLayout);
  } else {
    waitForLayout();
  }

  function waitForLayout() {
    const maxTries = 20;
    let tries = 0;

    const interval = setInterval(function () {
      tries++;
      const toggleBtn = document.querySelector('.layout-menu-toggle');
      if (toggleBtn) {
        clearInterval(interval);
        initSidebarToggle();
      } else if (tries >= maxTries) {
        clearInterval(interval);
        console.warn('[sidebar-toggle] Bouton .layout-menu-toggle introuvable.');
      }
    }, 300);
  }
})();