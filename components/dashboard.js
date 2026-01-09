import { store } from '../lib/store.js';
import { createEditor } from './editor.js';
import { Runtime } from '../lib/runtime.js';

export function renderDashboard(container) {
  const render = () => {
    const { user, instances, selectedInstanceId } = store.state;
    const myInstances = Object.values(instances).filter(i => i && i.owner === user.username);
    const selectedInstance = instances[selectedInstanceId];

    container.innerHTML = `
      <div class="flex h-full">
        <!-- Sidebar -->
        <div class="sidebar border-r">
          <div class="p-4 border-b flex items-center gap-2">
            <div style="width:24px;height:24px;background:var(--primary);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;">A</div>
            <span class="font-mono font-bold">API Platform</span>
          </div>
          
          <div class="grow overflow-y-auto">
            <div class="p-4 text-xs text-muted uppercase font-bold">Your Instances</div>
            ${myInstances.length === 0 ? '<div class="px-4 text-sm text-muted">No instances yet.</div>' : ''}
            
            ${myInstances.map(inst => `
              <div class="nav-item ${inst.id === selectedInstanceId ? 'active' : ''}" data-id="${inst.id}">
                <div class="w-2 h-2 rounded-full ${inst.status === 'running' ? 'bg-green-400' : 'bg-red-400'}"></div>
                <div class="flex-grow truncate">
                  <div class="font-mono text-sm">${inst.name}</div>
                  <div class="text-xs text-muted">${inst.id}</div>
                </div>
              </div>
            `).join('')}

            <div class="p-4 mt-4 border-t border-[var(--border)]">
              <button id="btn-new-instance" class="btn w-full justify-center text-primary border-dashed hover:border-solid">
                + New Instance
              </button>
            </div>
          </div>

          <div class="p-4 border-t bg-[var(--bg-dark)]">
            <div class="flex items-center gap-2">
              <img src="${user.avatarUrl}" class="w-8 h-8 rounded-full border border-[var(--border)]">
              <div class="overflow-hidden">
                <div class="text-sm font-bold truncate">${user.username}</div>
                <div class="text-xs text-muted">Free Plan</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grow flex flex-col h-full overflow-hidden bg-[var(--bg-dark)]">
          ${selectedInstance ? renderInstanceView(selectedInstance) : renderWelcomeState()}
        </div>
      </div>
    `;

    // Bind Sidebar Events
    container.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => store.selectInstance(el.dataset.id));
    });

    const btnNew = container.querySelector('#btn-new-instance');
    if (btnNew) btnNew.addEventListener('click', () => {
      const name = prompt('Instance Name:', 'my-api');
      if (name) {
        const defaultCode = `const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Websim API!',
    timestamp: Date.now()
  });
});

app.post('/data', (req, res) => {
  const data = req.body;
  console.log('Received:', data);
  res.json({ success: true, received: data });
});
`;
        store.deployInstance(name, defaultCode).then(id => store.selectInstance(id));
      }
    });

    // Bind Instance View Events if active
    if (selectedInstance) bindInstanceEvents(container, selectedInstance);
  };

  store.subscribe(render);
  render();
}

function renderWelcomeState() {
  return `
    <div class="flex flex-col items-center justify-center h-full text-center p-8">
      <div class="w-16 h-16 bg-[var(--bg-panel)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)]">
        <span class="text-2xl">🚀</span>
      </div>
      <h2 class="text-xl font-bold mb-2">Ready to ship?</h2>
      <p class="text-muted max-w-md mb-8">Create a new Node.js instance to get started. You'll get a dedicated endpoint and real-time logs.</p>
      
      <div class="grid-cols-2 w-full max-w-2xl">
        <div class="card text-left">
          <div class="text-primary mb-2 font-mono">Documentation</div>
          <p class="text-sm text-muted">Learn how to route requests and handle data.</p>
        </div>
        <div class="card text-left">
          <div class="text-accent mb-2 font-mono">Examples</div>
          <p class="text-sm text-muted">View boilerplate code for CRUD, Auth, and more.</p>
        </div>
      </div>
    </div>
  `;
}

