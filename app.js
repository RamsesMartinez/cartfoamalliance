/* Cartfoam Alliance Site - Application Logic */

// Register GSAP ScrollTrigger (guarded: si el CDN no cargó, no rompemos todo el archivo)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Velocidad de scroll propia: ScrollTrigger.getVelocity() ESTÁTICO no existe en GSAP 3.12
// (solo en instancias) — el código del diseñador lo llamaba y tronaba en cada frame.
// La rastreamos nosotros para que los efectos de scroll (estrellas + 3D) sí reaccionen.
let __scrollVel = 0;
(function trackScrollVelocity() {
  if (typeof window === 'undefined') return;
  let lastY = window.scrollY, lastT = performance.now();
  window.addEventListener('scroll', () => {
    const y = window.scrollY, t = performance.now(), dt = Math.max(t - lastT, 1);
    __scrollVel = (y - lastY) / dt * 1000; // px/s aprox
    lastY = y; lastT = t;
  }, { passive: true });
  setInterval(() => { __scrollVel *= 0.9; if (Math.abs(__scrollVel) < 1) __scrollVel = 0; }, 100);
})();
function getScrollVelocity() { return __scrollVel; }

// ==========================================
// 1. AWWWARDS SMOOTH SCROLL (LENIS)
// ==========================================
let lenis;
function initSmoothScroll() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential easing
    smoothWheel: true,
    wheelMultiplier: 0.95,
    infinite: false
  });

  // Sync ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ==========================================
// 2. AWWWARDS CUSTOM CURSOR
// ==========================================
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Show custom cursor only on desktop devices
  if (window.innerWidth > 992) {
    cursor.style.display = 'flex';
  } else {
    cursor.style.display = 'none';
    return;
  }

  // Smooth mouse movement tracking using GSAP quickTo
  const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' });
  const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    cursorX(e.clientX);
    cursorY(e.clientY);
  });

  // Hover states on buttons/links
  const hoverElements = document.querySelectorAll('a, button, input, select, label, .radio-label, .social-btn, .material-link');
  hoverElements.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
    });
    elem.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
    });
  });

  // 3D Canvas Drag/View states
  const heroContainer = document.getElementById('hero-canvas-container');
  if (heroContainer) {
    heroContainer.addEventListener('mouseenter', () => {
      cursor.classList.add('view-mode');
      cursor.querySelector('.cursor-text').textContent = 'VER';
    });
    heroContainer.addEventListener('mouseleave', () => {
      cursor.classList.remove('view-mode');
      cursor.querySelector('.cursor-text').textContent = '';
    });
  }

  const boxContainer = document.getElementById('box-canvas-container');
  if (boxContainer) {
    boxContainer.addEventListener('mouseenter', () => {
      cursor.classList.add('drag-mode');
      cursor.querySelector('.cursor-text').textContent = 'ROTAR';
    });
    boxContainer.addEventListener('mouseleave', () => {
      cursor.classList.remove('drag-mode');
      cursor.querySelector('.cursor-text').textContent = '';
    });
  }
}

