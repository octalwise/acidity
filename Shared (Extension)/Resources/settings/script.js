function validate(className, value, error) {
  try {
    new className(value);
  } catch {
    alert(`Invalid ${error}: ${value}`);
    return false;
  }

  return true;
}

function showMatches(matches) {
  const matchesList = document.getElementById('matches');

  if (!Array.isArray(matches)) {
    matches = [];
  }

  const children = matches.map((match, index) => {
    const matchElem = document.createElement('p');

    const removeButton = document.createElement('button');
    removeButton.innerText = '×';

    removeButton.addEventListener('click', async () => {
      const { matches } = await browser.storage.local.get(['matches']);

      const matchesClone = [...matches];
      matchesClone.splice(index, 1);

      browser.storage.local.set({ matches: matchesClone });
      showMatches(matchesClone);
    });

    matchElem.append(removeButton);
    matchElem.append(document.createTextNode(match));

    return matchElem;
  });

  matchesList.replaceChildren(...children);
}

document.getElementById('set-archive')
  .addEventListener('click', () => {
    let archive = document.getElementById('archive').value;

    if (!validate(URL, archive, 'archive URL')) {
      return;
    }

    if (!archive.endsWith('/')) {
      archive += '/';
      document.getElementById('archive').value += '/';
    }

    browser.storage.local.set({ archive });
  });


document.getElementById('new-tab')
  .addEventListener('change', (e) => {
    const newTab = e.target.checked;
    browser.storage.local.set({ newTab });
  });

document.getElementById('backups')
  .addEventListener('change', (e) => {
    const backups = e.target.checked;
    browser.storage.local.set({ backups });
  });

document.getElementById('add-match')
  .addEventListener('click', async () => {
    const match = document.getElementById('match').value;

    if (match.length === 0 || !validate(RegExp, match, 'match regex')) {
      return;
    }

    document.getElementById('match').value = '';

    let { matches } = await browser.storage.local.get(['matches']);

    if (!Array.isArray(matches)) {
      matches = [];
    }

    matches = [...matches, match];

    browser.storage.local.set({ matches });
    showMatches(matches);
  });

browser.storage.local.get(['matches'])
  .then(({ matches }) => showMatches(matches));

browser.storage.local.get(['archive'])
  .then(({ archive }) => {
    if (archive) {
      document.getElementById('archive').value = archive;
    } else {
      browser.storage.local.set({ archive: 'https://archive.ph/newest/' });
      document.getElementById('archive').value = 'https://archive.ph/newest/';
    }
  });

browser.storage.local.get(['newTab', 'backups'])
  .then(({ newTab, backups }) => {
    document.getElementById('new-tab').checked = !!newTab;
    document.getElementById('backups').checked = !!backups;
  });
