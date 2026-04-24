(() => {
  const optionsContainer = document.getElementById('shipping-options');
  if (!optionsContainer) {
    return;
  }

  const translations = {
    en: {
      usdLabel: 'US dollars',
      payNow: 'Pay now',
      supportInstruction: 'After paying, share your receipt with the Panorama team to coordinate the delivery or reception of your product.',
      contactMore: 'If you need more than one unit or another configuration, contact Panorama before paying.',
      availableNow: 'Currently available'
    },
    es: {
      usdLabel: 'dolares estadounidenses',
      payNow: 'Page ahora',
      supportInstruction: 'Despues de pagar, comparte tu comprobante con el equipo de Panorama para coordinar la entrega o recepcion del producto.',
      contactMore: 'Si necesitas mas de una unidad u otra configuracion, contacta a Panorama antes de pagar.',
      availableNow: 'Disponible actualmente'
    }
  };

  const products = [
    {
      code: 'celular-promo',
      title: 'Promocion Celular',
      titleEn: 'Phone Promotion',
      badge: 'Promocion exclusiva',
      badgeEn: 'Exclusive promotion',
      priceCents: 3500,
      paymentLink: 'https://square.link/u/uWqPJSoE',
      summary: 'Promocion exclusiva para envios de celulares a Nicaragua con retiro en oficina de Managua.',
      summaryEn: 'Exclusive promotion for shipping phones to Nicaragua with pickup at our Managua office.',
      pickupLocation: '10508 W Flagler St Miami, FL 33174-1631 EE. UU.',
      pickupStatus: 'Disponible actualmente',
      pickupStatusEn: 'Currently available',
      poster: {
        image: 'IMG/Promociones/$35 Cel.png',
        tone: 'sunrise'
      },
      highlights: [
        'Seguro, rapido y confiable',
        'Retiro en oficina de Managua',
        'Promocion vigente hasta el 30 de abril del 2026'
      ],
      highlightsEn: [
        'Safe, fast, and reliable',
        'Pickup at our Managua office',
        'Promotion valid through April 30, 2026'
      ],
      requirements: [
        'Aplica unicamente para celulares',
        'El equipo debe ir protegido y etiquetado',
        'Aplican terminos y condiciones de la promocion'
      ],
      requirementsEn: [
        'Applies only to phones',
        'The device must be protected and labeled',
        'Promotion terms and conditions apply'
      ],
      paymentNotes: [
        'Pago directo con el monto ya configurado',
        'Comparte el recibo con Panorama despues del pago'
      ],
      paymentNotesEn: [
        'Direct payment with the amount already configured',
        'Share the receipt with Panorama after payment'
      ]
    },
    {
      code: 'laptop-promo',
      title: 'Promocion Laptop',
      titleEn: 'Laptop Promotion',
      badge: 'Tecnologia',
      badgeEn: 'Technology',
      priceCents: 6000,
      paymentLink: 'https://square.link/u/BENG2b8t',
      summary: 'Promocion especial para envio de laptops desde Estados Unidos hacia Nicaragua.',
      summaryEn: 'Special promotion for shipping laptops from the United States to Nicaragua.',
      pickupLocation: '10508 W Flagler St Miami, FL 33174-1631 EE. UU.',
      pickupStatus: 'Disponible actualmente',
      pickupStatusEn: 'Currently available',
      poster: {
        image: 'IMG/Promociones/Laptop April 26 $60.png',
        tone: 'ocean'
      },
      highlights: [
        'Tarifa especial de $60 por laptop',
        'Servicio rapido, seguro y confiable',
        'Retiro en nuestra oficina de Managua'
      ],
      highlightsEn: [
        '$60 special rate per laptop',
        'Fast, safe, and reliable service',
        'Pickup at our Managua office'
      ],
      requirements: [
        'Aplica unicamente para laptops',
        'No incluye entrega a domicilio',
        'El equipo debe estar debidamente empacado'
      ],
      requirementsEn: [
        'Applies only to laptops',
        'Home delivery is not included',
        'The device must be properly packed'
      ],
      paymentNotes: [
        'El enlace abre el checkout oficial del producto',
        'Coordina con Panorama despues de completar el pago'
      ],
      paymentNotesEn: [
        'The link opens the official product checkout',
        'Coordinate with Panorama after completing the payment'
      ]
    }
  ];

  const state = {
    selectedCode: products[0].code
  };

  function currentLang() {
    return document.documentElement.lang === 'es' ? 'es' : 'en';
  }

  function t(key, vars = {}) {
    const source = translations[currentLang()] || translations.en;
    let text = source[key] ?? translations.es[key] ?? key;
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replaceAll(`{{${name}}}`, String(value));
    });
    return text;
  }

  function localizedValue(item, key) {
    const localizedKey = currentLang() === 'en' ? `${key}En` : key;
    return item[localizedKey] ?? item[key] ?? '';
  }

  function localizedArray(item, key) {
    const localizedKey = currentLang() === 'en' ? `${key}En` : key;
    return item[localizedKey] ?? item[key] ?? [];
  }

  function formatUsd(amountInCents) {
    const locale = currentLang() === 'es' ? 'es-NI' : 'en-US';
    const value = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountInCents / 100);
    return `${value} ${t('usdLabel')}`;
  }

  function currentProduct() {
    return products.find((item) => item.code === state.selectedCode) || products[0];
  }

  function renderList(elementId, items) {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }
    element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
  }

  function renderOptions() {
    optionsContainer.innerHTML = products.map((product) => {
      const isActive = product.code === state.selectedCode;
      return `
        <button type="button" class="shipping-card ${isActive ? 'is-active' : ''}" data-code="${product.code}">
          <strong>${localizedValue(product, 'title')}</strong>
          <span class="shipping-card-badge">${localizedValue(product, 'badge')}</span>
          <span class="shipping-card-price">${formatUsd(product.priceCents)}</span>
        </button>
      `;
    }).join('');

    optionsContainer.querySelectorAll('[data-code]').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedCode = button.dataset.code;
        renderAll();
      });
    });
  }

  function renderProduct() {
    const product = currentProduct();
    const posterCard = document.getElementById('poster-card');
    const posterImage = document.getElementById('poster-image');
    const pickupLocation = document.getElementById('pickup-location');
    const pickupStatus = document.getElementById('pickup-status');
    const pickupInstructions = document.getElementById('pickup-instructions');
    const selectedBadge = document.getElementById('selected-badge');
    const selectedTitle = document.getElementById('selected-title');
    const selectedPrice = document.getElementById('selected-price');
    const selectedSummary = document.getElementById('selected-summary');
    const summaryTitle = document.getElementById('summary-title');
    const summaryDescription = document.getElementById('summary-description');
    const summaryAmount = document.getElementById('summary-amount');
    const subtotalAmount = document.getElementById('subtotal-amount');
    const directPayLink = document.getElementById('direct-pay-link');
    const directPayHelp = document.querySelector('.direct-pay-help');

    if (posterCard) {
      posterCard.classList.remove('tone-sunrise', 'tone-ocean', 'tone-coral');
      posterCard.classList.add(`tone-${product.poster.tone}`);
    }

    if (posterImage) {
      posterImage.src = product.poster.image;
      posterImage.alt = localizedValue(product, 'summary') || localizedValue(product, 'title');
    }

    if (pickupLocation) pickupLocation.textContent = product.pickupLocation;
    if (pickupStatus) pickupStatus.textContent = localizedValue(product, 'pickupStatus') || t('availableNow');
    if (pickupInstructions) pickupInstructions.textContent = t('supportInstruction');
    if (selectedBadge) selectedBadge.textContent = localizedValue(product, 'badge');
    if (selectedTitle) selectedTitle.textContent = localizedValue(product, 'title');
    if (selectedPrice) selectedPrice.textContent = formatUsd(product.priceCents);
    if (selectedSummary) selectedSummary.textContent = localizedValue(product, 'summary');
    if (summaryTitle) summaryTitle.textContent = localizedValue(product, 'title');
    if (summaryDescription) summaryDescription.textContent = localizedValue(product, 'summary');
    if (summaryAmount) summaryAmount.textContent = formatUsd(product.priceCents);
    if (subtotalAmount) subtotalAmount.textContent = formatUsd(product.priceCents);
    if (directPayLink) {
      directPayLink.href = product.paymentLink;
      directPayLink.textContent = t('payNow');
    }
    if (directPayHelp) directPayHelp.textContent = t('contactMore');

    renderList('selected-highlights', localizedArray(product, 'highlights'));
    renderList('selected-requirements', localizedArray(product, 'requirements'));
    renderList('selected-payment-notes', localizedArray(product, 'paymentNotes'));
  }

  function renderAll() {
    renderOptions();
    renderProduct();
  }

  const langObserver = new MutationObserver(() => {
    renderAll();
  });

  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  });

  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    window.setTimeout(renderAll, 0);
  });

  renderAll();
})();
