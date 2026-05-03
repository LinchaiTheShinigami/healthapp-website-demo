const CLINIC_DIRECTORY = {
  'brighton-hove': {
    name: 'Brighton and Hove',
    region: 'South East',
    lat: 50.824,
    lng: -0.163,
    summary: 'Best suited to Brighton and coastal clients who want a weekday venous draw without routing through London.',
    address: '39b Salisbury Road, Hove, BN3 3AA',
    hours: 'Monday to Friday, 08:00 to 14:00',
    access: 'Disabled access is available. Confirm exact appointment timing in advance for high-demand morning slots.',
    mapQuery: '39b Salisbury Road, Hove BN3 3AA',
    services: [
      'Clinic appointments and walk-in blood draws during listed hours',
      'Suitable for Ayuta Foundation, Performance, and Elite package collection',
      'Venous draw support, finger-prick backup, and custom add-on biomarker panels'
    ]
  },
  cambridge: {
    name: 'Cambridge',
    region: 'East of England',
    lat: 52.212,
    lng: 0.129,
    summary: 'A practical East of England option with longer weekday hours and straightforward parking for planned appointments.',
    address: '92 Chesterton Road, Cambridge, CB4 1ER',
    hours: 'Monday to Friday, 08:00 to 15:00',
    access: 'Disabled access is available. Free rear parking and nearby pay-and-display spaces support appointment travel.',
    mapQuery: '92 Chesterton Road, Cambridge CB4 1ER',
    services: [
      'Booked and walk-in phlebotomy for general wellness and performance panels',
      'Ayuta package collection with support for additional clinician-directed tests',
      'Venous draw collection with same-day handoff into the lab network where capacity allows'
    ]
  },
  chiswick: {
    name: 'Chiswick',
    region: 'West London',
    lat: 51.498,
    lng: -0.261,
    summary: 'A West London clinic route for clients who want professional collection without travelling into the City.',
    address: '2 Heathfield Terrace, Chiswick, London, W4 4JE',
    hours: 'Monday to Friday, 08:00 to 14:30',
    access: 'Disabled access is available. Street parking is pay-and-display, so a pre-booked slot is the easiest route.',
    mapQuery: '2 Heathfield Terrace, Chiswick London W4 4JE',
    services: [
      'Clinic appointment and walk-in support for venous blood collection',
      'Good fit for hormone, performance, thyroid, lipid, vitamin, and iron panels',
      'Ayuta package collection with support for custom blood requests where available'
    ]
  },
  crawley: {
    name: 'Crawley',
    region: 'Sussex',
    lat: 51.108,
    lng: -0.187,
    summary: 'A strong Sussex clinic option for airport-corridor clients and anyone wanting a quick weekday appointment.',
    address: 'Coachmans Drive, Crawley, RH11 9AQ',
    hours: 'Monday to Friday, 08:00 to 13:00',
    access: 'Disabled access is available and on-site parking is free, making this one of the easier drive-up options.',
    mapQuery: 'Coachmans Drive, Crawley RH11 9AQ',
    services: [
      'Pre-booked and walk-in blood collection for Ayuta packages',
      'Routine venous draw service for wellness, performance, and longitudinal monitoring panels',
      'Fast handoff for clients who want a practical Sussex collection route'
    ]
  },
  croydon: {
    name: 'Croydon',
    region: 'South London',
    lat: 51.375,
    lng: -0.099,
    summary: 'A South London clinic with broad test coverage and practical access for clients travelling from across the southern rail network.',
    address: 'The Wellness Therapy Centre, 3 Overton Yard, Croydon, CR0 1SL',
    hours: 'Monday to Friday, 08:00 to 14:00',
    access: 'Disabled access is available. The closest parking is Q-Park, so rail access is usually the smoother option.',
    mapQuery: '3 Overton Yard, Croydon CR0 1SL',
    services: [
      'Walk-in and pre-booked venous or capillary sample collection',
      'Suitable for all Ayuta packages plus broader wellness and hormone testing',
      'Useful for repeat monitoring when clients want a staffed clinic rather than home collection'
    ]
  },
  exeter: {
    name: 'Exeter',
    region: 'South West',
    lat: 50.724,
    lng: -3.527,
    summary: 'The core South West clinic route for clients who want a staffed draw rather than a home kit.',
    address: 'The Exeter Business Hub, 46-48 Queen Street, Exeter, EX4 3SR',
    hours: 'Monday to Friday, 08:00 to 14:00',
    access: 'Disabled access is available. Central placement makes it useful for rail and city-centre access.',
    mapQuery: '46-48 Queen Street, Exeter EX4 3SR',
    services: [
      'Clinic appointments and walk-ins for venous blood draws',
      'Ayuta Foundation, Performance, and Elite collection support',
      'Well suited to repeat follow-up testing for clients across the wider South West'
    ]
  },
  guildford: {
    name: 'Guildford',
    region: 'Surrey',
    lat: 51.238,
    lng: -0.57,
    summary: 'A Surrey route with broad weekday coverage for clients who want clinic collection closer to home.',
    address: '36-37 Castle Street, Guildford, GU1 3UQ',
    hours: 'Monday to Friday, 08:00 to 14:30',
    access: 'Nearby car parks are available, but wheelchair access is limited. Confirm suitability before booking if mobility support is needed.',
    mapQuery: '36-37 Castle Street, Guildford GU1 3UQ',
    services: [
      'Booked and walk-in clinic blood collection during weekday hours',
      'Appropriate for Ayuta packages and broader routine pathology panels',
      'Convenient for repeat monitoring without routing into central London'
    ]
  },
  'london-city': {
    name: 'London City',
    region: 'Central London',
    lat: 51.515,
    lng: -0.085,
    summary: 'The strongest weekday commuter option, positioned for Liverpool Street and Monument travel routes.',
    address: '8-9 New Street, London, EC2M 4TP',
    hours: 'Monday to Friday, 07:45 to 15:00',
    access: 'One minute from Liverpool Street. No parking and access is restricted for wheelchair users, so rail access is preferred.',
    mapQuery: '8-9 New Street, London EC2M 4TP',
    services: [
      'High-throughput weekday clinic collection for Ayuta packages',
      'Strong option for before-work, lunch-hour, or repeat follow-up blood draws',
      'Venous draw support with rapid transport into the pathology workflow'
    ]
  },
  'london-victoria': {
    name: 'London Victoria',
    region: 'Central London',
    lat: 51.497,
    lng: -0.135,
    summary: 'A practical central London location for clients coming through Victoria or Westminster-side routes.',
    address: '10a Rochester Row, London, SW1P 1NS',
    hours: 'Monday to Friday, 08:00 to 15:00',
    access: 'No parking and access is restricted for wheelchair users. Best reached via Victoria station and nearby bus routes.',
    mapQuery: '10a Rochester Row, London SW1P 1NS',
    services: [
      'Booked and walk-in weekday clinic collection',
      'Suitable for Ayuta packages, follow-up blood work, and add-on biomarker panels',
      'Useful for clients who want an in-person route close to Westminster and Victoria'
    ]
  },
  'london-canary-wharf': {
    name: 'London Canary Wharf',
    region: 'East London',
    lat: 51.504,
    lng: -0.018,
    summary: 'A Docklands option designed for clients who want clinic collection near Canary Wharf and the wider east-city office belt.',
    address: '56 Dockyard Lane, London, E14 9YX',
    hours: 'Monday to Friday, 07:45 to 14:30',
    access: 'Disabled access is available. Early weekday access makes it well suited to pre-work appointments.',
    mapQuery: '56 Dockyard Lane, London E14 9YX',
    services: [
      'Early weekday clinic collection for Ayuta packages',
      'Good fit for performance, longevity, hormone, thyroid, and metabolic follow-up testing',
      'Venous draw support close to Canary Wharf commuting routes'
    ]
  },
  maidstone: {
    name: 'Maidstone',
    region: 'Kent',
    lat: 51.272,
    lng: 0.523,
    summary: 'A useful Kent base for clients who want local clinic collection rather than travelling toward London or Sussex.',
    address: 'Maidstone Community Support Centre, 39-48 Marsham Street, Maidstone, ME14 1HH',
    hours: 'Monday to Friday, 08:30 to 14:30',
    access: 'Disabled access is available. Nearby car parks make this one practical for mid-Kent travel.',
    mapQuery: '39-48 Marsham Street, Maidstone ME14 1HH',
    services: [
      'Pre-booked and walk-in blood collection for the Ayuta range',
      'Routine venous draw support for wellness, performance, and repeat follow-up panels',
      'Useful for Kent-based clients who want staffed sample collection with easier parking'
    ]
  },
  plymouth: {
    name: 'Plymouth',
    region: 'South West',
    lat: 50.375,
    lng: -4.145,
    summary: 'A South West clinic route for clients who want city-centre access and in-person sample collection.',
    address: 'Eden Clinic, 23 Mayflower Street, Plymouth, PL1 1QJ',
    hours: 'Monday to Friday, 08:00 to 14:00',
    access: 'Disabled access is available. The nearest parking is Mayflower East Car Park.',
    mapQuery: '23 Mayflower Street, Plymouth PL1 1QJ',
    services: [
      'Clinic appointment and walk-in sample collection',
      'Ayuta package support for baseline, follow-up, and repeat monitoring draws',
      'Useful for clients who prefer professional collection over a home kit'
    ]
  },
  'royal-tunbridge-wells': {
    name: 'Royal Tunbridge Wells',
    region: 'Kent',
    lat: 51.132,
    lng: 0.264,
    summary: 'A crossover clinic for Kent and Sussex clients who want a more local route than central London.',
    address: 'Prospect House, 11-13 Lonsdale Gardens, Royal Tunbridge Wells, TN1 1NU',
    hours: 'Monday to Friday, 08:00 to 14:00',
    access: 'Wheelchair access is limited. There is some free parking after 10:00 alongside nearby paid car parks.',
    mapQuery: '11-13 Lonsdale Gardens, Royal Tunbridge Wells TN1 1NU',
    services: [
      'Weekday clinic blood collection for Ayuta packages',
      'Good route for repeat metabolic, performance, hormone, and cardiovascular follow-up work',
      'Practical for Kent-Sussex crossover clients who want a staffed venous draw'
    ]
  }
};