// ==========================================
// 3. AWWWARDS MAGNETIC BUTTONS EFFECT
// ==========================================
function initMagneticButtons() {
  // Select buttons, links and sliders that should behave magnetically
  const magneticElems = document.querySelectorAll('.nav-link, .btn-primary, .social-btn, .material-link, #download-dieline, #trigger-desarrollo-btn');
  
  magneticElems.forEach(elem => {
    elem.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      // Calculate delta from center
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards cursor
      gsap.to(this, {
        x: x * 0.38,
        y: y * 0.38,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    elem.addEventListener('mouseleave', function() {
      // Spring back elastically
      gsap.to(this, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

// ==========================================
// 4. AWWWARDS SCROLL-TRIGGERED REVEALS
// ==========================================
function initScrollReveals() {
  // Slide-up text reveal lines
  const revealTexts = document.querySelectorAll('.reveal-wrapper');
  revealTexts.forEach(elem => {
    ScrollTrigger.create({
      trigger: elem,
      start: 'top 88%',
      onEnter: () => elem.classList.add('active'),
      once: true
    });
  });

  // Scale/slide up cards and grids
  const revealCards = document.querySelectorAll('.reveal-card');
  revealCards.forEach(elem => {
    ScrollTrigger.create({
      trigger: elem,
      start: 'top 84%',
      onEnter: () => elem.classList.add('active'),
      once: true
    });
  });
}

// ==========================================
// 5. PROCEDURAL TEXTURES GENERATOR
// ==========================================
function createCardboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base kraft con leve degradado
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#c29871');
  grad.addColorStop(1, '#a87c54');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Fibras de papel kraft (más densas y variadas)
  ctx.strokeStyle = 'rgba(120, 85, 55, 0.30)';
  for (let i = 0; i < 450; i++) {
    const y = Math.random() * 256;
    const length = 12 + Math.random() * 50;
    const x = Math.random() * 256;
    ctx.lineWidth = 0.4 + Math.random() * 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo((x + length) % 256, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }

  // Moteado fino del papel
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const val = Math.random();
    ctx.fillStyle = val > 0.5 ? 'rgba(255, 240, 220, 0.06)' : 'rgba(60, 40, 20, 0.06)';
    ctx.fillRect(x, y, 1, 1);
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createFoamTexture(colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 256);

  // Celdas de espuma EPE: muchas burbujas finas con luz y sombra
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 0.4 + Math.random() * 2.0;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.11)' : 'rgba(0, 0, 0, 0.07)';
    ctx.fill();
  }

  // Manchas suaves de variación de tono (aspecto orgánico)
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 8 + Math.random() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// ==========================================
// 6. HERO 3D SCENE (EXPLODING ASSEMBLY)
// ==========================================
let heroScene, heroCamera, heroRenderer, heroBoxGroup;
let heroBaseMesh, heroPinkMesh, heroWhiteMesh, heroBlackMesh, heroLidMesh;

function initHero3D() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;
  
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 500;
  
  // Scene Setup
  heroScene = new THREE.Scene();
  
  // Camera
  heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  heroCamera.position.set(5.5, 4.5, 7.5);
  heroCamera.lookAt(0, 0, 0);
  
  // Renderer
  const canvas = document.getElementById('hero-canvas');
  heroRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  heroRenderer.setSize(width, height);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.shadowMap.enabled = true;
  heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  heroRenderer.outputEncoding = THREE.sRGBEncoding;
  heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  heroRenderer.toneMappingExposure = 1.12;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  heroScene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 12, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.001;
  heroScene.add(dirLight);
  
  const fillLight = new THREE.DirectionalLight(0xffb703, 0.3); // Warm golden light
  fillLight.position.set(-5, 3, -4);
  heroScene.add(fillLight);

  // Luz hemisférica: sombreado suave y realista (cielo cálido arriba, suelo oscuro abajo)
  const hemiLight = new THREE.HemisphereLight(0xfff1d6, 0x140d04, 0.55);
  heroScene.add(hemiLight);
  
  // Textures
  const cardboardTex = createCardboardTexture();
  cardboardTex.wrapS = THREE.RepeatWrapping;
  cardboardTex.wrapT = THREE.RepeatWrapping;
  cardboardTex.repeat.set(2, 2);
  
  const whiteCardboardTex = createCardboardTexture();
  whiteCardboardTex.wrapS = THREE.RepeatWrapping;
  whiteCardboardTex.wrapT = THREE.RepeatWrapping;
  whiteCardboardTex.repeat.set(2, 2);
  
  const pinkFoamTex = createFoamTexture('#ff70a6');
  const whiteFoamTex = createFoamTexture('#ffffff');
  const blackFoamTex = createFoamTexture('#1a1b1e');
  
  // Materials
  const baseMaterial = new THREE.MeshStandardMaterial({
    map: cardboardTex,
    roughness: 0.8,
    bumpMap: cardboardTex,
    bumpScale: 0.02
  });
  
  const lidMaterial = new THREE.MeshStandardMaterial({
    map: whiteCardboardTex,
    color: 0xfafafa,
    roughness: 0.75,
    bumpMap: whiteCardboardTex,
    bumpScale: 0.015
  });
  
  const pinkFoamMat = new THREE.MeshStandardMaterial({
    map: pinkFoamTex,
    roughness: 0.9,
    bumpMap: pinkFoamTex,
    bumpScale: 0.01
  });
  
  const whiteFoamMat = new THREE.MeshStandardMaterial({
    map: whiteFoamTex,
    roughness: 0.9,
    bumpMap: whiteFoamTex,
    bumpScale: 0.01
  });
  
  const blackFoamMat = new THREE.MeshStandardMaterial({
    map: blackFoamTex,
    roughness: 0.95,
    bumpMap: blackFoamTex,
    bumpScale: 0.01
  });

  // Texturas en sRGB + materiales que pueden desvanecerse (para la desintegración en scroll)
  [cardboardTex, whiteCardboardTex, pinkFoamTex, whiteFoamTex, blackFoamTex].forEach(t => { t.encoding = THREE.sRGBEncoding; });
  [baseMaterial, lidMaterial, pinkFoamMat, whiteFoamMat, blackFoamMat].forEach(m => { m.transparent = true; });

  // Base Box Construction (Kraft cardboard base)
  heroBoxGroup = new THREE.Group();
  heroScene.add(heroBoxGroup);
  
  const baseGroup = new THREE.Group();
  const th = 0.06; // thickness
  const bw = 3.0;  // length
  const bl = 2.4;  // width
  const bh = 1.0;  // height
  
  // Bottom wall
  const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(bw, th, bl), baseMaterial);
  bottomWall.position.y = -bh/2 + th/2;
  bottomWall.receiveShadow = true;
  baseGroup.add(bottomWall);
  
  // Left wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(th, bh - th, bl), baseMaterial);
  leftWall.position.set(-bw/2 + th/2, th/2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  baseGroup.add(leftWall);
  
  // Right wall
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(th, bh - th, bl), baseMaterial);
  rightWall.position.set(bw/2 - th/2, th/2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  baseGroup.add(rightWall);
  
  // Front wall
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(bw - th*2, bh - th, th), baseMaterial);
  frontWall.position.set(0, th/2, bl/2 - th/2);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  baseGroup.add(frontWall);
  
  // Back wall
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(bw - th*2, bh - th, th), baseMaterial);
  backWall.position.set(0, th/2, -bl/2 + th/2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  baseGroup.add(backWall);
  
  heroBaseMesh = baseGroup;
  heroBoxGroup.add(heroBaseMesh);
  
  // Helper to create shapes with holes
  function createFoamShape(fw, fl, holesList) {
    const shape = new THREE.Shape();
    const x = -fw/2;
    const y = -fl/2;
    shape.moveTo(x, y);
    shape.lineTo(x + fw, y);
    shape.lineTo(x + fw, y + fl);
    shape.lineTo(x, y + fl);
    shape.lineTo(x, y);
    
    holesList.forEach(h => {
      const path = new THREE.Path();
      if (h.type === 'circle') {
        path.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true);
      } else if (h.type === 'rect') {
        const rx = h.x - h.w/2;
        const ry = h.y - h.h/2;
        path.moveTo(rx, ry);
        path.lineTo(rx + h.w, ry);
        path.lineTo(rx + h.w, ry + h.h);
        path.lineTo(rx, ry + h.h);
        path.lineTo(rx, ry);
      }
      shape.holes.push(path);
    });
    
    return shape;
  }
  
  const extrudeSettings = {
    depth: 0.25,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015
  };
  
  // 1. Pink Foam Mesh (Bottom layer, circular cutouts)
  const pinkHoles = [
    { type: 'circle', x: -0.7, y: -0.6, r: 0.25 },
    { type: 'circle', x: 0.7, y: -0.6, r: 0.25 },
    { type: 'circle', x: -0.7, y: 0.6, r: 0.25 },
    { type: 'circle', x: 0.7, y: 0.6, r: 0.25 },
    { type: 'circle', x: 0, y: 0, r: 0.35 }
  ];
  const pinkShape = createFoamShape(2.8, 2.2, pinkHoles);
  const pinkGeo = new THREE.ExtrudeGeometry(pinkShape, extrudeSettings);
  pinkGeo.center();
  heroPinkMesh = new THREE.Mesh(pinkGeo, pinkFoamMat);
  heroPinkMesh.rotation.x = -Math.PI / 2;
  heroPinkMesh.castShadow = true;
  heroPinkMesh.receiveShadow = true;
  heroBoxGroup.add(heroPinkMesh);
  
  // 2. White Foam Mesh (Middle layer, larger circular cutouts)
  const whiteHoles = [
    { type: 'circle', x: -0.7, y: 0, r: 0.3 },
    { type: 'circle', x: 0.7, y: 0, r: 0.3 },
    { type: 'circle', x: 0, y: -0.6, r: 0.3 },
    { type: 'circle', x: 0, y: 0.6, r: 0.3 }
  ];
  const whiteShape = createFoamShape(2.8, 2.2, whiteHoles);
  const whiteGeo = new THREE.ExtrudeGeometry(whiteShape, extrudeSettings);
  whiteGeo.center();
  heroWhiteMesh = new THREE.Mesh(whiteGeo, whiteFoamMat);
  heroWhiteMesh.rotation.x = -Math.PI / 2;
  heroWhiteMesh.castShadow = true;
  heroWhiteMesh.receiveShadow = true;
  heroBoxGroup.add(heroWhiteMesh);
  
  // 3. Black Foam Mesh (Top layer, grid rectangular cutouts)
  const blackHoles = [];
  const cols = 4;
  const rows = 3;
  const gw = 0.45;
  const gh = 0.4;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      blackHoles.push({
        type: 'rect',
        x: -0.8 + c * 0.53,
        y: -0.5 + r * 0.5,
        w: gw,
        h: gh
      });
    }
  }
  const blackShape = createFoamShape(2.8, 2.2, blackHoles);
  const blackGeo = new THREE.ExtrudeGeometry(blackShape, extrudeSettings);
  blackGeo.center();
  heroBlackMesh = new THREE.Mesh(blackGeo, blackFoamMat);
  heroBlackMesh.rotation.x = -Math.PI / 2;
  heroBlackMesh.castShadow = true;
  heroBlackMesh.receiveShadow = true;
  heroBoxGroup.add(heroBlackMesh);
  
  // Lid Box Construction (White telescoping cover)
  const lidGroup = new THREE.Group();
  const lth = 0.05;
  const lw = 3.12;
  const ll = 2.52;
  const lh = 0.35;
  
  // Top face
  const lidTop = new THREE.Mesh(new THREE.BoxGeometry(lw, lth, ll), lidMaterial);
  lidTop.position.y = lh/2 - lth/2;
  lidTop.castShadow = true;
  lidGroup.add(lidTop);
  
  // Sides
  const lidLeft = new THREE.Mesh(new THREE.BoxGeometry(lth, lh - lth, ll), lidMaterial);
  lidLeft.position.set(-lw/2 + lth/2, -lth/2, 0);
  lidLeft.castShadow = true;
  lidGroup.add(lidLeft);
  
  const lidRight = new THREE.Mesh(new THREE.BoxGeometry(lth, lh - lth, ll), lidMaterial);
  lidRight.position.set(lw/2 - lth/2, -lth/2, 0);
  lidRight.castShadow = true;
  lidGroup.add(lidRight);
  
  const lidFront = new THREE.Mesh(new THREE.BoxGeometry(lw - lth*2, lh - lth, lth), lidMaterial);
  lidFront.position.set(0, -lth/2, ll/2 - lth/2);
  lidFront.castShadow = true;
  lidGroup.add(lidFront);
  
  const lidBack = new THREE.Mesh(new THREE.BoxGeometry(lw - lth*2, lh - lth, lth), lidMaterial);
  lidBack.position.set(0, -lth/2, -ll/2 + lth/2);
  lidBack.castShadow = true;
  lidGroup.add(lidBack);
  
  heroLidMesh = lidGroup;
  heroBoxGroup.add(heroLidMesh);
  
  // Base plane to receive shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.5;
  shadowPlane.receiveShadow = true;
  heroScene.add(shadowPlane);
  
  // Position initial exploded view
  setExplodedState(0);
  
  // Hook up GSAP ScrollTrigger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#inicio',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      invalidateOnRefresh: true
    }
  });
  
  // DESINTEGRACIÓN al hacer scroll: las piezas se dispersan, giran y se desvanecen,
  // revelando la planta (edificio) del fondo — como marca el PDF.
  tl.to(heroBaseMesh.position,  { y: -4.2, x: -1.4, z: 0.6, ease: 'power1.in' }, 0)
    .to(heroPinkMesh.position,  { y: -2.6, x: 1.8, z: 1.1, ease: 'power1.in' }, 0)
    .to(heroWhiteMesh.position, { y: 2.8, x: -2.0, z: -0.7, ease: 'power1.in' }, 0)
    .to(heroBlackMesh.position, { y: 4.6, x: 1.6, z: -1.3, ease: 'power1.in' }, 0)
    .to(heroLidMesh.position,   { y: 6.4, x: -0.8, z: 1.5, ease: 'power1.in' }, 0)
    .to(heroPinkMesh.rotation,  { z: 0.7, ease: 'none' }, 0)
    .to(heroWhiteMesh.rotation, { z: -0.8, ease: 'none' }, 0)
    .to(heroBlackMesh.rotation, { z: 0.6, ease: 'none' }, 0)
    .to(heroBoxGroup.rotation,  { y: Math.PI * 0.4, ease: 'none' }, 0)
    .to(heroBoxGroup.scale,     { x: 0.8, y: 0.8, z: 0.8, ease: 'power1.in' }, 0)
    // se desvanecen las 5 piezas (desintegración)
    .to([pinkFoamMat, whiteFoamMat, blackFoamMat, baseMaterial, lidMaterial], { opacity: 0, ease: 'power2.in' }, 0.3)
    // la planta emerge (edificio de fondo)
    .to('.hero-bg-overlay', { opacity: 1, ease: 'power1.out' }, 0)
    .to('.hero-dark-grad', { opacity: 0.45, ease: 'power1.out' }, 0.1);
  
  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Auto idle floating when scroll is near top
    const scrollY = window.scrollY;
    if (scrollY < 800) {
      const time = Date.now() * 0.001;
      heroBoxGroup.position.y = Math.sin(time * 0.8) * 0.05;
      heroBoxGroup.rotation.y += Math.cos(time * 0.5) * 0.0003;
    }
    
    heroRenderer.render(heroScene, heroCamera);
  }
  
  animate();
  
  // Resize Handler
  window.addEventListener('resize', onHeroResize);
}

