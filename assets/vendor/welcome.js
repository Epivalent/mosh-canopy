// The guide loads before the scene so a first visit has useful content while
// the archive starts. A native modal keeps scene shortcuts and focus outside it.
(()=>{
  const storageKey='mosh-welcome-dismissed-v1',help=document.getElementById('bHelp');
  const dialog=document.createElement('dialog');dialog.id='welcomeDialog';dialog.setAttribute('aria-labelledby','welcomeTitle');
  dialog.innerHTML=`<div class="guide-body">
    <header><p class="guide-eyebrow">Mosh Canopy / a moving-image playground</p>
      <h2 id="welcomeTitle" tabindex="-1">Follow a film. Find a thread.</h2>
      <p class="guide-intro">Drift through an endless net of films. Their voices become spiralling text; their objects become the pieces of an evolving collage.</p>
      <button class="guide-close" aria-label="Close guide" data-close>×</button>
    </header>
    <div class="guide-grid">
      <article><span class="guide-number">01</span><h3>Let the archive lead</h3><p><strong>Following</strong> visits films, unfolds their frames into sheets, then cuts out objects for the collage. <strong>Skip</strong> moves on; <strong>Collage</strong> visits the latest composition.</p></article>
      <article><span class="guide-number">02</span><h3>Take your own route</h3><p>Drag to orbit, scroll or pinch to zoom, and <strong>click a bead</strong> to watch its film. Hover the large viewing frame for playback, seeking and volume. <strong>Archive</strong> filters sources, eras and categories.</p></article>
      <article><span class="guide-number">03</span><h3>Travel by words</h3><p>Click a subtitle word or choose <strong>Words</strong> to find it across available transcripts. Browse the aligned stack, then click text to watch that moment. Hover a text ribbon to read along; its title opens the film. <strong>Say it</strong> turns your own text into a path of borrowed MIA film phrases, with matched volume and clickable captions.</p></article>
      <article><span class="guide-number">04</span><h3>Change the texture</h3><p><strong>Mix</strong> adjusts glitch, sheets, pacing, cutouts and text ribbons. Try <strong>Dream</strong> in a film’s playback controls for local diffusion effects. Its GPU models download only when enabled.</p></article>
    </div>
    <details id="bridgeInstall"><summary>YouTube bridge for Chrome &amp; Brave <span class="guide-tag">Optional extension</span></summary>
      <div class="guide-detail">
        <p>Ordinary YouTube playback, collected previews and published transcripts work without the bridge. Install it for live film pixels, Dream effects and extraction from the playing YouTube film, plus audio capture for live transcription when captions are missing.</p>
        <a class="guide-download" id="bridgeDownload" href="https://epivalent.github.io/mosh-canopy/downloads/mosh-canopy-youtube-bridge.zip" download>Download YouTube bridge ZIP</a>
        <p class="guide-version" id="bridgeDownloadInfo">For desktop Chrome or Brave.</p>
        <ol>
          <li><strong>Unzip the download</strong> into a folder you’ll keep. Inside is a <code>youtube-bridge</code> folder containing <code>manifest.json</code>.</li>
          <li>Open a new tab and paste <code>chrome://extensions</code> <button class="guide-copy" data-copy="chrome://extensions">Copy Chrome address</button><br>In Brave, use <code>brave://extensions</code> <button class="guide-copy" data-copy="brave://extensions">Copy Brave address</button>.</li>
          <li>Switch on <strong>Developer mode</strong>, choose <strong>Load unpacked</strong>, and select the <code>youtube-bridge</code> folder containing <code>manifest.json</code>. Select the folder, not the ZIP.</li>
          <li>Return here. Open your browser’s <strong>Extensions</strong> menu and click <strong>Mosh Canopy — YouTube bridge</strong> to enable this site, then <strong>reload this page</strong>.</li>
          <li>Choose <strong>Hear films</strong> to enable sound. Use the same browser profile where you installed the extension; for a private window, enable <strong>Allow in Incognito</strong> in its extension settings.</li>
        </ol>
        <p>The bridge passes playing YouTube frames, captions and speech audio to the Mosh Canopy site you enable. YouTube playback and cookies stay in your browser. It doesn’t make unavailable films playable.</p>
        <p><strong>Updating?</strong> Extract the new ZIP over your existing extension folder, click the extension’s <strong>Reload</strong> button on the extensions page, then reload Mosh Canopy.</p>
        <p class="guide-footnote"><a href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked" target="_blank" rel="noopener">Chrome’s illustrated installation guide ↗</a></p>
      </div>
    </details>
    <details><summary>Controls &amp; things to try</summary><div class="guide-detail">
      <dl class="guide-shortcuts"><dt>Drag / Shift-drag</dt><dd>Orbit / pan. Right-drag also pans.</dd><dt>Scroll / pinch</dt><dd>Zoom through the net.</dd><dt><kbd>F</kbd></dt><dd>Switch between following and exploring.</dd><dt><kbd>Space</kbd> / <kbd>N</kbd></dt><dd>Pause the show / skip to another film.</dd><dt><kbd>[</kbd> / <kbd>]</kbd></dt><dd>Move through an aligned transcript stack.</dd><dt><strong>CC</strong></dt><dd>Show or hide clickable subtitles.</dd></dl>
      <p>Try choosing news in <strong>Archive</strong>, then search a topic in <strong>Words</strong>. Search uses the exploration filters unless you untick that option in its catalogue filters. Coverage reflects the transcripts available, not every film in the catalogue.</p>
      <p>In <strong>Mix → Collage composer</strong>, add your OpenRouter key and edit the prompt to arrange cutouts from the collection. Composition sends cutouts and film titles to your chosen model and uses your API account. Automatic recomposition is optional.</p>
      <p>Moving Image Archive films work directly. MyRetroTVs films play through YouTube; distant beads use collected previews, with film thumbnails where no animation is available. Speech captions use published transcripts or live transcription where audio access and browser support allow it.</p>
      <p class="guide-footnote">You can reopen this guide any time with <strong>Guide</strong> in the bottom controls.</p>
    </div></details>
    </div>
    <footer class="guide-footer"><label class="guide-remember"><input id="welcomeRemember" type="checkbox" checked> Skip this welcome next time</label>
    <div class="guide-actions"><button class="guide-enter guide-quiet" data-enter="quiet">Enter quietly</button><button class="guide-enter" data-enter="sound">Enter with sound</button></div></footer>`;
  document.body.append(dialog);
  const remember=dialog.querySelector('#welcomeRemember');
  let ready=document.readyState!=='loading';
  function available(){ready=true;for(const b of dialog.querySelectorAll('[data-enter]'))b.disabled=false;}
  if(!ready){for(const b of dialog.querySelectorAll('[data-enter]'))b.disabled=true;document.addEventListener('DOMContentLoaded',available,{once:true});}
  function show(){if(!dialog.open){dialog.showModal();help.setAttribute('aria-expanded','true');dialog.querySelector('#welcomeTitle').focus();dialog.scrollTop=0;}}
  function close(){try{if(remember.checked)localStorage.setItem(storageKey,'1');else localStorage.removeItem(storageKey);}catch{}dialog.close();}
  help.addEventListener('click',show);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('close',()=>{help.setAttribute('aria-expanded','false');help.focus({preventScroll:true});});
  for(const type of ['pointerdown','pointerup','click','wheel','keydown','dragenter','dragover','drop'])dialog.addEventListener(type,e=>e.stopPropagation());
  dialog.querySelector('[data-close]').onclick=close;
  for(const b of dialog.querySelectorAll('[data-enter]'))b.onclick=()=>{if(!ready)return;window.dispatchEvent(new CustomEvent('mosh-welcome-sound',{detail:b.dataset.enter==='sound'}));close();};
  for(const b of dialog.querySelectorAll('[data-copy]'))b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copied';}catch{b.textContent='Select and copy the address above';}};
  // No player is opened merely to detect an extension. A real player handshake
  // belongs to normal film loading, not the welcome screen.
  fetch('https://epivalent.github.io/mosh-canopy/downloads/youtube-bridge.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Download metadata unavailable');return r.json();}).then(info=>{
    const link=dialog.querySelector('#bridgeDownload');link.href='https://epivalent.github.io/mosh-canopy/downloads/mosh-canopy-youtube-bridge.zip?v='+encodeURIComponent(info.version);
    dialog.querySelector('#bridgeDownloadInfo').textContent=`Version ${info.version} · ${Math.ceil(info.bytes/1024)} KB · desktop Chrome / Brave`;
  }).catch(()=>{});
  let dismissed=false;try{dismissed=localStorage.getItem(storageKey)==='1';}catch{}
  if(!dismissed)show();
})();
