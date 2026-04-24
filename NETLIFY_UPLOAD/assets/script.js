// Gestiona las interacciones compartidas del sitio: navegacion, idioma, formularios y accesos rapidos.
document.addEventListener('DOMContentLoaded',()=>{
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const body = document.body;
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  let navOverlay = document.querySelector('.mobile-nav-overlay');
  if(!navOverlay){
    navOverlay = document.createElement('div');
    navOverlay.className = 'mobile-nav-overlay';
    document.body.appendChild(navOverlay);
  }

  // Controla el menu movil y el estado visual de la navegacion principal.
  function setMenuState(isOpen){
    if(!mainNav || !menuToggle) return;
    mainNav.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    body.classList.toggle('nav-open', isOpen);
    if(navOverlay) navOverlay.classList.toggle('active', isOpen);

    if(isOpen){
      // small delay so the nav container slide-in happens before links fade-in (stagger)
      setTimeout(()=> mainNav.classList.add('links-visible'), 40);
    } else {
      // remove links-visible immediately so they fade out, keep open removal to preserve slide-out timing
      mainNav.classList.remove('links-visible');
      document.querySelectorAll('.dropdown.open').forEach(drop=>{
        drop.classList.remove('open');
        const toggle = drop.querySelector('.dropdown-toggle');
        if(toggle) toggle.setAttribute('aria-expanded','false');
      });
    }
  }

  menuToggle?.addEventListener('click', ()=>{
    const isOpen = !mainNav.classList.contains('open');
    setMenuState(isOpen);
  });

  navOverlay?.addEventListener('click', ()=> setMenuState(false));

  // Activa los submenus en pantallas tactiles o pequenas.
  document.querySelectorAll('.dropdown-toggle').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const dropdown = btn.closest('.dropdown');
      if(!dropdown) return;
      const isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Mantiene la experiencia de hover en escritorio sin afectar moviles.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(canHover){
    document.querySelectorAll('.dropdown').forEach(dropdown=>{
      const toggle = dropdown.querySelector('.dropdown-toggle');
      dropdown.addEventListener('mouseenter', ()=>{
        dropdown.classList.add('open');
        if(toggle) toggle.setAttribute('aria-expanded', 'true');
      });
      dropdown.addEventListener('mouseleave', ()=>{
        if(dropdown.matches(':focus-within')) return;
        dropdown.classList.remove('open');
        if(toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Desplaza suavemente a secciones internas sin romper enlaces entre paginas.
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click', e=>{
      const href = link.getAttribute('href');
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(mainNav.classList.contains('open')){
        setMenuState(false);
      }
    });
  });

  // Cierra el menu movil al elegir cualquier enlace de navegacion.
  mainNav?.addEventListener('click', (e)=>{
    const link = e.target.closest('a');
    if(!link) return;
    if(mainNav.classList.contains('open')){
      setMenuState(false);
    }
  });

  // Refuerza el cierre del menu cuando el enlace contiene spans animados.
  document.querySelectorAll('.main-nav .nav-link, .main-nav .dropdown-item').forEach(link=>{
    link.addEventListener('click', ()=>{
      if(mainNav?.classList.contains('open')){
        setMenuState(false);
      }
    });
  });

  // Marca la pagina actual en la barra de navegacion.
  function setActiveByPath(){
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav .nav-link').forEach(link=>{
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if(href === current || (href === 'index.html' && (current === '' || current === 'index.html'))){
        link.classList.add('active');
      }
    });
  }
  setActiveByPath();

  // Aplica textos bilingues y placeholders segun el idioma activo.
  const langToggle = document.getElementById('lang-toggle');
  const i18nTargets = document.querySelectorAll('[data-i18n]');
  const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
  const supportedLangs = ['en', 'es'];

  function applyLanguage(lang){
    const next = supportedLangs.includes(lang) ? lang : 'en';
    document.documentElement.lang = next;

    if(langToggle){
      langToggle.textContent = next === 'en' ? 'ES' : 'EN';
      langToggle.setAttribute('aria-label', next === 'en' ? 'Switch to Spanish' : 'Switch to English');
    }

    i18nTargets.forEach(el=>{
      const value = el.dataset[next];
      if(value !== undefined){
        el.innerHTML = value;
      }
    });

    i18nPlaceholders.forEach(el=>{
      const placeholder = next === 'en' ? el.dataset.placeholderEn : el.dataset.placeholderEs;
      if(placeholder !== undefined){
        el.setAttribute('placeholder', placeholder);
      }
    });

    document.querySelectorAll('[data-aria-en], [data-aria-es]').forEach(el=>{
      const value = next === 'en' ? el.dataset.ariaEn : el.dataset.ariaEs;
      if(value !== undefined){
        el.setAttribute('aria-label', value);
      }
    });

    document.querySelectorAll('[data-title-en], [data-title-es]').forEach(el=>{
      const value = next === 'en' ? el.dataset.titleEn : el.dataset.titleEs;
      if(value !== undefined){
        el.setAttribute('title', value);
      }
    });

    document.querySelectorAll('.nav-link').forEach(link=>{
      if(link.dataset.wrapped){
        link.dataset.wrapped = '';
        link.classList.remove('letters-hover');
        link.textContent = link.textContent;
      }
    });
    wrapLetters();
    localStorage.setItem('panorama_lang', next);
  }

  // Resalta enlaces a secciones cuando la seccion esta visible.
  const sections = document.querySelectorAll('main section, .hero');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      if(!id) return;
      const samePageLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if(samePageLink) samePageLink.classList.toggle('active', entry.isIntersecting);
    });
  },{threshold:0.5});
  sections.forEach(s=>observer.observe(s));

  // Revela bloques al entrar en viewport para evitar carga visual brusca.
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => animateObserver.observe(el));

  // Envuelve letras del menu para aplicar la animacion hover existente.
  function wrapLetters(){
    document.querySelectorAll('.nav-link').forEach(link=>{
      if(link.dataset.wrapped) return;
      const text = link.textContent.trim();
      link.textContent = '';
      text.split('').forEach((ch,i)=>{
        const span = document.createElement('span');
        span.className = 'letter';
        span.style.setProperty('--i', i);
        span.textContent = ch;
        link.appendChild(span);
      });
      link.dataset.wrapped = '1';

      link.addEventListener('mouseenter', ()=> link.classList.add('letters-hover'));
      link.addEventListener('mouseleave', ()=> link.classList.remove('letters-hover'));
    });
  }
  let didApplyLanguage = false;
  if(langToggle){
    const storedLang = localStorage.getItem('panorama_lang');
    const initialLang = storedLang || document.documentElement.lang || 'en';
    applyLanguage(initialLang);
    didApplyLanguage = true;
    langToggle.addEventListener('click', ()=>{
      const nextLang = document.documentElement.lang === 'en' ? 'es' : 'en';
      applyLanguage(nextLang);
      syncConversationFallback();
    });
  }
  if(!didApplyLanguage){
    wrapLetters();
  }

  const conversationLoaderUrl = 'https://wxbidqobvc.chat.digital.ringcentral.com/chat/826d3aad73a7803b6101f6e6/loader.js';

  function hasConversationWidget(){
    return Boolean(
      document.querySelector('[id^="dimelo_chat_button_"]')
      || document.querySelector('.dimelo-chat-wrapper .dimelo-chat-bubble')
      || document.querySelector('.button-wrapper .dimelo_chat_item_action')
    );
  }

  function getConversationFallbackHref(){
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    return currentFile.toLowerCase() === 'contacto.html' ? '#contact-form' : 'contacto.html#contact-form';
  }

  function syncConversationFallback(){
    const fallback = document.querySelector('.chat-fallback-fab');
    if(!fallback) return;
    fallback.href = getConversationFallbackHref();
    fallback.setAttribute('aria-label', document.documentElement.lang === 'es' ? 'Abrir contacto de Panorama' : 'Open Panorama contact');
    fallback.setAttribute('title', document.documentElement.lang === 'es' ? 'Abrir contacto' : 'Open contact');
  }

  function ensureConversationFallback(){
    let fallback = document.querySelector('.chat-fallback-fab');
    if(!fallback){
      fallback = document.createElement('a');
      fallback.className = 'chat-fallback-fab';
      fallback.href = getConversationFallbackHref();
      fallback.innerHTML = '<span class="chat-fallback-label">Chat</span>';
      document.body.appendChild(fallback);
    }
    syncConversationFallback();
    fallback.classList.add('is-visible');
  }

  function hideConversationFallback(){
    document.querySelector('.chat-fallback-fab')?.classList.remove('is-visible');
  }

  function startConversationLoader(){
    const existingLoader = document.querySelector(`script[src="${conversationLoaderUrl}"]`);
    if(!existingLoader){
      const loader = document.createElement('script');
      loader.src = conversationLoaderUrl;
      loader.async = true;
      loader.addEventListener('error', ensureConversationFallback, { once: true });
      document.head.appendChild(loader);
    }

    const checkWidget = () => {
      if(hasConversationWidget()){
        hideConversationFallback();
        return true;
      }
      return false;
    };

    if(checkWidget()) return;

    const observer = new MutationObserver(() => {
      if(checkWidget()){
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(() => {
      if(!checkWidget()){
        ensureConversationFallback();
      }
    }, 5000);
  }

  // Difiere el chat de terceros para priorizar renderizado inicial y LCP en movil.
  (function scheduleConversationLoader(){
    const kickoff = () => window.setTimeout(startConversationLoader, 3500);
    if(document.readyState === 'complete'){
      if('requestIdleCallback' in window){
        window.requestIdleCallback(kickoff, { timeout: 2000 });
      } else {
        kickoff();
      }
      return;
    }

    window.addEventListener('load', () => {
      if('requestIdleCallback' in window){
        window.requestIdleCallback(kickoff, { timeout: 2000 });
      } else {
        kickoff();
      }
    }, { once: true });
  })();

  // Mejora rendimiento difiriendo imagenes fuera de bloques principales.
  document.querySelectorAll('img').forEach(img=>{
    if(img.closest('.page-hero, .ticket-hero, .home-hero, .site-header')) return;
    if(img.closest('.whatsapp-fab')) return;
    if(!img.hasAttribute('loading')){
      img.setAttribute('loading', 'lazy');
    }
    if(!img.hasAttribute('decoding')){
      img.setAttribute('decoding', 'async');
    }
  });

  // Intenta formatos livianos cuando existe una variante local compatible.
  (function optimizeImageFormats(){
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img=>{
      try{
        const src = new URL(img.src, window.location.href);
        if(src.origin !== window.location.origin) return;
        if(!/\.(png|jpe?g)$/i.test(src.pathname)) return;
        const base = src.pathname.replace(/\.(png|jpe?g)$/i, '');
        const tryExt = async (ext) => {
          const testUrl = `${base}.${ext}`;
          const res = await fetch(testUrl, { method: 'HEAD' }).catch(()=>null);
          return res && res.ok ? testUrl : null;
        };
        (async ()=>{
          const avif = await tryExt('avif');
          if(avif){ img.src = avif; return; }
          const webp = await tryExt('webp');
          if(webp){ img.src = webp; }
        })();
      }catch(err){
        return;
      }
    });
  })();

  // Abre y cierra tarjetas interactivas de tours con mouse o teclado.
  document.querySelectorAll('.tour-card').forEach(card=>{
    const btn = card.querySelector('.more-btn');
    function toggle(e){
      card.classList.toggle('open');
    }
    btn?.addEventListener('click', e=>{ e.stopPropagation(); toggle(); });
    card.addEventListener('click', ()=>{ toggle(); });
    card.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  function buildCargoQuoteReference(){
    return `COT-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  function buildCargoQuoteRecord(payload){
    const realWeight = Number(payload.weight || 0);
    const volumetricWeight = Number(payload.volumetric_weight_lb || 0);
    const chargedWeight = Number(payload.charged_weight_lb || payload.chargeable || realWeight);
    return {
      reference: payload.reference || buildCargoQuoteReference(),
      sender_name: String(payload.sender_name || '').trim(),
      sender_email: String(payload.sender_email || '').trim(),
      sender_phone: String(payload.sender_phone || '').trim(),
      pickup_address: String(payload.pickup_address || '').trim(),
      delivery_city: String(payload.delivery_city || '').trim(),
      branch: String(payload.branch || '').trim(),
      shipment_type: String(payload.type || '').trim(),
      weight_lb: realWeight,
      real_weight_lb: realWeight,
      height_in: Number(payload.height || 0) || null,
      length_in: Number(payload.length || 0) || null,
      width_in: Number(payload.width || 0) || null,
      volumetric_weight_lb: volumetricWeight || null,
      charged_weight_lb: chargedWeight,
      volumetric_divisor: Number(payload.volumetric_divisor || 166),
      rate_personal: Number(payload.rate_personal || 0) || null,
      rate_familiar: Number(payload.rate_familiar || 0) || null,
      rate_personal_usd_lb: Number(payload.rate_personal || 0) || null,
      rate_familiar_usd_lb: Number(payload.rate_familiar || 0) || null,
      familiar_limit_lb: Number(payload.familiar_limit_lb || 0) || null,
      excess_weight_lb: Number(payload.excess_weight_lb || 0) || 0,
      excess_price_usd: Number(payload.excess_price_usd || 0) || 0,
      base_price_usd: Number(payload.base_price_usd || payload.cuota || 0) || 0,
      total_price_usd: Number(payload.total_price_usd || payload.cuota || 0) || 0,
      quoted_amount: Number(payload.cuota || 0),
      receive_promotions: Boolean(payload.receive_promotions),
      receive_updates: Boolean(payload.receive_updates),
      source: 'website',
      status: 'new'
    };
  }

  function getPanoramaPublicConfig(){
    return window.PANORAMA_PUBLIC_CONFIG || {};
  }

  function getRemoteQuoteConfig(){
    const remoteQuotes = getPanoramaPublicConfig().remoteQuotes || {};
    const endpoint = String(remoteQuotes.endpoint || '').trim().replace(/\/$/, '');
    const anonKey = String(remoteQuotes.anonKey || '').trim();
    const table = String(remoteQuotes.table || 'cargo_quotes').trim();

    if(!endpoint || !anonKey || !table){
      return null;
    }

    return {
      provider: String(remoteQuotes.provider || 'supabase-rest').trim().toLowerCase(),
      endpoint,
      anonKey,
      table
    };
  }

  async function parseJsonOrText(response){
    const contentType = response.headers.get('content-type') || '';
    if(contentType.includes('application/json')){
      return response.json();
    }
    const rawText = await response.text();
    return { rawText };
  }

  async function saveCargoQuoteToRemote(payload){
    const remoteConfig = getRemoteQuoteConfig();
    if(!remoteConfig || remoteConfig.provider !== 'supabase-rest'){
      return null;
    }

    const quoteRecord = buildCargoQuoteRecord(payload);
    const url = `${remoteConfig.endpoint}/rest/v1/${encodeURIComponent(remoteConfig.table)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: remoteConfig.anonKey,
        Authorization: `Bearer ${remoteConfig.anonKey}`,
          Prefer: 'return=minimal'
      },
      body: JSON.stringify([quoteRecord])
    });
    const result = await parseJsonOrText(response);
    if(!response.ok){
      throw new Error(result?.message || result?.error_description || result?.error || `Remote quote error ${response.status}`);
    }

    const row = Array.isArray(result) ? result[0] : result;
    return {
      provider: 'supabase',
      quoteId: row?.id || null,
        reference: quoteRecord.reference,
      message: row?.message || 'Datos guardados correctamente.'
    };
  }

  function resolveCargoSaveErrorMessage(error, isSpanish){
    const fallback = isSpanish ? 'No se pudo guardar la cotización.' : 'The quote could not be saved.';
    if(!error) return fallback;
    const message = String(error.message || error.details || '').trim();
    if(!message) return fallback;
    if(message === 'Failed to fetch' || /No se pudo conectar con la API/i.test(message)){
      return isSpanish
        ? 'La cotización no pudo llegar al servidor SQL. Revisa que el backend local esté encendido.'
        : 'The quote could not reach the SQL server backend. Make sure the local backend is running.';
    }
    return message;
  }

  async function saveCargoQuote(payload){
    const quoteRecord = buildCargoQuoteRecord(payload);
    try{
      const remoteResult = await saveCargoQuoteToRemote(payload);
      if(remoteResult){
        return remoteResult;
      }
    }catch(remoteError){
      console.warn('Remote quote save failed, trying local API.', remoteError);
    }

    const { payload: data } = await fetchPanoramaApi('/api/carga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return {
      provider: 'sqlserver',
      quoteId: data?.quoteId || null,
      reference: data?.reference || quoteRecord.reference,
      message: data?.message || 'Datos guardados correctamente.'
    };
  }

  async function parsePanoramaApiResponse(response){
    const contentType = response.headers.get('content-type') || '';
    if(contentType.includes('application/json')){
      return response.json();
    }
    const rawText = await response.text();
    return { rawText };
  }

  function buildPanoramaApiUrls(path){
    const urls = [];
    const seen = new Set();

    function pushUrl(url){
      if(!url || seen.has(url)) return;
      seen.add(url);
      urls.push(url);
    }

    pushUrl(path);

    if(window.location.protocol === 'http:' || window.location.protocol === 'https:'){
      pushUrl(`${window.location.origin}${path}`);

      const { protocol, hostname, port } = window.location;
      if(hostname){
        const apiProtocol = protocol === 'https:' ? 'https:' : 'http:';
        const inferredPort = port === '3001' ? port : '3001';
        pushUrl(`${apiProtocol}//${hostname}:${inferredPort}${path}`);
      }
    }

    pushUrl(`http://localhost:3001${path}`);
    pushUrl(`http://127.0.0.1:3001${path}`);

    return urls;
  }

  async function fetchPanoramaApi(path, options = {}){
    const urls = buildPanoramaApiUrls(path);

    let lastError = null;
    for(const url of urls){
      try{
        const response = await fetch(url, options);
        const payload = await parsePanoramaApiResponse(response);
        if(response.ok){
          if(payload && payload.rawText && payload.rawText.trim().startsWith('<')){
            throw new Error('La API devolvió HTML en lugar de JSON.');
          }
          return { payload, url };
        }
        lastError = new Error((payload && payload.error) || `Error HTTP ${response.status}`);
      }catch(error){
        lastError = error;
      }
    }
    throw lastError || new Error('No se pudo conectar con la API.');
  }

  // Gestiona el formulario de contacto y prueba los canales configurados en orden.
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', async e=>{
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    const isSpanish = document.documentElement.lang === 'es';
    const contactLabels = isSpanish ? {
      missing: 'Por favor completa Nombre, Correo y Mensaje antes de enviar.',
      gsSuccess: 'Mensaje guardado en Google Sheets correctamente. ¡Gracias!',
      gsError: 'Error al enviar al servicio de Google Sheets.',
      gsFallback: ' Se intentará el método alternativo.',
      gsOffline: 'No se pudo conectar al servicio de Google Sheets. Se intentará el método alternativo.',
      formSuccess: 'Mensaje enviado correctamente. ¡Gracias! Te responderemos pronto.',
      formError: 'Error al enviar el formulario. Por favor intenta de nuevo.',
      formOffline: 'No se pudo conectar con el servicio de envío. Intenta nuevamente o usa el correo directo.',
      finalError: 'No se pudo enviar el mensaje. Por favor, intenta nuevamente o contacta directamente por email.'
    } : {
      missing: 'Please complete Name, Email, and Message before sending.',
      gsSuccess: 'Message saved to Google Sheets successfully. Thank you!',
      gsError: 'Error sending to Google Sheets service.',
      gsFallback: ' We will try the alternative method.',
      gsOffline: 'Could not connect to Google Sheets service. We will try the alternative method.',
      formSuccess: 'Message sent successfully. Thank you! We will reply soon.',
      formError: 'Error sending the form. Please try again.',
      formOffline: 'Could not connect to the sending service. Please try again or use email.',
      finalError: 'Message could not be sent. Please try again or contact us directly by email.'
    };

    // Valida lo minimo antes de intentar cualquier envio.
    if(!data.name || !data.email || !data.message){
      const warn = document.createElement('div');
      warn.className = 'form-warning';
      warn.textContent = contactLabels.missing;
      contactForm.parentElement.insertBefore(warn, contactForm.nextSibling);
      setTimeout(()=>warn.remove(),4000);
      return;
    }

    const gsUrl = contactForm.dataset.gsUrl;
    const formspreeId = contactForm.dataset.formspreeId;

    // Primero intenta guardar en Google Sheets si hay webhook configurado.
    if(gsUrl && gsUrl !== 'YOUR_GOOGLE_SHEETS_WEBHOOK_URL'){
      try{
        const res = await fetch(gsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, email: data.email, subject: data.subject || '', message: data.message, page: location.href, ts: new Date().toISOString() })
        });
        if(res.ok){
          contactForm.reset();
          const success = document.createElement('div');
          success.className = 'form-success';
          success.textContent = contactLabels.gsSuccess;
          contactForm.parentElement.insertBefore(success, contactForm.nextSibling);
          setTimeout(()=>success.remove(),5000);
          return;
        } else {
          const err = await res.json().catch(()=>null);
          const msg = (err && err.error) ? err.error : contactLabels.gsError;
          const warn = document.createElement('div');
          warn.className = 'form-warning';
          warn.textContent = msg + contactLabels.gsFallback;
          contactForm.parentElement.insertBefore(warn, contactForm.nextSibling);
          setTimeout(()=>warn.remove(),5000);
        }
      }catch(err){
        const warn = document.createElement('div');
        warn.className = 'form-warning';
        warn.textContent = contactLabels.gsOffline;
        contactForm.parentElement.insertBefore(warn, contactForm.nextSibling);
        setTimeout(()=>warn.remove(),5000);
      }
    }

    // Luego intenta Formspree como canal de envio principal del formulario.
    if(formspreeId && formspreeId !== 'YOUR_FORM_ID'){
      try{
        const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if(res.ok){
          contactForm.reset();
          const success = document.createElement('div');
          success.className = 'form-success';
          success.textContent = contactLabels.formSuccess;
          contactForm.parentElement.insertBefore(success, contactForm.nextSibling);
          setTimeout(()=>success.remove(),5000);
          return;
        } else {
          const err = await res.json().catch(()=>null);
          const msg = (err && err.error) ? err.error : contactLabels.formError;
          const warn = document.createElement('div');
          warn.className = 'form-warning';
          warn.textContent = msg;
          contactForm.parentElement.insertBefore(warn, contactForm.nextSibling);
          setTimeout(()=>warn.remove(),5000);
        }
      }catch(err){
        const warn = document.createElement('div');
        warn.className = 'form-warning';
        warn.textContent = contactLabels.formOffline;
        contactForm.parentElement.insertBefore(warn, contactForm.nextSibling);
        setTimeout(()=>warn.remove(),5000);
      }
    }

    // Si no hubo un canal disponible o todos fallaron, informa el error final.
    contactForm.reset();
    const error = document.createElement('div');
    error.className = 'form-warning';
    error.textContent = contactLabels.finalError;
    contactForm.parentElement.insertBefore(error, contactForm.nextSibling);
    setTimeout(()=>error.remove(),5000);
  });

  // Convierte la solicitud de boletos en un mensaje de WhatsApp.
  const ticketForm = document.getElementById('ticket-form');
  ticketForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const formData = new FormData(ticketForm);
    const getValue = (name, fallback) => {
      const value = formData.get(name);
      return value ? String(value).trim() : fallback;
    };

    const isSpanish = document.documentElement.lang === 'es';
    const labels = isSpanish ? {
      title: 'Solicitud de cotizacion de boletos',
      origin: 'Origen',
      destination: 'Destino',
      departure: 'Salida',
      returnDate: 'Regreso',
      passengers: 'Pasajeros',
      tripType: 'Tipo',
      empty: 'No definido'
    } : {
      title: 'Ticket quote request',
      origin: 'Origin',
      destination: 'Destination',
      departure: 'Departure',
      returnDate: 'Return',
      passengers: 'Passengers',
      tripType: 'Trip type',
      empty: 'Not specified'
    };

    const messageLines = [
      labels.title,
      `${labels.origin}: ${getValue('origen', labels.empty)}`,
      `${labels.destination}: ${getValue('destino', labels.empty)}`,
      `${labels.departure}: ${getValue('salida', labels.empty)}`,
      `${labels.returnDate}: ${getValue('regreso', labels.empty)}`,
      `${labels.passengers}: ${getValue('pasajeros', labels.empty)}`,
      `${labels.tripType}: ${getValue('tipo', labels.empty)}`
    ];
    const message = messageLines.join('\n');

    const rawNumber = ticketForm.dataset.whatsapp || '';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    if(!cleanNumber){
      alert('No hay numero de WhatsApp configurado.');
      return;
    }
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  // Calcula cotizaciones de carga, guarda la solicitud y permite continuar por WhatsApp.
  const cargoForm = document.getElementById('cargo-calc-form');
  if(cargoForm){
    const nameEl = cargoForm.querySelector('#sender-name');
    const emailEl = cargoForm.querySelector('#sender-email');
    const phoneEl = cargoForm.querySelector('#sender-phone');
    const pickupEl = cargoForm.querySelector('#pickup-address');
    const deliveryCityEl = cargoForm.querySelector('#delivery-city');
    const branchEl = cargoForm.querySelector('#branch-option');
    const weightEl = cargoForm.querySelector('#weight');
    const heightEl = cargoForm.querySelector('#height');
    const lengthEl = cargoForm.querySelector('#length');
    const widthEl = cargoForm.querySelector('#width');
    const typeEl = cargoForm.querySelector('#pkg-type');
    const resultEl = document.getElementById('calc-result');
    const feedbackEl = document.getElementById('calc-feedback');
    const calcBtn = document.getElementById('calc-btn');
    const quoteNowBtn = document.getElementById('quote-now');
    const waBtn = document.getElementById('whatsapp-quote');
    let lastCalc = null;
    let lastSavedCargoQuote = null;

    const requestId = window.cargoRequestId || null;
    if(requestId){
      fetchPanoramaApi(`/api/carga/${requestId}`)
        .then(({ payload: data }) => {
          if(!data) return;
          nameEl.value = data.sender_name || '';
          if(emailEl) emailEl.value = data.sender_email || '';
          phoneEl.value = data.sender_phone || '';
          pickupEl.value = data.pickup_address || '';
          deliveryCityEl.value = data.delivery_city || '';
          branchEl.value = data.branch || '';
          typeEl.value = data.type || '';
          weightEl.value = data.weight || '';
        })
        .catch(()=>{});
    }

    function calculatePrice(){
      const realWeight = parseFloat(weightEl.value) || 0;
      const height = parseFloat(heightEl?.value) || 0;
      const length = parseFloat(lengthEl?.value) || 0;
      const width = parseFloat(widthEl?.value) || 0;
      const volumetricWeight = (height * length * width) / 166;
      const chargeable = Math.max(realWeight, volumetricWeight);

      const type = String(typeEl?.value || 'personal').toLowerCase();
      const personalRate = 5.5;
      const familiarRate = 3;
      const familiarLimitLb = 200;
      const usedWeight = chargeable;
      let price = 0;
      let basePrice = 0;
      let excessPrice = 0;
      let totalPrice = 0;
      let rateLabel = '$5.50/lb';
      let note = '';
      let excessWeight = 0;

      if(type === 'familiar'){
        const familiarWeight = Math.min(chargeable, familiarLimitLb);
        excessWeight = Math.max(chargeable - familiarLimitLb, 0);
        basePrice = familiarWeight * familiarRate;
        excessPrice = excessWeight * personalRate;
        totalPrice = basePrice + excessPrice;
        price = totalPrice;
        rateLabel = excessWeight > 0
          ? '$3.00/lb (primeras 200 lb) + $5.50/lb (exceso)'
          : '$3.00/lb';
        if(excessWeight > 0){
          note = ` · Incluye ${excessWeight.toFixed(2)} lb de exceso a tarifa personal`;
        }
      } else {
        basePrice = chargeable * personalRate;
        excessPrice = 0;
        totalPrice = basePrice;
        price = totalPrice;
      }

      return {
        price,
        realWeight: Number(realWeight.toFixed(2)),
        volumetricWeight: Number(volumetricWeight.toFixed(2)),
        usedWeight: Number(usedWeight.toFixed(2)),
        chargeable: Number(chargeable.toFixed(2)),
        rateLabel,
        ratePersonal: Number(personalRate.toFixed(2)),
        rateFamiliar: Number(familiarRate.toFixed(2)),
        familiarLimitLb: Number(familiarLimitLb.toFixed(2)),
        volumetricDivisor: 166,
        excessWeight: Number(excessWeight.toFixed(2)),
        basePrice: Number(basePrice.toFixed(2)),
        excessPrice: Number(excessPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        note
      };
    }

    function hasEmptyRequiredCargoField(){
      const requiredValues = [
        nameEl?.value,
        emailEl?.value,
        phoneEl?.value,
        pickupEl?.value,
        deliveryCityEl?.value,
        branchEl?.value,
        typeEl?.value,
        weightEl?.value,
        heightEl?.value,
        lengthEl?.value,
        widthEl?.value
      ];

      return requiredValues.some(value => !String(value || '').trim());
    }

    function setCargoResultMessage(message, tone = 'info'){
      if(!resultEl) return;
      resultEl.textContent = message;
      resultEl.classList.remove('is-success', 'is-error');
      if(tone === 'success') resultEl.classList.add('is-success');
      if(tone === 'error') resultEl.classList.add('is-error');
    }

    function buildCargoQuotePayload(calc){
      const quoteAmount = Number(calc?.price || 0);
      return {
        sender_name: nameEl.value,
        sender_email: emailEl ? emailEl.value : '',
        sender_phone: phoneEl.value,
        pickup_address: pickupEl.value,
        delivery_city: deliveryCityEl.value,
        branch: branchEl.value,
        type: typeEl.value,
        weight: weightEl.value,
        height: heightEl ? heightEl.value : '',
        length: lengthEl ? lengthEl.value : '',
        width: widthEl ? widthEl.value : '',
        volumetric_weight_lb: calc ? calc.volumetricWeight : 0,
        charged_weight_lb: calc ? calc.usedWeight : 0,
        chargeable: calc ? calc.chargeable : 0,
        rate_personal: calc ? calc.ratePersonal : 5.5,
        rate_familiar: calc ? calc.rateFamiliar : 3,
        familiar_limit_lb: calc ? calc.familiarLimitLb : 200,
        excess_weight_lb: calc ? calc.excessWeight : 0,
        excess_price_usd: calc ? calc.excessPrice : 0,
        base_price_usd: calc ? calc.basePrice : quoteAmount,
        total_price_usd: calc ? calc.totalPrice : quoteAmount,
        volumetric_divisor: calc ? calc.volumetricDivisor : 166,
        cuota: quoteAmount,
        receive_promotions: false,
        receive_updates: true
      };
    }

    function buildCargoQuoteSaveKey(calc){
      return JSON.stringify(buildCargoQuotePayload(calc));
    }

    async function ensureCargoQuoteSaved(calc){
      const saveKey = buildCargoQuoteSaveKey(calc);
      if(lastSavedCargoQuote && lastSavedCargoQuote.key === saveKey){
        return lastSavedCargoQuote.data;
      }

      const data = await saveCargoQuote(buildCargoQuotePayload(calc));
      lastSavedCargoQuote = { key: saveKey, data };
      return data;
    }

    function renderCargoCalculation(res, tone = 'info'){
      const isEs = document.documentElement.lang === 'es';
      const priceText = isEs ? `Precio aproximado: $${res.price.toFixed(2)}${res.note}` : `Approx price: $${res.price.toFixed(2)}${res.note}`;
      const breakdown = isEs
        ? `Peso real: ${res.realWeight} lb · Peso volumétrico: ${res.volumetricWeight} lb · Peso cobrado: ${res.usedWeight} lb · Tarifa: ${res.rateLabel}`
        : `Real weight: ${res.realWeight} lb · Volumetric weight: ${res.volumetricWeight} lb · Charged weight: ${res.usedWeight} lb · Rate: ${res.rateLabel}`;
      setCargoResultMessage(`${priceText} — ${breakdown}`, tone);
    }

    function resetCargoQuoteState(){
      lastCalc = null;
      lastSavedCargoQuote = null;
      feedbackEl?.classList.remove('ready');
      calcBtn && (calcBtn.disabled = false);
      quoteNowBtn && (quoteNowBtn.disabled = false);
    }

    async function saveCurrentCargoQuote({ resetAfterSave }){
      const isEs = document.documentElement.lang === 'es';
      const res = calculatePrice();
      if(hasEmptyRequiredCargoField()){
        setCargoResultMessage(isEs ? 'Por favor, rellena todos los campos antes de cotizar.' : 'Please fill in all fields before requesting a quote.', 'error');
        feedbackEl?.classList.remove('ready');
        return;
      }
      if(res.chargeable <= 0){
        setCargoResultMessage(isEs ? 'Primero calcula con peso y dimensiones válidas.' : 'Calculate first with valid weight and dimensions.', 'error');
        feedbackEl?.classList.remove('ready');
        return;
      }

      lastCalc = res;
      feedbackEl?.classList.add('ready');
      renderCargoCalculation(res);
      calcBtn && (calcBtn.disabled = true);
      quoteNowBtn && (quoteNowBtn.disabled = true);
      try{
        const data = await ensureCargoQuoteSaved(res);

        if(data && data.message){
          feedbackEl?.classList.add('ready');
          renderCargoCalculation(res);
          if(resetAfterSave){
            cargoForm.reset();
            lastCalc = null;
            lastSavedCargoQuote = null;
          }
        } else {
          setCargoResultMessage(isEs ? 'Error inesperado al guardar.' : 'Unexpected error saving.', 'error');
        }
      }catch(error){
        setCargoResultMessage(resolveCargoSaveErrorMessage(error, isEs), 'error');
      }finally{
        calcBtn && (calcBtn.disabled = false);
        quoteNowBtn && (quoteNowBtn.disabled = false);
      }
    }

    [nameEl, emailEl, phoneEl, pickupEl, deliveryCityEl, branchEl, weightEl, heightEl, lengthEl, widthEl, typeEl].forEach((field) => {
      field?.addEventListener('input', resetCargoQuoteState);
      field?.addEventListener('change', resetCargoQuoteState);
    });

    calcBtn?.addEventListener('click', async ()=>{
      await saveCurrentCargoQuote({ resetAfterSave: false });
    });

    quoteNowBtn?.addEventListener('click', async ()=>{
      await saveCurrentCargoQuote({ resetAfterSave: true });
    });

    function openCargoWhatsApp(){
      const isEs = document.documentElement.lang === 'es';
      const getVal = (el) => el && el.value ? String(el.value).trim() : (isEs ? 'No definido' : 'Not specified');
      const msgLines = [];
      msgLines.push(isEs ? 'Solicitud de cotización de envío' : 'Shipping quote request');
      msgLines.push((isEs ? 'Nombre' : 'Name') + ': ' + getVal(nameEl));
      msgLines.push((isEs ? 'Teléfono' : 'Phone') + ': ' + getVal(phoneEl));
      msgLines.push((isEs ? 'Dirección de entrega' : 'Delivery address') + ': ' + getVal(pickupEl));
      msgLines.push((isEs ? 'Ciudad destino' : 'Delivery city') + ': ' + getVal(deliveryCityEl));
      msgLines.push((isEs ? 'Sucursal (opcional)' : 'Branch (optional)') + ': ' + getVal(branchEl));
      msgLines.push((isEs ? 'Tipo envío' : 'Shipment type') + ': ' + getVal(typeEl));
      msgLines.push((isEs ? 'Peso real (lb)' : 'Real weight (lb)') + ': ' + getVal(weightEl));
      msgLines.push((isEs ? 'Alto (in)' : 'Height (in)') + ': ' + getVal(heightEl));
      msgLines.push((isEs ? 'Largo (in)' : 'Length (in)') + ': ' + getVal(lengthEl));
      msgLines.push((isEs ? 'Ancho (in)' : 'Width (in)') + ': ' + getVal(widthEl));
      if(lastCalc){
        msgLines.push('');
        msgLines.push(isEs ? 'Resultado de cálculo' : 'Calculation result');
        msgLines.push((isEs ? 'Precio aproximado' : 'Approx price') + `: $${lastCalc.price.toFixed(2)}${lastCalc.note}`);
        msgLines.push((isEs ? 'Peso volumétrico' : 'Volumetric weight') + `: ${lastCalc.volumetricWeight} lb`);
        msgLines.push((isEs ? 'Peso cobrado' : 'Charged weight') + `: ${lastCalc.usedWeight} lb`);
        msgLines.push((isEs ? 'Tarifa aplicada' : 'Applied rate') + `: ${lastCalc.rateLabel}`);
      }
      const message = msgLines.join('\n');

      let raw = cargoForm.dataset.whatsapp || document.querySelector('.whatsapp-fab')?.href || '';
      const m = String(raw).match(/wa\.me\/(\d+)/);
      const number = m ? m[1] : String(raw).replace(/\D/g,'');
      if(!number){
        alert(isEs ? 'No hay número de WhatsApp configurado.' : 'No WhatsApp number configured.');
        return;
      }
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    }

    waBtn?.addEventListener('click', openCargoWhatsApp);
  }

  const header = document.querySelector('.site-header');
  function updateHeaderState(){
    if(!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  }

  // Ajusta el header y el banner segun el desplazamiento de la pagina.
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const bannerImg = document.querySelector('.banner-img');
    if (bannerImg) {
      bannerImg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    updateHeaderState();
  });
  updateHeaderState();

});