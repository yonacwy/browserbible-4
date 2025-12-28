/**
 * NavigationButtons
 * Forward/back navigation buttons
 */

import { getConfig } from '../core/config.js';
import { Reference } from '../bible/BibleReference.js';
import { TextNavigation } from '../common/Navigation.js';

export function NavigationButtons() {
  const config = getConfig();
  if (!config.enableNavigationButtons) return null;

  const d = document;
  const windowsHeader = d.querySelector('.windows-header');
  if (!windowsHeader) return null;

  const forwardButton = d.createElement('div');
  forwardButton.id = 'main-forward-button';
  forwardButton.className = 'inactive';

  const backButton = d.createElement('div');
  backButton.id = 'main-back-button';
  backButton.className = 'inactive';

  const compactBackButton = d.createElement('div');
  compactBackButton.id = 'compact-back-button';

  const compactLabel = d.createElement('span');
  compactLabel.id = 'compact-back-button-label';
  compactBackButton.appendChild(compactLabel);

  windowsHeader.appendChild(forwardButton);
  windowsHeader.appendChild(backButton);
  d.body.appendChild(compactBackButton);

  const back = () => TextNavigation.back();
  const forward = () => TextNavigation.forward();

  let compactTimer = null;

  const fadeOut = (el) => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
      el.style.opacity = '';
      el.style.transition = '';
    }, 300);
  };

  const hideCompactTimer = () => {
    if (compactBackButton.style.display !== 'none') {
      fadeOut(compactBackButton);
    }
  };

  const clearCompactTimer = () => {
    if (compactTimer !== null) {
      clearTimeout(compactTimer);
    }
  };

  const startCompactTimer = () => {
    clearCompactTimer();
    compactTimer = setTimeout(hideCompactTimer, 5000);
  };

  const updateButtonStates = () => {
    const locations = TextNavigation.getLocations();
    const locationIndex = TextNavigation.getLocationIndex();

    if (locationIndex > 0) {
      backButton.classList.remove('inactive');

      const lastRef = new Reference(locations[locations.length - 2]);
      compactLabel.innerHTML = lastRef.toString();

      compactBackButton.classList.add('active');
      compactBackButton.style.display = '';

      if (d.body.classList.contains('compact-ui')) {
        startCompactTimer();
      }
    } else {
      backButton.classList.add('inactive');
      compactBackButton.classList.remove('active');
    }

    if (locationIndex < locations.length - 1) {
      forwardButton.classList.remove('inactive');
    } else {
      forwardButton.classList.add('inactive');
    }
  };

  forwardButton.addEventListener('click', forward);
  backButton.addEventListener('click', back);
  compactBackButton.addEventListener('click', back);

  TextNavigation.on('locationchange', () => updateButtonStates());

  updateButtonStates();

  return null;
}

export default NavigationButtons;
