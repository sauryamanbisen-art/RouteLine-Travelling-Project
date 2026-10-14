/**
 * RouteLine Airport Autocomplete Controller
 * 
 * Provides an accessible, keyboard-navigable autocomplete experience
 * connecting airports.json to RouteLine flight search inputs.
 */

import { searchAirports, getAirportByCode } from './flight-data.js';

export function setupAirportAutocomplete({
  inputEl,
  onSelect,
  placeholderHeader = 'Popular Airports',
  initialAirportCode = ''
}) {
  if (!inputEl) return null;

  // Ensure parent has position: relative for absolute dropdown placement
  const parentBox = inputEl.closest('.dock-input-box') || inputEl.parentElement;
  if (parentBox) {
    parentBox.style.position = 'relative';
  }

  // Create dropdown container
  const dropdown = document.createElement('div');
  dropdown.className = 'airport-dropdown-menu hidden';
  dropdown.setAttribute('role', 'listbox');
  dropdown.setAttribute('id', `${inputEl.id || 'airport'}-dropdown`);
  parentBox.appendChild(dropdown);

  let currentItems = [];
  let highlightedIndex = -1;
  let isOpen = false;
  let selectedAirport = initialAirportCode ? getAirportByCode(initialAirportCode) : null;

  function renderList(query = '') {
    const results = searchAirports(query, 8);
    currentItems = results;
    highlightedIndex = -1;

    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="airport-empty-state">
          <span class="material-symbols-outlined" style="font-size:28px; color:#9ca3af; display:block; margin:0 auto 6px;">flight_takeoff</span>
          <div class="font-bold text-gray-800">No airports found</div>
          <div class="text-xs text-gray-400 mt-1">Try searching by city (e.g. "Delhi", "London") or code (e.g. "DEL", "LHR")</div>
        </div>
      `;
      dropdown.classList.remove('hidden');
      isOpen = true;
      return;
    }

    const headerText = query.trim() ? `Matching Airports (${results.length})` : placeholderHeader;

    let html = `
      <div class="airport-dropdown-header">
        <span>${headerText}</span>
        <span class="text-[10px] text-gray-400 font-normal">Use ↑↓ &amp; Enter</span>
      </div>
    `;

    results.forEach((airport, idx) => {
      const isDomestic = airport.countryCode === 'IN';
      const badgeClass = isDomestic ? 'airport-option-badge' : 'airport-option-badge intl';
      const badgeText = isDomestic ? 'Domestic' : 'International';

      html += `
        <div class="airport-option-item" role="option" data-index="${idx}" id="${inputEl.id}-opt-${idx}">
          <div class="airport-option-content">
            <div class="airport-option-city">
              <span>${airport.city}</span>
              <span class="${badgeClass}">${badgeText}</span>
            </div>
            <div class="airport-option-name" title="${airport.name}">${airport.name}</div>
          </div>
          <div class="airport-option-right">
            <span class="iata-pill">${airport.iataCode}</span>
            <span class="airport-country-label">${airport.country}</span>
          </div>
        </div>
      `;
    });

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
    isOpen = true;

    // Attach click listeners to options
    dropdown.querySelectorAll('.airport-option-item').forEach(opt => {
      opt.addEventListener('mousedown', (e) => {
        // Use mousedown so it fires before input blur
        e.preventDefault();
        const idx = parseInt(opt.dataset.index, 10);
        selectOption(idx);
      });
    });
  }

  function selectOption(index) {
    if (index >= 0 && index < currentItems.length) {
      const chosen = currentItems[index];
      selectedAirport = chosen;
      inputEl.value = `${chosen.city} (${chosen.iataCode})`;
      inputEl.setAttribute('data-iata', chosen.iataCode);
      inputEl.setAttribute('data-city', chosen.city);
      closeDropdown();
      if (typeof onSelect === 'function') {
        onSelect(chosen);
      }
    }
  }

  function updateHighlight() {
    const opts = dropdown.querySelectorAll('.airport-option-item');
    opts.forEach((opt, idx) => {
      const isH = idx === highlightedIndex;
      opt.classList.toggle('is-highlighted', isH);
      if (isH) {
        opt.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function openDropdown() {
    const isFormattedSelected = selectedAirport && inputEl.value === `${selectedAirport.city} (${selectedAirport.iataCode})`;
    renderList(isFormattedSelected ? '' : inputEl.value);
  }

  function closeDropdown() {
    dropdown.classList.add('hidden');
    isOpen = false;
    highlightedIndex = -1;
  }

  // Input event listeners
  inputEl.addEventListener('focus', () => {
    openDropdown();
    setTimeout(() => {
      try {
        inputEl.select();
      } catch (err) {}
    }, 15);
  });

  inputEl.addEventListener('click', () => {
    if (!isOpen) {
      openDropdown();
    }
  });

  inputEl.addEventListener('input', () => {
    // When user types, render matching list
    renderList(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        openDropdown();
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % currentItems.length;
      updateHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex - 1 + currentItems.length) % currentItems.length;
      updateHighlight();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        selectOption(highlightedIndex);
      } else if (currentItems.length > 0) {
        // If nothing highlighted yet, pick the top result
        e.preventDefault();
        selectOption(0);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    } else if (e.key === 'Tab') {
      closeDropdown();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!parentBox.contains(e.target)) {
      closeDropdown();
    }
  });

  return {
    getSelectedAirport: () => selectedAirport,
    setSelectedAirport: (airport) => {
      if (!airport) return;
      selectedAirport = airport;
      inputEl.value = `${airport.city} (${airport.iataCode})`;
      inputEl.setAttribute('data-iata', airport.iataCode);
      inputEl.setAttribute('data-city', airport.city);
    },
    close: closeDropdown,
    open: openDropdown
  };
}