function renderInstanceView(inst) {
  return `
    <div class="border-b bg-[var(--bg-panel)] p-4 flex justify-between items-center">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold">${inst.name}</h2>
          <span class="badge badge-ok">Running</span>
        </div>
        <div class="font-mono text-xs text-muted mt-1 flex gap-4">
          <span>ID: ${inst.id}</span>
          <span>UPTIME: 99.9%</span>
          <span>MEM: 45MB</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn" id="btn-test">⚡ Test Endpoint</button>
        <button class="btn btn-primary" id="btn-deploy">Deploy Changes</button>
        <button class="btn btn-danger" id="btn-delete">Delete</button>
      </div>
    </div>

    <div class="flex grow overflow-hidden">
      <!-- Editor Column -->
      <div class="w-1/2 flex flex-col border-r border-[var(--border)]">
        <div class="p-2 border-b border-[var(--border)] text-xs font-mono text-muted bg-[var(--bg-panel)]">index.js</div>
        <div id="editor-mount" class="grow relative"></div>
      </div>

      <!-- Tools Column -->
      <div class="w-1/2 flex flex-col bg-[#0d0d10]">
        
        <!-- API Tester -->
        <div class="h-1/2 border-b border-[var(--border)] flex flex-col">
          <div class="p-2 border-b border-[var(--border)] text-xs font-mono text-muted bg-[var(--bg-panel)] flex justify-between">
            <span>TERMINAL / TESTER</span>
            <span class="text-accent cursor-pointer" id="btn-clear-logs">Clear</span>
          </div>
          
          <div class="p-4 border-b border-[var(--border)] bg-[var(--bg-dark)]">
            <div class="flex gap-2 mb-2">
              <select class="input w-24" id="test-method">
                <option>GET</option>
                <option>POST</option>
              </select>
              <input class="input" value="/" id="test-path" placeholder="/path">
              <button class="btn" id="btn-send-req">Send</button>
            </div>
            <textarea class="input text-xs h-16 font-mono" id="test-body" placeholder='{"key": "value"}'></textarea>
          </div>

          <div class="grow overflow-auto p-4 font-mono text-xs" id="console-output">
            <div class="text-muted">// Logs will appear here...</div>
            ${inst.logs ? inst.logs.map(l => `<div>${l}</div>`).join('') : ''}
          </div>
        </div>

        <!-- Documentation/Info -->
        <div class="h-1/2 overflow-auto p-4">
          <h3 class="font-bold text-sm mb-2 text-muted uppercase">Deployment Info</h3>
          <div class="card mb-4 bg-[var(--bg-dark)]">
            <div class="text-xs text-muted mb-1">Direct Endpoint</div>
            <div class="font-mono text-sm text-primary break-all select-all cursor-pointer hover:text-white transition">
              https://api.on.websim.com/v1/${inst.id}
            </div>
          </div>
           <div class="card mb-4 bg-[var(--bg-dark)]">
            <div class="text-xs text-muted mb-1">Websim Alias</div>
            <div class="font-mono text-sm text-accent break-all select-all">
              websim.com/@api/${inst.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindInstanceEvents(container, inst) {
  // Mount Editor
  const mount = container.querySelector('#editor-mount');
  let currentCode = inst.code;
  if (mount) {
    const { element, getValue } = createEditor(inst.code, (val) => {
      currentCode = val;
    });
    mount.appendChild(element);
  }

  // Deploy Action
  container.querySelector('#btn-deploy').addEventListener('click', async () => {
    const btn = container.querySelector('#btn-deploy');
    btn.textContent = 'Deploying...';
    await store.updateInstanceCode(inst.id, currentCode);
    btn.textContent = 'Deployed!';
    setTimeout(() => btn.textContent = 'Deploy Changes', 1000);
    logToConsole('System: New version deployed successfully.', 'text-primary');
  });

  // Delete Action
  container.querySelector('#btn-delete').addEventListener('click', () => {
    if(confirm('Are you sure you want to delete this instance?')) {
      store.deleteInstance(inst.id);
    }
  });

  // Tester Logic
  const outputDiv = container.querySelector('#console-output');
  const logToConsole = (msg, cls = '') => {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = `> ${msg}`;
    outputDiv.appendChild(d);
    outputDiv.scrollTop = outputDiv.scrollHeight;
  };

  container.querySelector('#btn-send-req').addEventListener('click', async () => {
    const method = container.querySelector('#test-method').value;
    const path = container.querySelector('#test-path').value;
    let body = {};
    try {
      const bodyStr = container.querySelector('#test-body').value;
      if (bodyStr.trim()) body = JSON.parse(bodyStr);
    } catch (e) {
      logToConsole('Error parsing JSON body', 'text-red-400');
      return;
    }

    logToConsole(`Request: ${method} ${path}`, 'text-muted');
    
    // Execute via Runtime
    const runtime = new Runtime();
    const result = await runtime.execute(currentCode, method, path, body);
    
    // Display Logs
    result.logs.forEach(l => logToConsole(`[Console] ${l}`, 'text-blue-300'));
    
    // Display Result
    const statusColor = result.status >= 400 ? 'text-red-400' : 'text-green-400';
    logToConsole(`Response ${result.status}:`, statusColor);
    logToConsole(JSON.stringify(result.data, null, 2));
  });

  container.querySelector('#btn-clear-logs').addEventListener('click', () => {
    outputDiv.innerHTML = '<div class="text-muted">// Logs cleared</div>';
  });
}

import { store } from '../lib/store.js';
import { createEditor } from './editor.js';
import { Runtime } from '../lib/runtime.js';

export function renderDashboard(container) {
  const render = () => {
    const { user, instances, selectedInstanceId } = store.state;
    // Fallback if instances are undefined in early state
    const safeInstances = instances || {};
    const myInstances = Object.values(safeInstances).filter(i => i && i.owner === user.username);
    const selectedInstance = safeInstances[selectedInstanceId];

    container.innerHTML = `
      <div class="flex h-full">
        <!-- Sidebar -->
        <div class="sidebar border-r">
          <div class="p-4 border-b flex items-center gap-2">
            <div style="width:24px;height:24px;background:var(--primary);border-radius:4px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;">A</div>
            <span class="font-mono font-bold">API Platform</span>
          </div>
          
          <div class="grow overflow-y-auto">
            <div class="p-4 text-xs text-muted uppercase font-bold">Your Instances</div>
            ${myInstances.length === 0 ? '<div class="px-4 text-sm text-muted">No instances yet.</div>' : ''}
            
            ${myInstances.map(inst => `
              <div class="nav-item ${inst.id === selectedInstanceId ? 'active' : ''}" data-id="${inst.id}">
                <div class="w-2 h-2 rounded-full ${inst.status === 'running' ? 'bg-green-400' : 'bg-red-400'}"></div>
                <div class="flex-grow truncate">
                  <div class="font-mono text-sm">${inst.name}</div>
                  <div class="text-xs text-muted">${inst.id}</div>
                </div>
              </div>
            `).join('')}

            <div class="p-4 mt-4 border-t border-[var(--border)]">
              <button id="btn-new-instance" class="btn w-full justify-center text-primary border-dashed hover:border-solid">
                + New Instance
              </button>
            </div>
          </div>

          <div class="p-4 border-t bg-[var(--bg-dark)]">
            <div class="flex items-center gap-2">
              <img src="${user.avatarUrl}" class="w-8 h-8 rounded-full border border-[var(--border)]">
              <div class="overflow-hidden">
                <div class="text-sm font-bold truncate">${user.username}</div>
                <div class="text-xs text-muted">Free Plan</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="grow flex flex-col h-full overflow-hidden bg-[var(--bg-dark)]">
          ${selectedInstance ? renderInstanceView(selectedInstance) : renderWelcomeState()}
        </div>
      </div>
    `;

    // Bind Sidebar Events
    container.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => store.selectInstance(el.dataset.id));
    });

    const btnNew = container.querySelector('#btn-new-instance');
    if (btnNew) btnNew.addEventListener('click', () => {
      const name = prompt('Instance Name:', 'my-api');
      if (name) {
        const defaultCode = `const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Websim API!',
    timestamp: Date.now()
  });
});

