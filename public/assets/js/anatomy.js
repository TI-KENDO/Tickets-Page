function setupAnatomyComponent() {
  // ---------- Callout Highlight ----------
  const callouts = document.querySelectorAll('.callout[data-target]');
  callouts.forEach(callout => {
    const target = callout.dataset.target;
    const section = document.querySelector(`[data-section="${target}"]`);
    if (!section) return;

    callout.addEventListener('mouseenter', () => {
      section.classList.add('highlighted');
    });
    callout.addEventListener('mouseleave', () => {
      section.classList.remove('highlighted');
    });
  });

  // ---------- Category Grid & Form Demo ----------
  const area = document.getElementById('categoria-area');
  const emitirBtn = document.getElementById('emitir-btn');
  const tituloInput = document.getElementById('titulo');
  const descTextarea = document.getElementById('desc');
  const charcountEl = document.getElementById('charcount');
  const fileInput = document.getElementById('file-input');
  const fileLabel = document.getElementById('file-label');

  if (!area) return;

  const DATA = {
    computadora: { label: 'Computadora', icon: 'bi-pc-display' },
    celular: {
      label: 'Celular',
      icon: 'bi-phone',
      children: {
        internet: {
          label: 'Internet',
          icon: 'bi-globe',
          color: 'green',
          children: {
            datos: { label: 'Se me acabaron los datos' },
            clave: { label: 'Quiero saber la clave del internet' },
            senal: { label: 'No hay señal' },
            wifi: { label: 'No me conecta al wifi' },
            otro: { label: 'Otro' },
          },
        },
        software: {
          label: 'Software',
          icon: 'bi-grid',
          color: 'green',
          children: {
            lento: { label: 'El celular está muy lento' },
            cuelga: { label: 'Una app se cierra sola' },
            actualiza: { label: 'No actualiza el sistema' },
            otro: { label: 'Otro' },
          },
        },
        hardware: {
          label: 'Hardware',
          icon: 'bi-cpu',
          color: 'green',
          children: {
            pantalla: { label: 'Pantalla dañada' },
            bateria: { label: 'Batería no carga' },
            boton: { label: 'Botón físico no responde' },
            otro: { label: 'Otro' },
          },
        },
      },
    },
    tablet: { label: 'Tablet/iPad', icon: 'bi-tablet' },
    impresora: { label: 'Impresora', icon: 'bi-printer' },
    accesorios: { label: 'Accesorios', icon: 'bi-usb-plug' },
    drones: { label: 'Drones, Cámaras', icon: 'bi-camera' },
    prestamo: { label: 'Préstamo Accesorio', icon: 'bi-geo-alt' },
    otros: { label: 'Otros', icon: 'bi-tag' },
  };

  const PILL_COLORS = ['blue', 'green', 'amber'];
  let path = [];
  let finalized = false;

  function currentLevel() {
    let node = { children: DATA };
    for (const step of path) {
      node = node.children[step.key];
    }
    return node;
  }

  function render() {
    area.innerHTML = '';

    if (finalized) {
      renderSummary();
      return;
    }

    if (path.length) {
      const trail = document.createElement('div');
      trail.className = 'trail';
      path.forEach((step, i) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'pill ' + PILL_COLORS[i % PILL_COLORS.length];
        pill.innerHTML = (step.icon ? `<i class="bi ${step.icon}"></i> ` : '') + step.label.toUpperCase();
        pill.onclick = () => { path = path.slice(0, i + 1); render(); };
        trail.appendChild(pill);
      });
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'pill ghost';
      back.innerHTML = '<i class="bi bi-arrow-left"></i> Regresar';
      back.onclick = () => { path.pop(); render(); updateEmitirState(); };
      trail.appendChild(back);
      area.appendChild(trail);
    }

    const level = currentLevel();
    const options = level.children || DATA;
    const isLeafLevel = path.length > 0 && !Object.values(options)[0].children;

    const grid = document.createElement('div');
    grid.className = 'cat-grid step';
    Object.entries(options).forEach(([key, item]) => {
      const card = document.createElement('div');
      card.className = 'cat-card' + (isLeafLevel ? ' leaf-tag' : '');
      card.innerHTML = `
        <div class="cat-icon"><i class="bi ${item.icon || 'bi-tag'}"></i></div>
        <div class="cat-label">${item.label.toUpperCase()}</div>
      `;
      card.onclick = () => selectOption(key, item);
      grid.appendChild(card);
    });
    area.appendChild(grid);
  }

  function selectOption(key, item) {
    path.push({ key, label: item.label, icon: item.icon });
    if (item.children) {
      render();
    } else {
      finalized = true;
      render();
    }
    updateEmitirState();
  }

  function renderSummary() {
    const trail = document.createElement('div');
    trail.className = 'trail';
    path.forEach((step, i) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'pill ' + PILL_COLORS[i % PILL_COLORS.length];
      pill.innerHTML = (step.icon ? `<i class="bi ${step.icon}"></i> ` : '') + step.label.toUpperCase();
      pill.onclick = () => { finalized = false; path = path.slice(0, i + 1); render(); };
      trail.appendChild(pill);
    });
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'pill ghost';
    reset.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i> Reiniciar';
    reset.onclick = () => { finalized = false; path = []; render(); updateEmitirState(); };
    trail.appendChild(reset);
    area.appendChild(trail);

    const box = document.createElement('div');
    box.className = 'selected-box step';
    box.innerHTML = `
      <div class="selected-box-left">
        <div class="icon-circle"><i class="bi ${path[path.length - 1].icon || 'bi-tag'}"></i></div>
        <div>
          <div class="sel-title">Categoría seleccionada</div>
          <div class="sel-path">${path.map(p => p.label.toUpperCase()).join(' › ')}</div>
        </div>
      </div>
      <button class="btn" type="button" id="cambiar-btn">Cambiar</button>
    `;
    area.appendChild(box);
    const cambiarBtn = document.getElementById('cambiar-btn');
    if (cambiarBtn) {
      cambiarBtn.onclick = () => { finalized = false; render(); };
    }
  }

  if (descTextarea && charcountEl) {
    descTextarea.addEventListener('input', e => {
      charcountEl.textContent = e.target.value.length;
    });
  }

  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', e => {
      const n = e.target.files.length;
      fileLabel.textContent = n
        ? n + (n === 1 ? ' archivo seleccionado' : ' archivos seleccionados')
        : 'Haz clic para seleccionar archivos';
    });
  }

  if (tituloInput) {
    tituloInput.addEventListener('input', updateEmitirState);
  }

  function updateEmitirState() {
    if (!emitirBtn) return;
    const ok = tituloInput && tituloInput.value.trim().length > 0 && path.length > 0;
    emitirBtn.disabled = !ok;
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAnatomyComponent);
} else {
  setupAnatomyComponent();
}
document.addEventListener('astro:page-load', setupAnatomyComponent);