function setExplodedState(progress) {
  // Exploded Positions
  heroBaseMesh.position.y = -1.2;
  heroPinkMesh.position.y = -0.3;
  heroWhiteMesh.position.y = 1.0;
  heroBlackMesh.position.y = 2.2;
  heroLidMesh.position.y = 3.6;
  
  heroBoxGroup.rotation.set(Math.PI * 0.05, -Math.PI * 0.12, 0);
}

function onHeroResize() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  heroCamera.aspect = width / height;
  heroCamera.updateProjectionMatrix();
  
  heroRenderer.setSize(width, height);
}

// ==========================================
// 7. CALCULATOR BOX 3D VIEWPORT
// ==========================================
let boxScene, boxCamera, boxRenderer, boxControls, boxGroup;
let cardboardMaterial;

// Default Dimensions (Internal in mm)
let boxLength = 350;
let boxWidth = 250;
let boxHeight = 200;
let fluteType = 'sencilla'; // 'sencilla' or 'doble'

function initBox3D() {
  const container = document.getElementById('box-canvas-container');
  if (!container) return;
  
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 360;
  
  // Scene Setup
  boxScene = new THREE.Scene();
  
  // Camera
  boxCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  boxCamera.position.set(4, 3.5, 5.5);
  boxCamera.lookAt(0, 0, 0);
  
  // Renderer
  const canvas = document.getElementById('box-canvas');
  boxRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  boxRenderer.setSize(width, height);
  boxRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  boxRenderer.shadowMap.enabled = true;
  
  // Controls
  boxControls = new THREE.OrbitControls(boxCamera, boxRenderer.domElement);
  boxControls.enableDamping = true;
  boxControls.dampingFactor = 0.05;
  boxControls.enableZoom = true;
  boxControls.minDistance = 2;
  boxControls.maxDistance = 10;
  boxControls.autoRotate = true;
  boxControls.autoRotateSpeed = 0.5;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  boxScene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(5, 8, 4);
  dirLight.castShadow = true;
  boxScene.add(dirLight);
  
  const fillLight = new THREE.DirectionalLight(0xff9f1c, 0.25);
  fillLight.position.set(-5, 2, -4);
  boxScene.add(fillLight);
  
  // Cardboard Texture
  const cardboardTex = createCardboardTexture();
  cardboardTex.wrapS = THREE.RepeatWrapping;
  cardboardTex.wrapT = THREE.RepeatWrapping;
  cardboardTex.repeat.set(1.5, 1.5);
  
  cardboardMaterial = new THREE.MeshStandardMaterial({
    map: cardboardTex,
    roughness: 0.82,
    bumpMap: cardboardTex,
    bumpScale: 0.015,
    side: THREE.DoubleSide
  });
  
  // Group that holds the custom box
  boxGroup = new THREE.Group();
  boxScene.add(boxGroup);
  
  // Ground Shadow
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.ShadowMaterial({ opacity: 0.15 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.2;
  shadowPlane.receiveShadow = true;
  boxScene.add(shadowPlane);
  
  // Render the initial 3D Box
  update3DBoxModel();
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Slow down/speed up auto rotation based on scroll activity
    const scrollVelocity = getScrollVelocity();
    if (Math.abs(scrollVelocity) > 10) {
      boxControls.autoRotateSpeed = 0.5 + Math.min(Math.abs(scrollVelocity) * 0.001, 1.5);
    } else {
      // Decay back to normal
      boxControls.autoRotateSpeed = boxControls.autoRotateSpeed * 0.95 + 0.5 * 0.05;
    }
    
    boxControls.update();
    
    // Project dimension tags in HTML overlay
    project3DDimensions();
    
    boxRenderer.render(boxScene, boxCamera);
  }
  
  animate();
  
  // Window resizing
  window.addEventListener('resize', onBoxResize);
}

function update3DBoxModel() {
  if (!boxGroup) return;
  
  // Clear previous mesh
  while (boxGroup.children.length > 0) {
    boxGroup.remove(boxGroup.children[0]);
  }
  
  // Scale dimensions to scene space
  const maxDim = Math.max(boxLength, boxWidth, boxHeight) || 1;
  const factor = 2.2 / maxDim;
  const l = (boxLength || 1) * factor;
  const w = (boxWidth || 1) * factor;
  const h = (boxHeight || 1) * factor;
  
  // Build a semi-open cardboard box FEFCO 0201
  const thickness = 0.025; // physical cardboard thickness in 3D
  
  // Group representing the main body
  const bodyGroup = new THREE.Group();
  
  // 1. Bottom Face
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(l, thickness, w), cardboardMaterial);
  bottom.position.y = -h / 2;
  bottom.receiveShadow = true;
  bodyGroup.add(bottom);
  
  // 2. Front Face
  const front = new THREE.Mesh(new THREE.BoxGeometry(l, h - thickness, thickness), cardboardMaterial);
  front.position.set(0, 0, w/2 - thickness/2);
  front.castShadow = true;
  front.receiveShadow = true;
  bodyGroup.add(front);
  
  // 3. Back Face
  const back = new THREE.Mesh(new THREE.BoxGeometry(l, h - thickness, thickness), cardboardMaterial);
  back.position.set(0, 0, -w/2 + thickness/2);
  back.castShadow = true;
  back.receiveShadow = true;
  bodyGroup.add(back);
  
  // 4. Left Face
  const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, h - thickness, w - thickness*2), cardboardMaterial);
  left.position.set(-l/2 + thickness/2, 0, 0);
  left.castShadow = true;
  left.receiveShadow = true;
  bodyGroup.add(left);
  
  // 5. Right Face
  const right = new THREE.Mesh(new THREE.BoxGeometry(thickness, h - thickness, w - thickness*2), cardboardMaterial);
  right.position.set(l/2 - thickness/2, 0, 0);
  right.castShadow = true;
  right.receiveShadow = true;
  bodyGroup.add(right);
  
  // Top flaps (Semi-opened, angle = 45 degrees)
  const flapAngle = Math.PI / 4; // 45 deg
  
  // Front flap
  const topFlapFGroup = new THREE.Group();
  topFlapFGroup.position.set(0, h/2 - thickness, w/2 - thickness);
  const topFlapF = new THREE.Mesh(new THREE.BoxGeometry(l, thickness, w/2), cardboardMaterial);
  topFlapF.position.set(0, 0, w/4);
  topFlapFGroup.add(topFlapF);
  topFlapFGroup.rotation.x = flapAngle;
  bodyGroup.add(topFlapFGroup);
  
  // Back flap
  const topFlapBGroup = new THREE.Group();
  topFlapBGroup.position.set(0, h/2 - thickness, -w/2 + thickness);
  const topFlapB = new THREE.Mesh(new THREE.BoxGeometry(l, thickness, w/2), cardboardMaterial);
  topFlapB.position.set(0, 0, -w/4);
  topFlapBGroup.add(topFlapB);
  topFlapBGroup.rotation.x = -flapAngle;
  bodyGroup.add(topFlapBGroup);
  
  // Left flap
  const topFlapLGroup = new THREE.Group();
  topFlapLGroup.position.set(-l/2 + thickness, h/2 - thickness, 0);
  const topFlapL = new THREE.Mesh(new THREE.BoxGeometry(l/2, thickness, w - thickness*2), cardboardMaterial);
  topFlapL.position.set(-l/4, 0, 0);
  topFlapLGroup.add(topFlapL);
  topFlapLGroup.rotation.z = flapAngle;
  bodyGroup.add(topFlapLGroup);
  
  // Right flap
  const topFlapRGroup = new THREE.Group();
  topFlapRGroup.position.set(l/2 - thickness, h/2 - thickness, 0);
  const topFlapR = new THREE.Mesh(new THREE.BoxGeometry(l/2, thickness, w - thickness*2), cardboardMaterial);
  topFlapR.position.set(l/4, 0, 0);
  topFlapRGroup.add(topFlapR);
  topFlapRGroup.rotation.z = -flapAngle;
  bodyGroup.add(topFlapRGroup);
  
  boxGroup.add(bodyGroup);
  
  // Store factor for projected labels
  boxGroup.userData = { scaleFactor: factor, l, w, h };
}

