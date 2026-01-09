import { store } from '../lib/store.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="flex flex-col h-full overflow-auto">
      <!-- Navbar -->
      <nav class="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-panel)] sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div style="width:32px;height:32px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:1.2rem;">A</div>
          <span class="font-mono font-bold text-xl">API Platform</span>
        </div>
        <div class="flex items-center gap-6">
          <a href="#" class="text-sm text-muted hover:text-white no-underline">Docs</a>
          <a href="#" class="text-sm text-muted hover:text-white no-underline">Pricing</a>
          <button id="btn-login" class="btn btn-primary">
            Launch Dashboard
          </button>
        </div>
      </nav>

      <!-- Hero -->
      <div class="py-20 px-6 text-center max-w-4xl mx-auto">
        <div class="badge badge-ok inline-block mb-4">Beta Now Public</div>
        <h1 class="text-6xl font-bold mb-6 tracking-tight">
          Ship Node.js <span class="text-primary">Instantly</span>.
        </h1>
        <p class="text-xl text-muted mb-10 leading-relaxed">
          The developer cloud for the Websim ecosystem. Deploy APIs, webhooks, and microservices in seconds directly from your browser.
        </p>
        
        <div class="flex justify-center gap-4 mb-16">
          <button id="btn-cta-main" class="btn btn-primary text-lg px-8 py-4 rounded-lg">
            Start Building Free
          </button>
          <button class="btn text-lg px-8 py-4 rounded-lg">
            View Documentation
          </button>
        </div>

        <!-- Code Demo -->
        <div class="grid grid-cols-2 text-left rounded-lg overflow-hidden border border-[var(--border)] bg-[#0e0e11] shadow-2xl">
          <div class="p-4 border-r border-[var(--border)]">
            <div class="flex gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre class="font-mono text-sm text-gray-300">
<span class="text-purple-400">const</span> app = express();

app.<span class="text-blue-400">get</span>(<span class="text-green-400">'/'</span>, (req, res) => {
  res.json({
    status: <span class="text-green-400">'live'</span>,
    region: <span class="text-green-400">'websim-global'</span>
  });
});</pre>
          </div>
          <div class="p-4 bg-[var(--bg-panel)] flex flex-col justify-center items-center">
            <div class="text-center">
              <div class="text-green-400 font-mono text-4xl mb-2">200 OK</div>
              <div class="text-muted text-sm font-mono">14ms latency</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="py-20 bg-[var(--bg-panel)] border-t border-[var(--border)]">
        <div class="max-w-6xl mx-auto px-6 grid-cols-4">
          ${featureCard('🚀', 'Instant Deploy', 'From code to URL in under 1 second.')}
          ${featureCard('🛡️', 'Secure Sandbox', 'Isolated execution environment.')}
          ${featureCard('🌐', 'Global Mesh', 'Available on api.on.websim.com.')}
          ${featureCard('⚡', 'Real-time', 'WebSocket and EventSource ready.')}
        </div>
      </div>
      
      <footer class="p-8 text-center text-muted text-sm border-t border-[var(--border)]">
        <p>&copy; 2023 Websim API Platform. Built for developers.</p>
      </footer>
    </div>
  `;

  const go = () => store.setView('dashboard');
  container.querySelector('#btn-login').addEventListener('click', go);
  container.querySelector('#btn-cta-main').addEventListener('click', go);
}

function featureCard(icon, title, desc) {
  return `
    <div class="p-6 rounded-lg bg-[var(--bg-dark)] border border-[var(--border)]">
      <div class="text-3xl mb-4">${icon}</div>
      <h3 class="font-bold mb-2">${title}</h3>
      <p class="text-sm text-muted">${desc}</p>
    </div>
  `;
}

import { store } from '../lib/store.js';

export function renderLanding(container) {
  container.innerHTML = `
    <div class="flex flex-col h-full overflow-auto">
      <!-- Navbar -->
      <nav class="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-panel)] sticky top-0 z-50">
        <div class="flex items-center gap-3">
          <div style="width:32px;height:32px;background:var(--primary);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:1.2rem;">A</div>
          <span class="font-mono font-bold text-xl">API Platform</span>
        </div>
        <div class="flex items-center gap-6">
          <a href="#" class="text-sm text-muted hover:text-white no-underline">Docs</a>
          <button id="btn-login" class="btn btn-primary">
            Launch Dashboard
          </button>
        </div>
      </nav>

      <!-- Hero -->
      <div class="py-20 px-6 text-center max-w-4xl mx-auto">
        <div class="badge badge-ok inline-block mb-4">Beta Now Public</div>
        <h1 class="text-6xl font-bold mb-6 tracking-tight">
          Ship Node.js <span class="text-primary">Instantly</span>.
        </h1>
        <p class="text-xl text-muted mb-10 leading-relaxed">
          The developer cloud for the Websim ecosystem. Deploy APIs, webhooks, and microservices in seconds directly from your browser.
        </p>
        
        <div class="flex justify-center gap-4 mb-16">
          <button id="btn-cta-main" class="btn btn-primary text-lg px-8 py-4 rounded-lg">
            Start Building Free
          </button>
          <button class="btn text-lg px-8 py-4 rounded-lg">
            View Documentation
          </button>
        </div>

        <!-- Code Demo -->
        <div class="grid grid-cols-2 text-left rounded-lg overflow-hidden border border-[var(--border)] bg-[#0e0e11] shadow-2xl">
          <div class="p-4 border-r border-[var(--border)]">
            <div class="flex gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre class="font-mono text-sm text-gray-300">
<span class="text-purple-400">const</span> app = express();

app.<span class="text-blue-400">get</span>(<span class="text-green-400">'/'</span>, (req, res) => {
  res.json({
    status: <span class="text-green-400">'live'</span>,
    region: <span class="text-green-400">'websim-global'</span>
  });
});</pre>
          </div>
          <div class="p-4 bg-[var(--bg-panel)] flex flex-col justify-center items-center">
            <div class="text-center">
              <div class="text-green-400 font-mono text-4xl mb-2">200 OK</div>
              <div class="text-muted text-sm font-mono">14ms latency</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="py-20 bg-[var(--bg-panel)] border-t border-[var(--border)]">
        <div class="max-w-6xl mx-auto px-6 grid-cols-4">
          ${featureCard('🚀', 'Instant Deploy', 'From code to URL in under 1 second.')}
          ${featureCard('🛡️', 'Secure Sandbox', 'Isolated execution environment.')}
          ${featureCard('🌐', 'Global Mesh', 'Available on api.on.websim.com.')}
          ${featureCard('⚡', 'Real-time', 'WebSocket and EventSource ready.')}
        </div>
      </div>
      
      <footer class="p-8 text-center text-muted text-sm border-t border-[var(--border)]">
        <p>&copy; 2023 Websim API Platform. Built for developers.</p>
      </footer>
    </div>
  `;

  const go = () => store.setView('dashboard');
  container.querySelector('#btn-login').addEventListener('click', go);
  container.querySelector('#btn-cta-main').addEventListener('click', go);
}

function featureCard(icon, title, desc) {
  return `
    <div class="p-6 rounded-lg bg-[var(--bg-dark)] border border-[var(--border)]">
      <div class="text-3xl mb-4">${icon}</div>
      <h3 class="font-bold mb-2">${title}</h3>
      <p class="text-sm text-muted">${desc}</p>
    </div>
  `;
}