function buildMapSrc(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

// Custom brand-coloured SVG marker for Leaflet
const AYUTA_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" width="28" height="40">
  <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#55755e"/>
  <circle cx="14" cy="14" r="6" fill="#fbfaf7"/>
</svg>`;

function renderClinicServices(container, services) {
  container.innerHTML = services.map((service) => `<li>${service}</li>`).join('');
}

// ----- Leaflet interactive map (separate listener, independent of modal) -----
document.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('clinic-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Create icon here so L is guaranteed to exist
  const markerIcon = L.divIcon({
    html: AYUTA_PIN_SVG,
    className: 'ayuta-map-marker',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42]
  });

  const map = L.map(mapEl, {
    center: [51.6, -0.85],
    zoom: 7,
    scrollWheelZoom: false,
    zoomControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  Object.entries(CLINIC_DIRECTORY).forEach(([id, clinic]) => {
    if (!clinic.lat || !clinic.lng) return;
    const marker = L.marker([clinic.lat, clinic.lng], { icon: markerIcon, title: clinic.name })
      .addTo(map)
      .bindPopup(
        `<div class="map-popup"><strong>${clinic.name}</strong><span class="map-popup-region">${clinic.region}</span><button class="map-popup-btn" data-popup-clinic="${id}">View details</button></div>`,
        { closeButton: false, className: 'ayuta-popup' }
      );

    marker.on('popupopen', () => {
      const btn = marker.getPopup().getElement().querySelector('[data-popup-clinic]');
      if (btn) {
        btn.addEventListener('click', () => {
          map.closePopup();
          // Dispatch a synthetic click on the corresponding clinic card
          const card = document.querySelector(`[data-clinic-id="${id}"]`);
          if (card instanceof HTMLElement) card.click();
        });
      }
    });
  });

  // Fly to pin when a clinic card is clicked
  document.querySelectorAll('[data-clinic-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const clinic = CLINIC_DIRECTORY[card.dataset.clinicId];
      if (clinic?.lat && clinic.lng) {
        map.flyTo([clinic.lat, clinic.lng], 13, { duration: 0.8 });
      }
    });
  });
});

// ----- Clinic modal -----
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[data-clinic-modal]');
  const cards = Array.from(document.querySelectorAll('[data-clinic-id]'));

  if (!modal || !cards.length) return;

  const region = modal.querySelector('[data-clinic-modal-region]');
  const title = modal.querySelector('[data-clinic-modal-title]');
  const summary = modal.querySelector('[data-clinic-modal-summary]');
  const address = modal.querySelector('[data-clinic-modal-address]');
  const hours = modal.querySelector('[data-clinic-modal-hours]');
  const access = modal.querySelector('[data-clinic-modal-access]');
  const services = modal.querySelector('[data-clinic-modal-services]');
  const mapFrame = modal.querySelector('[data-clinic-modal-map]');
  const closeButtons = modal.querySelectorAll('[data-clinic-modal-close]');
  const closeButton = modal.querySelector('.clinic-modal-close');
  let lastTrigger = null;

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('clinic-modal-open');
    if (mapFrame) mapFrame.src = 'about:blank';
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  };

  const openModal = (clinicId, trigger) => {
    const clinic = CLINIC_DIRECTORY[clinicId];
    if (!clinic) return;

    lastTrigger = trigger;
    region.textContent = clinic.region;
    title.textContent = clinic.name;
    summary.textContent = clinic.summary;
    address.textContent = clinic.address;
    hours.textContent = clinic.hours;
    access.textContent = clinic.access;
    renderClinicServices(services, clinic.services);
    mapFrame.src = buildMapSrc(clinic.mapQuery || clinic.address);
    modal.hidden = false;
    document.body.classList.add('clinic-modal-open');
    if (closeButton instanceof HTMLElement) closeButton.focus();
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      openModal(card.dataset.clinicId, card);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
});