function onBoxResize() {
  const container = document.getElementById('box-canvas-container');
  if (!container) return;
  
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 360;
  
  boxCamera.aspect = width / height;
  boxCamera.updateProjectionMatrix();
  
  boxRenderer.setSize(width, height);
}

// Projection of 3D dimensions to HTML Overlay
function project3DDimensions() {
  if (!boxGroup || !boxGroup.userData.l) return;
  
  const { l, w, h } = boxGroup.userData;
  const container = document.getElementById('box-canvas-container');
  
  const points = {
    lStart: new THREE.Vector3(-l/2, -h/2, w/2),
    lEnd: new THREE.Vector3(l/2, -h/2, w/2),
    wStart: new THREE.Vector3(l/2, -h/2, -w/2),
    wEnd: new THREE.Vector3(l/2, -h/2, w/2),
    hStart: new THREE.Vector3(l/2, -h/2, w/2),
    hEnd: new THREE.Vector3(l/2, h/2, w/2),
  };
  
  boxScene.updateMatrixWorld();
  const screenPositions = {};
  
  for (let key in points) {
    const vector = points[key].clone();
    vector.applyMatrix4(boxGroup.children[0].matrixWorld);
    vector.project(boxCamera);
    
    const x = (vector.x * .5 + .5) * container.clientWidth;
    const y = (-(vector.y * .5) + .5) * container.clientHeight;
    
    screenPositions[key] = { x, y };
  }
  
  updateDimensionOverlaySVG(screenPositions);
}

