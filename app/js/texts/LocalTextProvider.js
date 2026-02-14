/**
 * LocalTextProvider - Loads texts from content/texts/{textid}/ directory
 */

import { getConfig } from '../core/config.js';
import { fetchTextInfo } from './fetchTextInfo.js';
import { TextSearch } from './Search.js';

const providerName = 'local';
const fullName = 'Local Files';
const textData = {};

function processFootnotes(content, notes) {
  for (const footnote of notes) {
    const noteLink = footnote.querySelector('a');
    const noteid = noteLink?.getAttribute('href') ?? null;
    const footnotetext = footnote.querySelector('.text');
    const noteintext = noteid && content ? content.querySelector(noteid) : null;

    if (noteintext && footnotetext) {
      noteintext.appendChild(footnotetext);
    }
  }
}

function processContent(content, textInfo, textid) {
  if (!content) return;

  content.setAttribute('data-textid', textid);
  content.setAttribute('data-lang3', textInfo.lang);

  // section headings go before chapter markers, not after
  const c = content.querySelector('.c');
  if (c) {
    const afterc = c.nextElementSibling;
    if (afterc?.classList.contains('s')) {
      c.parentNode.insertBefore(afterc, c);
    }
  }

  // verse numbers go before the verse element for CSS styling
  for (const vnum of content.querySelectorAll('.v-num')) {
    const v = vnum.closest('.v');
    if (v) v.parentNode.insertBefore(vnum, v);
  }
}

export function getTextManifest(callback) {
  const config = getConfig();
  const textsUrl = `${config.baseContentUrl}content/texts/${config.textsIndexPath}`;

  fetch(textsUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      callback(data.textInfoData);
    })
    .catch(error => {
      console.error('Error loading text manifest:', textsUrl, error);

      if (typeof window !== 'undefined' && window.MovableWindow) {
        const modal = new window.MovableWindow(600, 250, 'Texts Error');
        const bodyEl = modal.body?.nodeType ? modal.body : modal.body?.[0];
        bodyEl.style.background = '#000';
        bodyEl.style.color = '#fff';
        bodyEl.innerHTML = `
          <div style="padding: 20px;">
            <p>Problem loading <code>${textsUrl}</code></p>
            <p>Error: ${error.message}</p>
          </div>`;
        modal.show().center();
      }
      callback(null);
    });
}

export function getTextInfo(textid, callback, errorCallback) {
  // Try standard location first, then fall back to html_chapterized/info.json
  fetchTextInfo(textData, 'content/texts', textid, (data) => {
    callback(data);
  }, (err) => {
    console.info('LocalTextProvider: info.json not found at root, trying html_chapterized for', textid);
    // use textid/html_chapterized as the textid so fetchTextInfo will look at
    // content/texts/<textid>/html_chapterized/info.json
    const fallbackId = `${textid}/html_chapterized`;
    fetchTextInfo(textData, 'content/texts', fallbackId, (data) => {
      // normalize cache key so callers can still reference by original id
      textData[textid] = data;
      callback(data);
    }, (err2) => {
      console.warn('LocalTextProvider: no info.json found for', textid);
      errorCallback?.(err2 || err);
    });
  });
}

export function loadSection(textid, sectionid, callback, errorCallback) {
  getTextInfo(textid, textInfo => {
    const config = getConfig();
    const urlBase = `${config.baseContentUrl}content/texts/${textid}/`;
    const tryUrls = [
      `${urlBase}${sectionid}.html`,
      `${urlBase}html_chapterized/${sectionid}.html`
    ];

    const tryFetch = (index) => {
      if (index >= tryUrls.length) {
        errorCallback?.(textid, sectionid);
        return;
      }

      const url = tryUrls[index];
      console.info('LocalTextProvider: attempting to fetch', url);
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then(text => {
          console.info('LocalTextProvider: fetched', url, 'length=', text.length);
          const htmlContent = text.includes('</head>') ? text.split('</head>')[1] : text;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;

          const content = tempDiv.querySelector('.section');
          // If the fetched HTML doesn't contain a section element, try the next fallback URL
          if (!content) {
            console.warn('LocalTextProvider: no .section found in', url, 'trying next fallback');
            tryFetch(index + 1);
            return;
          }

          const notes = tempDiv.querySelectorAll('.footnotes .footnote');

          if (notes.length > 0) processFootnotes(content, notes);
          processContent(content, textInfo, textid);

          const wrapperDiv = document.createElement('div');
          if (content) wrapperDiv.appendChild(content);
          callback(wrapperDiv.innerHTML);
        })
        .catch((err) => {
          console.warn('LocalTextProvider: fetch failed for', url, err && err.message);
          tryFetch(index + 1);
        });
    };

    tryFetch(0);
  });
}

export function startSearch(textid, divisions, text, onSearchLoad, onSearchIndexComplete, onSearchComplete) {
  const textSearch = new TextSearch();

  textSearch.on('load', onSearchLoad);
  textSearch.on('indexcomplete', onSearchIndexComplete);
  textSearch.on('complete', onSearchComplete);

  textSearch.start(textid, divisions, text);
}

export const LocalTextProvider = {
  name: providerName,
  fullName,
  getTextManifest,
  getTextInfo,
  loadSection,
  startSearch
};

export default LocalTextProvider;
