export const FullScreenButton = () => {
  const d = document;
  if (!d.fullscreenEnabled) return null;

  d.documentElement.classList.add('supports-fullscreen');

  const btn = d.createElement('div');
  btn.id = 'main-fullscreen-button';

  d.querySelector('.windows-header')?.appendChild(btn);

  btn.addEventListener('click', () =>
    d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen()
  );

  return btn;
};

export default FullScreenButton;