function updateDimensionOverlaySVG(pos) {
  let overlay = document.getElementById('dim-overlay-svg');
  if (!overlay) {
    overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.id = 'dim-overlay-svg';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10';
    document.getElementById('box-canvas-container').appendChild(overlay);
  }
  
  overlay.innerHTML = '';
  
  function drawDimLine(start, end, offset, text) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    
    const px = -dy / len;
    const py = dx / len;
    
    const ox = px * offset;
    const oy = py * offset;
    
    const x1 = start.x + ox;
    const y1 = start.y + oy;
    const x2 = end.x + ox;
    const y2 = end.y + oy;
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('stroke', '#ff9f1c');
    g.setAttribute('stroke-width', '1.5');
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    g.appendChild(line);
    
    const ext1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ext1.setAttribute('x1', start.x);
    ext1.setAttribute('y1', start.y);
    ext1.setAttribute('x2', x1 + px * 3);
    ext1.setAttribute('y2', start.y + oy + py * 3);
    ext1.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    ext1.setAttribute('stroke-width', '1');
    g.appendChild(ext1);
    
    const ext2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ext2.setAttribute('x1', end.x);
    ext2.setAttribute('y1', end.y);
    ext2.setAttribute('x2', x2 + px * 3);
    ext2.setAttribute('y2', end.y + oy + py * 3);
    ext2.setAttribute('stroke', 'rgba(255,255,255,0.3)');
    ext2.setAttribute('stroke-width', '1');
    g.appendChild(ext2);
    
    const arrowSize = 6;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    const arrow1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const ax1_1 = x1 + Math.cos(angle + Math.PI/6) * arrowSize;
    const ay1_1 = y1 + Math.sin(angle + Math.PI/6) * arrowSize;
    const ax1_2 = x1 + Math.cos(angle - Math.PI/6) * arrowSize;
    const ay1_2 = y1 + Math.sin(angle - Math.PI/6) * arrowSize;
    arrow1.setAttribute('points', `${x1},${y1} ${ax1_1},${ay1_1} ${ax1_2},${ay1_2}`);
    arrow1.setAttribute('fill', '#ff9f1c');
    g.appendChild(arrow1);
    
    const arrow2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const ax2_1 = x2 - Math.cos(angle + Math.PI/6) * arrowSize;
    const ay2_1 = y2 - Math.sin(angle + Math.PI/6) * arrowSize;
    const ax2_2 = x2 - Math.cos(angle - Math.PI/6) * arrowSize;
    const ay2_2 = y2 - Math.sin(angle - Math.PI/6) * arrowSize;
    arrow2.setAttribute('points', `${x2},${y2} ${ax2_1},${ay2_1} ${ax2_2},${ay2_2}`);
    arrow2.setAttribute('fill', '#ff9f1c');
    g.appendChild(arrow2);
    
    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textNode.setAttribute('x', (x1 + x2) / 2);
    textNode.setAttribute('y', (y1 + y2) / 2 - 8);
    textNode.setAttribute('fill', '#ffffff');
    textNode.setAttribute('font-family', 'Outfit');
    textNode.setAttribute('font-size', '11px');
    textNode.setAttribute('font-weight', '700');
    textNode.setAttribute('text-anchor', 'middle');
    textNode.setAttribute('stroke', 'none');
    textNode.textContent = text;
    
    overlay.appendChild(g);
    overlay.appendChild(textNode);
  }
  
  drawDimLine(pos.lStart, pos.lEnd, 20, `${boxLength} mm`);
  drawDimLine(pos.wStart, pos.wEnd, 20, `${boxWidth} mm`);
  drawDimLine(pos.hStart, pos.hEnd, -25, `${boxHeight} mm`);
}

