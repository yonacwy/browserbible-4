/**
 * MainMenu
 * Main application menu
 */

import helpers from '../lib/helpers.esm.js';
import { getAllMenuComponents } from '../core/registry.js';

export class MainMenu {
  constructor(headerNode) {
    this.node = headerNode;
    this.components = [];

    // Create logo
    const logo = helpers.createElements('<div id="app-logo"></div>');
    this.node.appendChild(logo);

    // Create menu container
    this.menuContainer = helpers.createElements('<div class="main-menu-container"></div>');
    this.node.appendChild(this.menuContainer);

    // Initialize all registered menu components
    this._initComponents();
  }

  _initComponents() {
    const allComponents = getAllMenuComponents();

    for (const [name, ComponentClass] of allComponents) {
      try {
        // Support both class constructors and factory functions
        const isClass = ComponentClass.prototype && ComponentClass.prototype.constructor === ComponentClass;
        const component = isClass
          ? new ComponentClass(this.menuContainer, this)
          : ComponentClass(this.menuContainer, this);

        if (component) {
          this.components.push(component);
        }
      } catch (error) {
        console.error(`Failed to initialize menu component "${name}":`, error);
      }
    }
  }

  getComponents() {
    return this.components;
  }
}

export default MainMenu;
