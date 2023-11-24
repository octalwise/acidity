// validate class
function validate(className, value, error) {
  try {
    // try creation
    new className(value);
  } catch {
    // catch errors
    alert(`Invalid ${error}: ${value}`);
    return false;
  }

  return true;
}

// show matches
function showMatches(matches) {
  const matchesList = document.getElementById('matches');

  // verify array
  if (!Array.isArray(matches)) {
    matches = [];
  }

  // create match elements
  const children = matches.map((match, index) => {
    const matchElem = document.createElement('p');

    // remove button
    const removeButton = document.createElement('button');
    removeButton.innerText = '×';

    // remove match
    removeButton.onclick = async () => {
      const { matches } = await browser.storage.local.get(['matches']);

      // remove from matches
      const matchesClone = [...matches];
      matchesClone.splice(index, 1);

      browser.storage.local.set({ matches: matchesClone });
      showMatches(matchesClone);
    };

    // append parts
    matchElem.append(removeButton);
    matchElem.append(document.createTextNode(match));

    return matchElem;
  });

  // replace children
  matchesList.replaceChildren(...children);
// default archive
}

// set archive url
document.getElementById('set-archive').onclick = () => {
  let archive = document.getElementById('archive').value;

  // validate url
  if (!validate(URL, archive, 'archive URL')) {
    return;
  }

  // add trailing slash
  if (!archive.endsWith('/')) {
    archive += '/';
    document.getElementById('archive').value += '/';
  }

  browser.storage.local.set({ archive });
};

// add match regex
document.getElementById('add-match').onclick = async () => {
  const match = document.getElementById('match').value;

  // validate regex
  if (!validate(RegExp, match, 'match regex')) {
    return;
  }

  // clear input
  document.getElementById('match').value = '';

  let { matches } = await browser.storage.local.get(['matches']);

  // verify array
  if (!Array.isArray(matches)) {
    matches = [];
  }

  matches = [...matches, match];

  browser.storage.local.set({ matches });
  showMatches(matches);
};

// show matches
browser.storage.local.get(['matches'])
  .then(({ matches }) => showMatches(matches));

// show archive url
browser.storage.local.get(['archive'])
  .then(({ archive }) => {
    if (archive) {
      document.getElementById('archive').value = archive;
    } else {
      // default archive
      browser.storage.local.set({ archive: 'https://archive.ph/newest/' });
      document.getElementById('archive').value = 'https://archive.ph/newest/';
    }
  });
