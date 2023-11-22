function show(platform, enabled) {
  document.body.classList.add(`platform-${platform}`);

  if (typeof enabled === 'boolean') {
    document.body.classList.toggle('state-on', enabled);
    document.body.classList.toggle('state-off', !enabled);
  } else {
    document.body.classList.remove('state-on');
    document.body.classList.remove('state-off');
  }
}

function openPreferences() {
  webkit.messageHandlers.controller.postMessage('open-preferences');
}

const button = document.querySelector('button.open-preferences');
button.addEventListener('click', openPreferences);
