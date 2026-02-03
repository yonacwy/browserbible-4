/**
 * SimpleWordCloud - Lightweight CSS-based word cloud
 * Replaces the heavier canvas-based wordcloud library
 */

/**
 * Render a word cloud into a container element
 * @param {HTMLElement} container - The container element
 * @param {Object} options - Configuration options
 * @param {Array} options.list - Array of [word, weight] tuples
 * @param {Function} options.weightFactor - Function(weight) returning font size
 * @param {Function} options.color - Function(word, weight) returning CSS color
 * @param {Function} options.hover - Callback(item) when hovering, item is [word, weight] or null
 * @param {number} options.minSize - Minimum font size to display (default: 0)
 */
export function renderWordCloud(container, options) {
  const {
    list = [],
    weightFactor = (w) => w,
    color = () => '#333',
    hover = null,
    minSize = 0
  } = options;

  // Clear container
  container.innerHTML = '';

  // Apply container styles
  Object.assign(container.style, {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    gap: '0.4em',
    overflow: 'hidden',
    padding: '1em'
  });

  // Filter and shuffle words for visual variety
  const filteredList = list.filter(([, weight]) => {
    const size = weightFactor(weight);
    return size >= minSize;
  });

  const shuffledList = shuffleArray([...filteredList]);

  // Create word elements
  for (const [word, weight] of shuffledList) {
    const size = weightFactor(weight);
    const wordColor = color(word, weight);

    const span = document.createElement('span');
    span.textContent = word;
    span.className = 'wordcloud-word';

    Object.assign(span.style, {
      fontSize: `${size}px`,
      color: wordColor,
      cursor: hover ? 'pointer' : 'default',
      transition: 'transform 0.15s ease, opacity 0.15s ease',
      display: 'inline-block',
      lineHeight: '1.1',
      whiteSpace: 'nowrap'
    });

    // Store data for hover callback
    span.dataset.word = word;
    span.dataset.weight = weight;

    if (hover) {
      span.addEventListener('mouseenter', () => {
        span.style.transform = 'scale(1.15)';
        span.style.opacity = '0.85';
        hover([word, weight]);
      });

      span.addEventListener('mouseleave', () => {
        span.style.transform = 'scale(1)';
        span.style.opacity = '1';
        hover(null);
      });
    }

    container.appendChild(span);
  }
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default renderWordCloud;
