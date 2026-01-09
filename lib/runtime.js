export class Runtime {
  constructor() {
    this.logs = [];
  }

  // Simple tokenizer for basic syntax highlighting in the editor
  static highlight(code) {
    if (!code) return '';
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\b(const|let|var|function|return|if|else|async|await|try|catch|import|from)\b/g, '<span class="token-keyword">$1</span>')
      .replace(/\b(console|Math|JSON|Promise|res|req|app)\b/g, '<span class="token-function">$1</span>')
      .replace(/(['"`].*?['"`])/g, '<span class="token-string">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="token-comment">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
  }

  // The "Server" logic
  async execute(code, method, path, body) {
    const logs = [];
    const log = (...args) => logs.push(args.join(' '));
    
    // Mock Express App
    const routes = [];
    const app = {
      get: (p, cb) => routes.push({ method: 'GET', path: p, cb }),
      post: (p, cb) => routes.push({ method: 'POST', path: p, cb }),
      put: (p, cb) => routes.push({ method: 'PUT', path: p, cb }),
      delete: (p, cb) => routes.push({ method: 'DELETE', path: p, cb }),
      all: (p, cb) => routes.push({ method: 'ALL', path: p, cb }),
    };

    // Execution Context
    const context = {
      console: { log, error: log, warn: log },
      express: () => app,
      require: (mod) => {
        if (mod === 'express') return () => app;
        return {};
      }
    };

    try {
      // Evaluate user code to register routes
      // Note: In a real secure env, this would be a sandboxed iframe or worker
      const userFn = new Function('app', 'console', 'require', code);
      userFn(app, context.console, context.require);

      // Find matching route
      const route = routes.find(r => 
        (r.method === method || r.method === 'ALL') && 
        (r.path === path || r.path === '*')
      );

      if (!route) {
        return { status: 404, data: { error: `Cannot ${method} ${path}` }, logs };
      }

      // Execute handler
      let responseData = null;
      let responseStatus = 200;

      const req = { method, path, body, query: {}, params: {} };
      const res = {
        status: (s) => { responseStatus = s; return res; },
        json: (d) => { responseData = d; },
        send: (d) => { responseData = d; }
      };

      await route.cb(req, res);

      return { status: responseStatus, data: responseData, logs };

    } catch (e) {
      return { status: 500, data: { error: e.message }, logs: [...logs, e.stack] };
    }
  }
}

export class Runtime {
  constructor() {
    this.logs = [];
  }

  // Simple tokenizer for basic syntax highlighting in the editor
  static highlight(code) {
    if (!code) return '';
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\b(const|let|var|function|return|if|else|async|await|try|catch|import|from|new)\b/g, '<span class="token-keyword">$1</span>')
      .replace(/\b(console|Math|JSON|Promise|res|req|app)\b/g, '<span class="token-function">$1</span>')
      .replace(/(['"`].*?['"`])/g, '<span class="token-string">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="token-comment">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
  }

  // The "Server" logic
  async execute(code, method, path, body) {
    const logs = [];
    const log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    
    // Mock Express App
    const routes = [];
    const app = {
      get: (p, cb) => routes.push({ method: 'GET', path: p, cb }),
      post: (p, cb) => routes.push({ method: 'POST', path: p, cb }),
      put: (p, cb) => routes.push({ method: 'PUT', path: p, cb }),
      delete: (p, cb) => routes.push({ method: 'DELETE', path: p, cb }),
      all: (p, cb) => routes.push({ method: 'ALL', path: p, cb }),
    };

    // Execution Context
    const context = {
      console: { log, error: log, warn: log },
      express: () => app,
      require: (mod) => {
        if (mod === 'express') return () => app;
        return {};
      }
    };

    try {
      // Evaluate user code to register routes
      const userFn = new Function('app', 'console', 'require', code);
      userFn(app, context.console, context.require);

      // Find matching route
      const route = routes.find(r => 
        (r.method === method || r.method === 'ALL') && 
        (r.path === path || r.path === '*')
      );

      if (!route) {
        return { status: 404, data: { error: `Cannot ${method} ${path}` }, logs };
      }

      // Execute handler
      let responseData = null;
      let responseStatus = 200;

      const req = { method, path, body, query: {}, params: {} };
      const res = {
        status: (s) => { responseStatus = s; return res; },
        json: (d) => { responseData = d; },
        send: (d) => { responseData = d; }
      };

      await route.cb(req, res);

      return { status: responseStatus, data: responseData, logs };

    } catch (e) {
      return { status: 500, data: { error: e.message }, logs: [...logs, e.stack] };
    }
  }
}