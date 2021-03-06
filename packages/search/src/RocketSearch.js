/* eslint-disable @typescript-eslint/ban-ts-comment */
import { html, LitElement, css } from 'lit-element';
import MiniSearch from 'minisearch';
import { repeat } from 'lit-html/directives/repeat.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { RocketSearchCombobox } from './RocketSearchCombobox';
import { RocketSearchOption } from './RocketSearchOption';
import { highlightSearchTerms, joinTitleHeadline } from './utils-shared';

/** @typedef {import('./types').RocketSearchResult} RocketSearchResult */

/**
 * @param {object} options
 * @param {RocketSearchResult} options.result
 * @param {string} options.search
 */
function getTitle({ result, search }) {
  const { terms, title, headline } = result;

  const header = joinTitleHeadline(title, headline);
  return highlightSearchTerms({ text: header, search, terms });
}

/**
 * @param {object} options
 * @param {RocketSearchResult} options.result
 * @param {string} options.search
 */
function getText({ result, search }) {
  const { terms, body } = result;

  return highlightSearchTerms({ text: body, search, terms });
}

// @ts-expect-error https://github.com/microsoft/TypeScript/issues/40110
export class RocketSearch extends ScopedElementsMixin(LitElement) {
  static get properties() {
    return {
      jsonUrl: { type: String, attribute: 'json-url' },
      search: { type: String },
      results: { type: Array },
      maxResults: { type: Number, attribute: 'max-results' },
    };
  }

  static get scopedElements() {
    return {
      'rocket-search-combobox': RocketSearchCombobox,
      'rocket-search-option': RocketSearchOption,
    };
  }

  constructor() {
    super();
    this.jsonUrl = '';
    this.search = '';
    this.maxResults = 10;
    /**
     * @type {RocketSearchResult[]}
     */
    this.results = [];
    this.miniSearch = null;
  }

  async setupSearch() {
    if (!this.jsonUrl) {
      throw new Error(
        'You need to provide a url to your json index. use for example: <rocket-search json-url="https://.../search-index.json"></rocket-search>',
      );
    }

    let responseText;
    try {
      const response = await fetch(this.jsonUrl);
      responseText = await response.text();
    } catch (e) {
      throw new Error(`The given json-url "${this.jsonUrl}" could not be fetched.`);
    }

    if (responseText[0] !== '{') {
      throw new Error(`The given json-url "${this.jsonUrl}" could not be fetched.`);
    }

    this.miniSearch = MiniSearch.loadJSON(responseText, {
      fields: ['title', 'headline', 'body'],
      searchOptions: {
        boost: { headline: 3, title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  get combobox() {
    return this.shadowRoot?.children[0];
  }

  /** @param {import('lit-element').PropertyValues } changedProperties */
  update(changedProperties) {
    if (this.miniSearch && changedProperties.has('search')) {
      this.results = /** @type {RocketSearchResult[]} */ (this.miniSearch.search(
        this.search,
      )).slice(0, this.maxResults);
    }

    super.update(changedProperties);
  }

  render() {
    return html`
      <rocket-search-combobox
        name="combo"
        label="Rocket Search"
        @input=${ev => {
          this.search = ev.target.value;
        }}
        @focus=${() => {
          this.setupSearch();
        }}
      >
        ${repeat(
          this.results,
          result => result.id,
          result => html`
            <rocket-search-option
              href=${result.id}
              rel="noopener noreferrer"
              .title=${getTitle({ result, search: this.search })}
              .choiceValue=${this.search}
              .text=${getText({ result, search: this.search })}
              .section=${result.section ? result.section : 'others'}
            ></rocket-search-option>
          `,
        )}
      </rocket-search-combobox>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      ::slotted(input.form-control) {
        caret-color: var(--rocket-search-caret-color, initial);
      }
    `;
  }
}