// ==========================================
// 8. DIELINE SVG GENERATOR & DOWNLOAD (5-PANELS AS PER WEB2.png)
// ==========================================
function generateDieline() {
  const container = document.getElementById('dieline-svg-container');
  if (!container) return;
  
  // Dimensions
  const w_lat = boxWidth;
  const w_len = boxLength;
  const h = boxHeight;
  const f = Math.round(w_lat * 0.2); // flap height (scaled, e.g. 50 when width = 250)
  
  // 5 Columns: Column 1 (Flaps), Column 2 (Posterior), Column 3 (Lateral), Column 4 (Frontal), Column 5 (Lateral)
  const c1 = w_lat;
  const c2 = w_len;
  const c3 = w_lat;
  const c4 = w_len;
  const c5 = w_lat;
  
  const totalWidth = c1 + c2 + c3 + c4 + c5;
  const totalHeight = f + h + f;
  
  // Fit viewport
  const viewWidth = 600;
  const viewHeight = 350;
  const padding = 25;
  
  const scale = Math.min((viewWidth - padding*2) / totalWidth, (viewHeight - padding*2) / (totalHeight || 1));
  const dx = (viewWidth - totalWidth * scale) / 2;
  const dy = (viewHeight - totalHeight * scale) / 2;
  
  // Coordinates (x & y)
  const x0 = 0;
  const x1 = c1;
  const x2 = c1 + c2;
  const x3 = c1 + c2 + c3;
  const x4 = c1 + c2 + c3 + c4;
  const x5 = c1 + c2 + c3 + c4 + c5;
  
  const y0 = 0;
  const y1 = f;
  const y2 = f + h;
  const y3 = f + h + f;
  
  let svgContent = `
    <svg viewBox="0 0 ${viewWidth} ${viewHeight}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${dx}, ${dy}) scale(${scale})">
        <!-- BACKGROUND PANEL GRID -->
        <rect x="-10" y="-10" width="${totalWidth + 20}" height="${totalHeight + 20}" fill="none" stroke="rgba(255,255,255,0.01)" stroke-width="1"/>
        
        <!-- FOLD LINES (Dashed Blue #4fa3e3) -->
        <g stroke="#4fa3e3" stroke-width="2.2" stroke-dasharray="6,6" fill="none">
          <!-- Horizontal fold lines (only inside the body panels of columns 2-5) -->
          <line x1="${x1}" y1="${y1}" x2="${x5}" y2="${y1}" />
          <line x1="${x1}" y1="${y2}" x2="${x5}" y2="${y2}" />
          
          <!-- Column 1 Flap folds -->
          <line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" />
          <line x1="${x0}" y1="${y2}" x2="${x1}" y2="${y2}" />
          
          <!-- Vertical panel folds -->
          <line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" />
          <line x1="${x3}" y1="${y1}" x2="${x3}" y2="${y2}" />
          <line x1="${x4}" y1="${y1}" x2="${x4}" y2="${y2}" />
        </g>
        
        <!-- CUT LINES (Solid Orange #ff9f1c) - Matches layout in WEB2.png -->
        <g stroke="#ff9f1c" stroke-width="2.2" fill="none">
          <!-- Column 1 Flap Superior (Top Left) -->
          <path d="M ${x0},${y1} L ${x0},${y0} L ${x1},${y0} L ${x1},${y1}" />
          <!-- Column 1 Flap Inferior (Bottom Left) -->
          <path d="M ${x0},${y2} L ${x0},${y3} L ${x1},${y3} L ${x1},${y2}" />
          
          <!-- Main Body Panels (Columns 2-5) outer cut boundary -->
          <path d="M ${x1},${y1} L ${x1},${y2} L ${x5},${y2} L ${x5},${y1} Z" />
        </g>
        
        <!-- LABELS - Matching mockup exactly -->
        <g fill="#8a99ad" font-family="Outfit" font-size="12" font-weight="700" text-anchor="middle">
          <!-- Headers at the top of each column -->
          <text x="${x0 + c1/2}" y="${y1 - 18}">FLAP SUPERIOR</text>
          <text x="${x0 + c1/2}" y="${y1 - 4}" font-size="9" fill="rgba(255,255,255,0.45)">${c1} x ${f} mm</text>
          
          <text x="${x1 + c2/2}" y="${y1 - 18}">PANEL POSTERIOR</text>
          <text x="${x1 + c2/2}" y="${y1 - 4}" font-size="9" fill="rgba(255,255,255,0.45)">${c2} x ${h} mm</text>
          
          <text x="${x2 + c3/2}" y="${y1 - 18}">PANEL LATERAL</text>
          <text x="${x2 + c3/2}" y="${y1 - 4}" font-size="9" fill="rgba(255,255,255,0.45)">${c3} x ${h} mm</text>
          
          <text x="${x3 + c4/2}" y="${y1 - 18}">PANEL FRONTAL</text>
          <text x="${x3 + c4/2}" y="${y1 - 4}" font-size="9" fill="rgba(255,255,255,0.45)">${c4} x ${h} mm</text>
          
          <text x="${x4 + c5/2}" y="${y1 - 18}">PANEL LATERAL</text>
          <text x="${x4 + c5/2}" y="${y1 - 4}" font-size="9" fill="rgba(255,255,255,0.45)">${c5} x ${h} mm</text>
          
          <!-- Footer label for Column 1 Flap Inferior -->
          <text x="${x0 + c1/2}" y="${y2 + 20}">FLAP INFERIOR</text>
          <text x="${x0 + c1/2}" y="${y2 + 34}" font-size="9" fill="rgba(255,255,255,0.45)">${c1} x ${f} mm</text>
          
          <!-- Column widths at bottom -->
          <text x="${x1 + c2/2}" y="${y2 + 22}" font-size="10">${c2} mm</text>
          <text x="${x2 + c3/2}" y="${y2 + 22}" font-size="10">${c3} mm</text>
          <text x="${x3 + c4/2}" y="${y2 + 22}" font-size="10">${c4} mm</text>
          <text x="${x4 + c5/2}" y="${y2 + 22}" font-size="10">${c5} mm</text>
        </g>
        
        <!-- TECHNICAL MEASUREMENTS COTAS -->
        <g stroke="rgba(255,255,255,0.2)" stroke-width="1">
          <!-- Total horizontal width dimension -->
          <line x1="${x0}" y1="${y3 + 30}" x2="${x5}" y2="${y3 + 30}" />
          <line x1="${x0}" y1="${y3 + 26}" x2="${x0}" y2="${y3 + 34}" />
          <line x1="${x5}" y1="${y3 + 26}" x2="${x5}" y2="${y3 + 34}" />
          
          <!-- Height dimensions -->
          <line x1="${x5 + 20}" y1="${y1}" x2="${x5 + 20}" y2="${y2}" />
          <line x1="${x5 + 17}" y1="${y1}" x2="${x5 + 23}" y2="${y1}" />
          <line x1="${x5 + 17}" y1="${y2}" x2="${x5 + 23}" y2="${y2}" />
          
          <line x1="${x1 - 15}" y1="${y0}" x2="${x1 - 15}" y2="${y1}" />
          <line x1="${x1 - 18}" y1="${y0}" x2="${x1 - 12}" y2="${y0}" />
          <line x1="${x1 - 18}" y1="${y1}" x2="${x1 - 12}" y2="${y1}" />
        </g>
        
        <g fill="#ffffff" font-family="Outfit" font-size="10" font-weight="700">
          <text x="${x5/2}" y="${y3 + 44}" text-anchor="middle">${totalWidth} mm (TOTAL PLANO)</text>
          <text x="${x5 + 28}" y="${y1 + h/2 + 4}" text-anchor="start">${h} mm</text>
          <text x="${x1 - 24}" y="${y0 + f/2 + 4}" text-anchor="end">${f} mm</text>
        </g>
      </g>
    </svg>
  `;
  
  container.innerHTML = svgContent;
}