app.post('/data', (req, res) => {
  const data = req.body;
  console.log('Received:', data);
  res.json({ success: true, received: data });
});
`;
        store.deployInstance(name, defaultCode).then(id => store.selectInstance(id));
      }
    });

    // Bind Instance View Events if active
    if (selectedInstance) bindInstanceEvents(container, selectedInstance);
  };

  const unsubscribe = store.subscribe(render);
  render();
}

function renderWelcomeState() {
  return `
    <div class="flex flex-col items-center justify-center h-full text-center p-8">
      <div class="w-16 h-16 bg-[var(--bg-panel)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)]">
        <span class="text-2xl">🚀</span>
      </div>
      <h2 class="text-xl font-bold mb-2">Ready to ship?</h2>
      <p class="text-muted max-w-md mb-8">Create a new Node.js instance to get started. You'll get a dedicated endpoint and real-time logs.</p>
      
      <div class="grid-cols-2 w-full max-w-2xl">
        <div class="card text-left">
          <div class="text-primary mb-2 font-mono">Documentation</div>
          <p class="text-sm text-muted">Learn how to route requests and handle data.</p>
        </div>
        <div class="card text-left">
          <div class="text-accent mb-2 font-mono">Examples</div>
          <p class="text-sm text-muted">View boilerplate code for CRUD, Auth, and more.</p>
        </div>
      </div>
    </div>
  `;
}

function renderInstanceView(inst) {
  return `
    <div class="border-b bg-[var(--bg-panel)] p-4 flex justify-between items-center">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold">${inst.name}</h2>
          <span class="badge badge-ok">Running</span>
        </div>
        <div class="font-mono text-xs text-muted mt-1 flex gap-4">
          <span>ID: ${inst.id}</span>
          <span>UPTIME: 99.9%</span>
          <span>MEM: 45MB</span>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-deploy">Deploy Changes</button>
        <button class="btn btn-danger" id="btn-delete">Delete</button>
      </div>
    </div>

    <div class="flex grow overflow-hidden flex-col-mobile">
      <!-- Editor Column -->
      <div class="w-1/2 flex flex-col border-r border-[var(--border)]">
        <div class="p-2 border-b border-[var(--border)] text-xs font-mono text-muted bg-[var(--bg-panel)]">index.js</div>
        <div id="editor-mount" class="grow relative"></div>
      </div>

      <!-- Tools Column -->
      <div class="w-1/2 flex flex-col bg-[#0d0d10]">
        
        <!-- API Tester -->
        <div class="h-1/2 border-b border-[var(--border)] flex flex-col">
          <div class="p-2 border-b border-[var(--border)] text-xs font-mono text-muted bg-[var(--bg-panel)] flex justify-between">
            <span>TERMINAL / TESTER</span>
            <span class="text-accent cursor-pointer" id="btn-clear-logs">Clear</span>
          </div>
          
          <div class="p-4 border-b border-[var(--border)] bg-[var(--bg-dark)]">
            <div class="flex gap-2 mb-2">
              <select class="input w-24" id="test-method">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input class="input" value="/" id="test-path" placeholder="/path">
              <button class="btn" id="btn-send-req">Send</button>
            </div>
            <textarea class="input text-xs h-16 font-mono" id="test-body" placeholder='{"key": "value"}'></textarea>
          </div>

          <div class="grow overflow-auto p-4 font-mono text-xs" id="console-output">
            <div class="text-muted">// Logs will appear here...</div>
            ${inst.logs ? inst.logs.map(l => `<div>${l}</div>`).join('') : ''}
          </div>
        </div>

        <!-- Documentation/Info -->
        <div class="h-1/2 overflow-auto p-4">
          <h3 class="font-bold text-sm mb-2 text-muted uppercase">Deployment Info</h3>
          <div class="card mb-4 bg-[var(--bg-dark)]">
            <div class="text-xs text-muted mb-1">Direct Endpoint</div>
            <div class="font-mono text-sm text-primary break-all select-all cursor-pointer hover:text-white transition">
              https://api.on.websim.com/?instance=${inst.id}
            </div>
          </div>
           <div class="card mb-4 bg-[var(--bg-dark)]">
            <div class="text-xs text-muted mb-1">Websim Alias</div>
            <div class="font-mono text-sm text-accent break-all select-all">
              websim.com/@api?instance=${inst.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindInstanceEvents(container, inst) {
  // Mount Editor
  const mount = container.querySelector('#editor-mount');
  let currentCode = inst.code;
  if (mount) {
    const { element, getValue } = createEditor(inst.code, (val) => {
      currentCode = val;
    });
    mount.appendChild(element);
  }

  // Deploy Action
  const btnDeploy = container.querySelector('#btn-deploy');
  if (btnDeploy) btnDeploy.addEventListener('click', async () => {
    btnDeploy.textContent = 'Deploying...';
    await store.updateInstanceCode(inst.id, currentCode);
    btnDeploy.textContent = 'Deployed!';
    setTimeout(() => btnDeploy.textContent = 'Deploy Changes', 1000);
    logToConsole('System: New version deployed successfully.', 'text-primary');
  });

  // Delete Action
  const btnDelete = container.querySelector('#btn-delete');
  if (btnDelete) btnDelete.addEventListener('click', () => {
    if(confirm('Are you sure you want to delete this instance?')) {
      store.deleteInstance(inst.id);
    }
  });

  // Tester Logic
  const outputDiv = container.querySelector('#console-output');
  
  const logToConsole = (msg, cls = '') => {
    if (!outputDiv) return;
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = `> ${msg}`;
    outputDiv.appendChild(d);
    outputDiv.scrollTop = outputDiv.scrollHeight;
  };

  const btnSend = container.querySelector('#btn-send-req');
  if (btnSend) btnSend.addEventListener('click', async () => {
    const method = container.querySelector('#test-method').value;
    const path = container.querySelector('#test-path').value;
    let body = {};
    try {
      const bodyStr = container.querySelector('#test-body').value;
      if (bodyStr.trim()) body = JSON.parse(bodyStr);
    } catch (e) {
      logToConsole('Error parsing JSON body', 'text-red-400');
      return;
    }

    logToConsole(`Request: ${method} ${path}`, 'text-muted');
    
    // Execute via Runtime
    const runtime = new Runtime();
    const result = await runtime.execute(currentCode, method, path, body);
    
    // Display Logs
    result.logs.forEach(l => logToConsole(`[Console] ${l}`, 'text-blue-300'));
    
    // Display Result
    const statusColor = result.status >= 400 ? 'text-red-400' : 'text-green-400';
    logToConsole(`Response ${result.status}:`, statusColor);
    logToConsole(JSON.stringify(result.data, null, 2));
  });

  const btnClear = container.querySelector('#btn-clear-logs');
  if (btnClear) btnClear.addEventListener('click', () => {
    outputDiv.innerHTML = '<div class="text-muted">// Logs cleared</div>';
  });
}