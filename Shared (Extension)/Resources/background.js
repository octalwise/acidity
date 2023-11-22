// navigate to archived url
async function archiveTab(tab) {
  const url = new URL(tab.url);
  const { archive } = await browser.storage.local.get(['archive']);

  // try creating url
  try {
    new URL(archive);
  } catch {
    alert(`Invalid archive URL: ${archive}`)
    return;
  }

  const archivedURL = new URL(`${url.host}${url.pathname}`, archive);

  // update url
  browser.tabs.update(tab.id, { url: archivedURL.toString() });
}

browser.storage.local.get(['archive'])
  .then(({ archive }) => {
    if (!archive) {
      // default archive
      browser.storage.local.set({ archive: 'https://archive.ph/newest/' });
    }
  });

// listener for click
browser.browserAction.onClicked.addListener(archiveTab);

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
      await archiveTab(tab);
      return;
    }
  }
});