function downloadDielineSVG() {
  const w_lat = boxWidth;
  const w_len = boxLength;
  const h = boxHeight;
  const f = Math.round(w_lat * 0.2);
  
  const c1 = w_lat;
  const c2 = w_len;
  const c3 = w_lat;
  const c4 = w_len;
  const c5 = w_lat;
  
  const totalWidth = c1 + c2 + c3 + c4 + c5;
  const totalHeight = f + h + f;
  
  const x0 = 0;
  const x1 = c1;
  const x2 = c1 + c2;
  const x3 = c1 + c2 + c3;
  const x4 = c1 + c2 + c3 + c4;
  const x5 = c1 + c2 + c3 + c4 + c5;
  
  const y0 = 0;
  const y1 = f;
  const y2 = f + h;
  const y3 = f + h + f;
  
  const rawSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Dieline_Cartfoam" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}mm" height="${totalHeight}mm">
  <g id="Info_Cotas" fill="#888888" font-family="Arial" font-size="10">
    <text x="20" y="30">Plano Técnico: Desarrollo de Caja Corrugada (5 Columnas)</text>
    <text x="20" y="45">Medidas: ${w_len} L x ${w_lat} W x ${h} H mm | Flauta: ${fluteType.toUpperCase()}</text>
  </g>
  <g id="Lineas_Doblez" stroke="#0000FF" stroke-width="0.5" stroke-dasharray="3,3" fill="none">
    <line x1="${x1}" y1="${y1}" x2="${x5}" y2="${y1}" />
    <line x1="${x1}" y1="${y2}" x2="${x5}" y2="${y2}" />
    <line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" />
    <line x1="${x0}" y1="${y2}" x2="${x1}" y2="${y2}" />
    <line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" />
    <line x1="${x3}" y1="${y1}" x2="${x3}" y2="${y2}" />
    <line x1="${x4}" y1="${y1}" x2="${x4}" y2="${y2}" />
  </g>
  <g id="Lineas_Corte" stroke="#FF0000" stroke-width="0.5" fill="none">
    <path d="M ${x0},${y1} L ${x0},${y0} L ${x1},${y0} L ${x1},${y1}" />
    <path d="M ${x0},${y2} L ${x0},${y3} L ${x1},${y3} L ${x1},${y2}" />
    <path d="M ${x1},${y1} L ${x1},${y2} L ${x5},${y2} L ${x5},${y1} Z" />
  </g>
</svg>`;
  
  const blob = new Blob([rawSvg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Desarrollo_Cartfoam_${w_len}x${w_lat}x${h}_5columnas.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// 9. CANVAS BACKGROUND (STARS & BLACK HOLES)
// ==========================================
class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
    this.alpha = 0.2 + Math.random() * 0.8;
    this.twinkleSpeed = 0.005 + Math.random() * 0.012;
    this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    this.baseX = this.x;
    this.baseY = this.y;
  }
  
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = 0.6 + Math.random() * 1.4;
  }
  
  update(scrollVelocity, blackHoles) {
    let factor = 1.0;
    if (Math.abs(scrollVelocity) > 10) {
      factor = 1.0 + Math.min(Math.abs(scrollVelocity) * 0.003, 3.0);
    }
    
    this.alpha += this.twinkleSpeed * this.twinkleDirection * factor;
    if (this.alpha > 1) {
      this.alpha = 1;
      this.twinkleDirection = -1;
    } else if (this.alpha < 0.1) {
      this.alpha = 0.1;
      this.twinkleDirection = 1;
    }
    
    let pullX = 0;
    let pullY = 0;
    
    blackHoles.forEach(bh => {
      const dx = bh.x - this.baseX;
      const dy = bh.y - this.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < bh.lensRadius && dist > bh.eventRadius) {
        const force = (bh.lensRadius - dist) / bh.lensRadius * 15;
        pullX -= (dx / dist) * force;
        pullY -= (dy / dist) * force;
      }
    });
    
    this.x = this.baseX + pullX;
    this.y = this.baseY + pullY;
  }
  
  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class BlackHole {
  constructor(xPercent, yPixelOffset, size = 30) {
    this.xPercent = xPercent;
    this.yPixelOffset = yPixelOffset;
    this.size = size;
    this.eventRadius = size;
    this.lensRadius = size * 5.0;
    this.rotationAngle = 0;
    this.x = 0;
    this.y = 0;
    
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      const radius = this.eventRadius * 1.2 + Math.random() * (this.lensRadius - this.eventRadius * 1.2);
      this.particles.push({
        radius: radius,
        angle: Math.random() * Math.PI * 2,
        speed: 0.015 + (1 / radius) * 1.5,
        size: 0.8 + Math.random() * 1.8,
        color: this.getAccretionColor()
      });
    }
  }
  
  getAccretionColor() {
    const colors = [
      'rgba(255, 159, 28, ',
      'rgba(231, 111, 81, ',
      'rgba(255, 112, 166, ',
      'rgba(114, 9, 183, '
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  update(canvas, scrollY, scrollVelocity) {
    this.x = canvas.width * this.xPercent;
    this.y = this.yPixelOffset - scrollY;
    
    let speedFactor = 1.0;
    if (Math.abs(scrollVelocity) > 10) {
      speedFactor = 1.0 + Math.min(Math.abs(scrollVelocity) * 0.005, 4.0);
    }
    
    this.particles.forEach(p => {
      p.angle += p.speed * speedFactor;
      p.radius -= 0.03 * speedFactor;
      if (p.radius <= this.eventRadius) {
        p.radius = this.eventRadius * 1.2 + Math.random() * (this.lensRadius - this.eventRadius * 1.2);
        p.angle = Math.random() * Math.PI * 2;
      }
    });
  }
  
  draw(ctx) {
    const gradientGlow = ctx.createRadialGradient(this.x, this.y, this.eventRadius, this.x, this.y, this.lensRadius);
    gradientGlow.addColorStop(0, 'rgba(255, 159, 28, 0.06)');
    gradientGlow.addColorStop(0.3, 'rgba(255, 112, 166, 0.03)');
    gradientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradientGlow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.lensRadius, 0, Math.PI * 2);
    ctx.fill();
    
    this.particles.forEach(p => {
      const px = this.x + Math.cos(p.angle) * p.radius;
      const py = this.y + Math.sin(p.angle) * p.radius;
      
      let alpha = 0.8;
      if (p.radius < this.eventRadius * 1.5) {
        alpha = (p.radius - this.eventRadius) / (this.eventRadius * 0.5);
      }
      
      ctx.fillStyle = p.color + alpha + ')';
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.fillStyle = '#000000';
    ctx.shadowColor = '#ff9f1c';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.eventRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

let spaceCanvas, spaceCtx, stars = [], blackHoles = [];

function initSpaceBackground() {
  spaceCanvas = document.getElementById('space-canvas');
  if (!spaceCanvas) return;
  
  spaceCtx = spaceCanvas.getContext('2d');
  
  onSpaceResize();
  window.addEventListener('resize', onSpaceResize);
  
  const starCount = 120;
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star(spaceCanvas));
  }
  
  blackHoles.push(new BlackHole(0.85, 1200, 25));
  blackHoles.push(new BlackHole(0.12, 2800, 22));
  blackHoles.push(new BlackHole(0.88, 3800, 28));
  
  function loop() {
    requestAnimationFrame(loop);
    
    const scrollY = window.scrollY;
    const scrollVelocity = getScrollVelocity();
    
    spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
    
    blackHoles.forEach(bh => {
      bh.update(spaceCanvas, scrollY, scrollVelocity);
      bh.draw(spaceCtx);
    });
    
    stars.forEach(star => {
      star.update(scrollVelocity, blackHoles);
      star.draw(spaceCtx);
    });
  }
  
  loop();
}

function onSpaceResize() {
  if (!spaceCanvas) return;
  spaceCanvas.width = window.innerWidth;
  spaceCanvas.height = window.innerHeight;
  stars.forEach(star => star.reset());
}

// ==========================================
// 10. CALCULATOR INTERACTIVITY HANDLERS
// ==========================================
function initCalculator() {
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const fluteRadios = document.getElementsByName('flute');
  const downloadBtn = document.getElementById('download-dieline');
  const triggerBtn = document.getElementById('trigger-desarrollo-btn');
  
  if (!lengthInput || !widthInput || !heightInput) return;
  
  lengthInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val > 1000) val = 1000;
    if (val < 100) val = 100;
    boxLength = val;
    onCalculatorUpdate();
  });
  
  widthInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val > 800) val = 800;
    if (val < 100) val = 100;
    boxWidth = val;
    onCalculatorUpdate();
  });
  
  heightInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value) || 0;
    if (val > 600) val = 600;
    if (val < 80) val = 80;
    boxHeight = val;
    onCalculatorUpdate();
  });
  
  fluteRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      fluteType = e.target.value;
      onCalculatorUpdate();
    });
  });
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadDielineSVG);
  }
  
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      const target = document.getElementById('desarrollo');
      if (target && lenis) {
        lenis.scrollTo(target);
      }
    });
  }
  
  onCalculatorUpdate();
}

function onCalculatorUpdate() {
  update3DBoxModel();
  generateDieline();
}

// ==========================================
// 11. SIDEBAR NAVIGATION & INTERACTIVITY
// ==========================================
function initNavigation() {
  const menuLinks = document.querySelectorAll('.topnav .nav-link');
  const sections = document.querySelectorAll('section, footer');
  const topnav = document.getElementById('topnav');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (menuToggle && topnav) {
    menuToggle.addEventListener('click', () => {
      topnav.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (topnav.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
    
    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        topnav.classList.remove('active');
        menuToggle.querySelector('i').className = 'fa-solid fa-bars';
        
        const targetId = link.getAttribute('href');
        const targetElem = document.querySelector(targetId);
        if (targetElem && lenis) {
          lenis.scrollTo(targetElem);
        }
      });
    });
  }
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 250;
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.clientHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });
    
    menuLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}

// ==========================================
// 12. PDF EXTRAS: materiales "crece al seleccionar" + botón Imprimir
// ==========================================
function initPdfExtras() {
  // "Crece al seleccionar": expandir la tarjeta de material al hacer click
  const cards = document.querySelectorAll('.material-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // no togglear si el clic fue en un enlace
      const isOpen = card.classList.contains('expanded');
      cards.forEach(c => c.classList.remove('expanded'));
      if (!isOpen) card.classList.add('expanded');
    });
  });

  // Botón Imprimir: abre el desarrollo (dieline) generado en una ventana y lanza impresión
  const printBtn = document.getElementById('print-dieline-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const svg = document.querySelector('#dieline-svg-container svg');
      if (!svg) { window.print(); return; }
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write('<!DOCTYPE html><html><head><title>Desarrollo Cartfoam</title></head>' +
        '<body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff">' +
        svg.outerHTML + '</body></html>');
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 250);
    });
  }
}

// ==========================================
// 13. DECORACIÓN "+" ANIMADA (estética blueprint del PDF)
// ==========================================
function initDecoPlus() {
  const spots = [['#inicio', 4], ['#calculadora', 5], ['#desarrollo', 4], ['#materiales', 6], ['#industrias', 4], ['#nosotros', 5]];
  spots.forEach(([sel, n]) => {
    const host = document.querySelector(sel);
    if (!host) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'deco-plus';
      s.textContent = '+';
      s.style.left = (5 + Math.random() * 88) + '%';
      s.style.top = (8 + Math.random() * 82) + '%';
      s.style.fontSize = (10 + Math.random() * 22) + 'px';
      s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      host.appendChild(s);
    }
  });
}

// ==========================================
// INITIALIZATION ON LOAD
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // ponytail: cada init aislado — si uno truena (WebGL/CDN), los demás siguen y la página no queda en blanco
  const run = (name, fn) => { try { fn(); } catch (e) { console.error('[init] ' + name + ' falló:', e); } };
  run('SmoothScroll', initSmoothScroll);
  run('Navigation', initNavigation);
  run('SpaceBackground', initSpaceBackground);
  run('CustomCursor', initCustomCursor);
  run('MagneticButtons', initMagneticButtons);
  run('Hero3D', initHero3D);
  run('Box3D', initBox3D);
  run('Calculator', initCalculator);
  run('ScrollReveals', initScrollReveals);
  run('PdfExtras', initPdfExtras);
  run('DecoPlus', initDecoPlus);

  // Failsafe del texto: si GSAP/ScrollTrigger no está, revela todo de inmediato.
  const revealAll = () => document.querySelectorAll('.reveal-wrapper, .reveal-card')
    .forEach(el => el.classList.add('active'));
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') revealAll();
  // Red de seguridad: revela cualquier elemento ya visible que siga oculto tras 2.5s.
  setTimeout(() => {
    document.querySelectorAll('.reveal-wrapper:not(.active), .reveal-card:not(.active)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
    });
  }, 2500);
});
