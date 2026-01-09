export class Store {
  constructor() {
    this.room = new WebsimSocket();
    this.state = {
      user: null,
      instances: {},
      selectedInstanceId: null,
      view: 'landing', // landing, dashboard
      connected: false
    };
    this.listeners = new Set();
  }

  async init() {
    await this.room.initialize();
    this.state.connected = true;
    
    // Get user info
    const me = this.room.peers[this.room.clientId];
    this.state.user = {
      id: this.room.clientId,
      username: me.username,
      avatarUrl: me.avatarUrl,
      isHost: me.username === 'api' || me.username === 'websim'
    };

    // Subscribe to room state (API Instances Database)
    this.room.subscribeRoomState((state) => {
      if (state.instances) {
        this.state.instances = state.instances;
        this.notify();
      }
    });

    // Handle incoming API requests (The Bridge)
    this.room.onmessage = (event) => {
      const { type, payload, fromClientId } = event.data;
      if (type === 'API_RESPONSE' && payload.requestId) {
        // Dispatch custom event for async await handlers
        window.dispatchEvent(new CustomEvent(`api_response_${payload.requestId}`, { detail: payload }));
      }
    };

    this.notify();
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Actions
  
  setView(view) {
    this.state.view = view;
    this.notify();
  }

  selectInstance(id) {
    this.state.selectedInstanceId = id;
    this.notify();
  }

  async deployInstance(name, code) {
    const id = 'inst_' + Math.random().toString(36).substr(2, 9);
    const newInstance = {
      id,
      name,
      code,
      owner: this.state.user.username,
      ownerId: this.state.user.id,
      status: 'running',
      created: Date.now(),
      requests: 0,
      logs: [],
      env: {}
    };

    const currentInstances = this.room.roomState.instances || {};
    await this.room.updateRoomState({
      instances: {
        ...currentInstances,
        [id]: newInstance
      }
    });
    
    return id;
  }

  async updateInstanceCode(id, code) {
    const currentInstances = this.room.roomState.instances || {};
    if (!currentInstances[id]) return;
    
    await this.room.updateRoomState({
      instances: {
        ...currentInstances,
        [id]: {
          ...currentInstances[id],
          code,
          status: 'running', // Restart on deploy
          updated: Date.now()
        }
      }
    });
  }

  async deleteInstance(id) {
    const currentInstances = this.room.roomState.instances || {};
    // Object delete pattern for room state
    const newInstances = { ...currentInstances };
    newInstances[id] = null; // Mark for deletion
    
    await this.room.updateRoomState({
      instances: newInstances
    });
    
    if (this.state.selectedInstanceId === id) {
      this.state.selectedInstanceId = null;
    }
  }

  // Simulation of "Calling" the API
  // In a real implementation, this would send a message to the "Host" client.
  // Here, we execute it locally in the "Runtime" to simulate the experience.
  async callApi(instanceId, method, path, body = {}) {
    const instance = this.state.instances[instanceId];
    if (!instance) return { status: 404, error: 'Instance not found' };

    // Simulate network delay
    await new Promise(r => setTimeout(r, Math.random() * 200 + 50));

    // Update stats (optimistic)
    // In production, we'd batch these updates or let the host handle it
    /* 
    const currentStats = instance.requests || 0;
    this.room.updateRoomState({
      instances: {
        [instanceId]: { requests: currentStats + 1 }
      }
    });
    */

    return { instance, method, path, body };
  }
}

export const store = new Store();

export class Store {
  constructor() {
    this.room = new WebsimSocket();
    this.state = {
      user: null,
      instances: {},
      selectedInstanceId: null,
      view: 'landing', // landing, dashboard
      connected: false
    };
    this.listeners = new Set();
  }

  async init() {
    await this.room.initialize();
    this.state.connected = true;
    
    // Get user info
    const me = this.room.peers[this.room.clientId];
    this.state.user = {
      id: this.room.clientId,
      username: me.username,
      avatarUrl: me.avatarUrl,
      isHost: me.username === 'api' || me.username === 'websim'
    };

    // Subscribe to room state (API Instances Database)
    this.room.subscribeRoomState((state) => {
      if (state.instances) {
        this.state.instances = state.instances;
        this.notify();
      }
    });

    // Handle incoming API requests (The Bridge)
    this.room.onmessage = (event) => {
      const { type, payload, fromClientId } = event.data;
      if (type === 'API_RESPONSE' && payload.requestId) {
        // Dispatch custom event for async await handlers
        window.dispatchEvent(new CustomEvent(`api_response_${payload.requestId}`, { detail: payload }));
      }
    };

    this.notify();
  }

  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  // Actions
  
  setView(view) {
    this.state.view = view;
    this.notify();
  }

  selectInstance(id) {
    this.state.selectedInstanceId = id;
    this.notify();
  }

  async deployInstance(name, code) {
    const id = 'inst_' + Math.random().toString(36).substr(2, 9);
    const newInstance = {
      id,
      name,
      code,
      owner: this.state.user.username,
      ownerId: this.state.user.id,
      status: 'running',
      created: Date.now(),
      requests: 0,
      logs: [],
      env: {}
    };

    const currentInstances = this.room.roomState.instances || {};
    await this.room.updateRoomState({
      instances: {
        ...currentInstances,
        [id]: newInstance
      }
    });
    
    return id;
  }

  async updateInstanceCode(id, code) {
    const currentInstances = this.room.roomState.instances || {};
    if (!currentInstances[id]) return;
    
    await this.room.updateRoomState({
      instances: {
        ...currentInstances,
        [id]: {
          ...currentInstances[id],
          code,
          status: 'running', // Restart on deploy
          updated: Date.now()
        }
      }
    });
  }

  async deleteInstance(id) {
    const currentInstances = this.room.roomState.instances || {};
    // Object delete pattern for room state
    const newInstances = { ...currentInstances };
    newInstances[id] = null; // Mark for deletion
    
    await this.room.updateRoomState({
      instances: newInstances
    });
    
    if (this.state.selectedInstanceId === id) {
      this.state.selectedInstanceId = null;
    }
  }

  // Simulation of "Calling" the API
  async callApi(instanceId, method, path, body = {}) {
    const instance = this.state.instances[instanceId];
    if (!instance) return { status: 404, error: 'Instance not found' };

    // Simulate network delay
    await new Promise(r => setTimeout(r, Math.random() * 200 + 50));

    return { instance, method, path, body };
  }
}

export const store = new Store();