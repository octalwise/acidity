const backupURLs = [
  'archive.today',
  'archive.fo',
  'archive.is',
  'archive.li',
  'archive.md',
  'archive.ph',
  'archive.vn'
];

async function archive(tab) {
  const url = new URL(tab.url);

  const { archive, newTab, backups } = await browser.storage.local.get(['archive', 'newTab', 'backups']);

  try {
    new URL(archive);
  } catch {
    console.error(`Invalid archive URL: ${archive}`);
    return;
  }

  const host = url.hostname;
  if (backupURLs.includes(host) || host === new URL(archive).hostname) return;

  let base = archive;

  if (backups && !(await test(archive))) {
    await new Promise((resolve) => {
      let remaining = backupURLs.length;

      backupURLs.forEach((url) => {
        url = `https://${url}/newest/`;

        test(url)
          .then((t) => {
            if (t) {
              base = url;
              resolve();
            }
          })
          .finally(() => {
            if (--remaining === 0) {
              resolve();
            }
          });
      });
    });
  }

  const archivedURL = new URL(`${url.host}${url.pathname}`, base).toString();

  if (newTab) {
    browser.tabs.create({ url: archivedURL, index: tab.index + 1 });
  } else {
    browser.tabs.update(tab.id, { url: archivedURL });
  }
}

async function test(url) {
  try {
    const res = await fetch(new URL(url).origin, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

browser.storage.local.get(['archive'])
  .then(({ archive }) => {
    if (!archive) {
      browser.storage.local.set({ archive: 'https://archive.ph/newest/' });
    }
  });

browser.browserAction.onClicked.addListener(archive);

browser.tabs.onUpdated.addListener(async (_tabId, changed, tab) => {
  if (!changed.url) return;

  const { matches } = await browser.storage.local.get(['matches']);

  if (!Array.isArray(matches)) return;

  for (const match of matches) {
    const regex = new RegExp(`^${match}$`);

    if (regex.test(tab.url)) {
      await archive(tab);
      return;
    }
  }
});

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
