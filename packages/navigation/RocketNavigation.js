export class RocketNavigation extends HTMLElement {
  constructor() {
    super();
    this.list = [];
    this.__scrollHandler = this.__scrollHandler.bind(this);
  }

  connectedCallback() {
    this.addEventListener('click', ev => {
      const el = ev.target;
      if (el.classList.contains('anchor')) {
        this.dispatchEvent(new Event('close-overlay', { bubbles: true }));
      }
      const links = el.parentElement.querySelectorAll('ul a');
      if (links.length > 1) {
        const subLink = links[1];
        if (!subLink.classList.contains('anchor')) {
          ev.preventDefault();
          subLink.click();
        }
      }
    });

    const anchors = this.querySelectorAll('li.current a.anchor');

    for (const anchor of anchors) {
      const headline = document.getElementById(anchor.hash.substring(1));
      this.list.push({
        top: headline.getBoundingClientRect().top,
        headline,
        anchor,
      });
    }

    // TODO: debounce
    window.addEventListener('scroll', this.__scrollHandler);

    this.__scrollHandler();
  }

  __scrollHandler() {
    for (const listObj of this.list) {
      listObj.top = listObj.headline.getBoundingClientRect().top;
    }
    const sorted = this.list.sort((a, b) => Math.abs(a.top) - Math.abs(b.top));

    for (let i = 0; i < sorted.length; i += 1) {
      if (i === 0) {
        sorted[0].anchor.parentElement.classList.add('current');
      } else {
        sorted[i].anchor.parentElement.classList.remove('current');
      }
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.__scrollHandler);
  }
}
