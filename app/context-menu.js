const gCM_instances = [];
let gCM_nextId = 0;

// Tiny polyfill for Element.matches() for IE
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector;
}

// Gets an element's next/previous sibling that matches the given selector
function getSibling(el, selector, direction = 1) {
  const sibling =
    direction > 0 ? el.nextElementSibling : el.previousElementSibling;
  if (!sibling || sibling.matches(selector)) {
    return sibling;
  }
  return getSibling(sibling, selector, direction);
}

// Fires custom event on given element
function emit(el, type, data = {}) {
  const event = document.createEvent('Event');

  Object.keys(data).forEach((key) => {
    event[key] = data[key];
  });

  event.initEvent(type, true, true);
  el.dispatchEvent(event);
}

class ContextMenu {
  constructor(
    selector,
    items,
    options = {
      className: '',
      minimalStyling: false,
    },
  ) {
    this.selector = selector;
    this.items = items;
    this.options = options;
    this.id = gCM_nextId++;
    this.target = null;

    this.create();
    gCM_instances.push(this);
  }

  // Creates DOM elements, sets up event listeners
  create() {
    // Create root <ul>
    this.menu = document.createElement('ul');
    this.menu.className = 'ContextMenu';
    this.menu.setAttribute('data-contextmenu', this.id);
    this.menu.setAttribute('tabindex', -1);
    this.menu.addEventListener('keyup', (e) => {
      switch (e.which) {
        case 38:
          this.moveFocus(-1);
          break;
        case 40:
          this.moveFocus(1);
          break;
        case 27:
          this.hide();
          break;
        default:
        // do nothing
      }
    });

    if (!this.options.minimalStyling) {
      this.menu.classList.add('ContextMenu--theme-default');
    }
    if (this.options.className) {
      this.options.className
        .split(' ')
        .forEach((cls) => this.menu.classList.add(cls));
    }

    // Create <li>'s for each menu item
    this.items.forEach((item, index) => {
      const li = document.createElement('li');

      if (!('name' in item)) {
        // Insert a divider
        li.className = 'ContextMenu-divider';
      } else {
        li.className = 'ContextMenu-item';
        li.textContent = item.name;
        li.setAttribute('data-contextmenuitem', index);
        li.setAttribute('tabindex', 0);
        li.addEventListener('click', this.select.bind(this, li));
        li.addEventListener('keyup', (e) => {
          if (e.which === 13) {
            this.select(li);
          }
        });
      }

      this.menu.appendChild(li);
    });

    // Add root element to the <body>
    document.body.appendChild(this.menu);

    emit(this.menu, 'created');
  }

  // Shows context menu
  show(e) {

    // Keep the context menu from going off the right of the screen
    if (isMobileBrowser()){
      this.menu.style.left = `${e.pageX-200}px`;
      this.menu.style.top = `${e.pageY}px`;
    }
    else{
      this.menu.style.left = `${e.pageX}px`;
      this.menu.style.top = `${e.pageY}px`;     
    }
    this.menu.classList.add('is-open');
    this.target = e.target;
    // Give context menu focus
    this.menu.focus();
    // Disable native context menu
    e.preventDefault();

    emit(this.menu, 'shown');
  }

  // Hides context menu
  hide() {
    this.menu.classList.remove('is-open');
    this.target = null;
    emit(this.menu, 'hidden');
  }

  // Selects the given item and calls its handler
  select(item) {
    const itemId = item.getAttribute('data-contextmenuitem');
    if (this.items[itemId]) {
      // Call item handler with target element as parameter
      this.items[itemId].fn(this.target);
    }
    this.hide();
    emit(this.menu, 'itemselected');
  }

  // Moves focus to the next/previous menu item
  moveFocus(direction = 1) {
    const focused = this.menu.querySelector('[data-contextmenuitem]:focus');
    let next;

    if (focused) {
      next = getSibling(focused, '[data-contextmenuitem]', direction);
    }

    if (!next) {
      next =
        direction > 0
          ? this.menu.querySelector('[data-contextmenuitem]:first-child')
          : this.menu.querySelector('[data-contextmenuitem]:last-child');
    }

    if (next) next.focus();
  }

  // Convenience method for adding an event listener
  on(type, fn) {
    this.menu.addEventListener(type, fn);
  }

  // Convenience method for removing an event listener
  off(type, fn) {
    this.menu.removeEventListener(type, fn);
  }

  // Removes DOM elements, stop listeners
  destroy() {
    this.menu.parentElement.removeChild(this.menu);
    this.menu = null;
    gCM_instances.splice(gCM_instances.indexOf(this), 1);
  }
}

var gInContextMenu = false;
// Listen for c event to show menu
document.addEventListener('click', (e) => {
  gCM_instances.forEach((menu) => {
    if (e.target.matches(menu.selector)) {
      menu.show(e);
    }
  });
});

// Listen for click event to hide menu
document.addEventListener('click', (e) => {
  gCM_instances.forEach((menu) => {
    if ((!e.target.matches(`[data-contextmenu="${menu.id}"], [data-contextmenu="${menu.id}"] *`)) && (!e.target.matches(menu.selector))) {
      menu.hide();
    }
  });
});
