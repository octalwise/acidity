// navigate to archived url
async function archive(tab) {
  const url = new URL(tab.url);
  const { archive, newTab } = await browser.storage.local.get(['archive', 'newTab']);

  // try creating url
  try {
    new URL(archive);
  } catch {
    alert(`Invalid archive URL: ${archive}`);
    return;
  }

  const archivedURL = new URL(`${url.host}${url.pathname}`, archive).toString();

  if (newTab) {
    // open new tab
    browser.tabs.create({ url: archivedURL, index: tab.index + 1 });
  } else {
    // update page
    browser.tabs.update(tab.id, { url: archivedURL });
  }
}

browser.storage.local.get(['archive'])
  .then(({ archive }) => {
    if (!archive) {
      // default archive
      browser.storage.local.set({ archive: 'https://archive.ph/newest/' });
    }
  });

// listener for click
browser.browserAction.onClicked.addListener(archive);

// listener for update
browser.tabs.onUpdated.addListener(async (_tabId, changed, tab) => {
  if (!changed.url) {
    return;
  }

  const { matches } = await browser.storage.local.get(['matches']);

  if (!Array.isArray(matches)) {
    return;
  }

  for (const match of matches) {
    // match whole string
    const regex = new RegExp(`^${match}$`);

    // test tab url
    if (regex.test(tab.url)) {
      await archive(tab);
      return;
    }
  }
});

// context menu action
browser.menus.create({
  id: 'archive',
  title: 'Go to Archive',
  contexts: ['all'],
});

browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'archive') {
    archive(tab);
  }
});
