'use strict';

const signals = {
  metrics: {
    kicker: 'METRICS / CARDINALITY', title: 'Find the dimensions behind the growth.',
    description: 'Explore estimated OTLP series, attribute cardinality and metric structure. See which dimensions deserve a closer look before they reach your backend.',
    features: ['Estimated unique series per metric', 'Attribute and resource key breakdowns', 'Scoped findings in Metric Report'],
    image: 'assets/active-series.jpg', label: 'OCC / ACTIVE SERIES',
    alt: 'OCC Active Series view showing estimates for seven synthetic demo metrics'
  },
  traces: {
    kicker: 'TRACES / OPERATIONS', title: 'Look beyond the span count.',
    description: 'Explore span operations, services and attribute keys. Use Trace Patterns to group span-name structure and investigate unexpected variation in your instrumentation.',
    features: ['Span operations and sample counts', 'Attribute cardinality per operation', 'Span-name pattern detection'],
    image: 'assets/traces.jpg', label: 'OCC / TRACES',
    alt: 'OCC Traces view showing four synthetic demo span operations across five services'
  },
  logs: {
    kicker: 'LOGS / PATTERNS', title: 'Find the pattern in the repetition.',
    description: 'Group similar log messages into templates with the Drain algorithm. Navigate by service and severity to understand recurring messages and their frequency in collected data.',
    features: ['Automatic log template extraction', 'Service and severity navigation', 'Sample counts and example messages'],
    image: 'assets/logs.jpg', label: 'OCC / LOG PATTERNS',
    alt: 'OCC Log Patterns showing four synthetic message templates for checkout-api'
  }
};

function activateSignal(name, focus = false) {
  const signal = signals[name];
  if (!signal) return;
  document.querySelectorAll('[data-signal]').forEach((tab) => {
    const selected = tab.dataset.signal === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  document.getElementById('signal-panel').setAttribute('aria-labelledby', `tab-${name}`);
  document.getElementById('signal-kicker').textContent = signal.kicker;
  document.getElementById('signal-title').textContent = signal.title;
  document.getElementById('signal-description').textContent = signal.description;
  document.getElementById('signal-screen-label').textContent = signal.label;
  const image = document.getElementById('signal-screenshot');
  image.src = signal.image;
  image.alt = signal.alt;
  document.getElementById('full-image').href = signal.image;
  document.getElementById('signal-features').replaceChildren(...signal.features.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}

const installMethods = {
  brew: { code: 'brew install fiddeb/tap/occ\nocc', note: 'Homebrew on macOS and Linux. Or choose a binary for your platform below.' },
  binary: { code: '# Example: macOS Apple Silicon, after extracting\nchmod +x otlp_cardinality_checker-darwin-arm64\n./otlp_cardinality_checker-darwin-arm64', note: 'Use the filename for your platform. On Windows, run the downloaded .exe from PowerShell; on macOS or Linux, run the extracted binary in Terminal.' }
};

function activateInstall(name, focus = false) {
  const method = installMethods[name];
  if (!method) return;
  document.querySelectorAll('[data-install]').forEach((tab) => {
    const selected = tab.dataset.install === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  document.getElementById('install-panel').setAttribute('aria-labelledby', `install-tab-${name}`);
  document.getElementById('install-code').textContent = method.code;
  document.getElementById('install-note').textContent = method.note;
}

function bindTabs(selector, dataKey, activate) {
  const tabs = [...document.querySelectorAll(selector)];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset[dataKey]));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activate(tabs[next].dataset[dataKey], true);
      }
    });
  });
}
bindTabs('[data-signal]', 'signal', activateSignal);
bindTabs('[data-install]', 'install', activateInstall);
document.querySelectorAll('[data-jump-signal]').forEach((link) => {
  link.addEventListener('click', () => activateSignal(link.dataset.jumpSignal));
});

let copyTimer;
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = document.getElementById(button.dataset.copy);
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(code.textContent);
      status.textContent = 'Copied to clipboard.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select and copy the highlighted commands.';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { status.textContent = ''; }, 5000);
  });
});

// Only trusted public GitHub release URLs are accepted. Remote strings stay text.
function isReleaseUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' &&
      !url.username && !url.password && !url.port &&
      url.pathname.startsWith('/fiddeb/occ/releases/');
  } catch { return false; }
}

async function updatePublicRelease() {
  const status = document.getElementById('release-status');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('https://api.github.com/repos/fiddeb/occ/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal,
      credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    if (!response.ok) throw new Error('Release lookup unavailable');
    const release = await response.json();
    if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name) ||
        !isReleaseUrl(release.html_url) || !Array.isArray(release.assets)) {
      throw new Error('Unexpected public release');
    }
    const assets = new Map(release.assets.filter((asset) => asset &&
      typeof asset.name === 'string' && isReleaseUrl(asset.browser_download_url))
      .map((asset) => [asset.name, asset.browser_download_url]));
    document.querySelectorAll('[data-release-version]').forEach((element) => { element.textContent = release.tag_name; });
    document.querySelectorAll('[data-release-link]').forEach((link) => { link.href = release.html_url; });
    document.querySelectorAll('[data-asset]').forEach((link) => {
      const url = assets.get(link.dataset.asset);
      link.href = url || release.html_url;
      if (!url) link.setAttribute('aria-label', `Find ${link.dataset.asset} on the release page`);
    });
    document.querySelector('[data-checksums]').href = assets.get('SHA256SUMS') || release.html_url;
    status.textContent = `Latest public release: ${release.tag_name}. Downloads are hosted on GitHub.`;
  } catch {
    status.textContent = 'Live release lookup is unavailable. These downloads use the last verified release; check All releases for updates.';
  } finally { clearTimeout(timeout); }
}
updatePublicRelease();
