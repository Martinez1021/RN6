// Odoo JSON-RPC API Client
// Handles all communication with Odoo server via JSON-RPC protocol

const DEFAULT_TIMEOUT = 30000;

class OdooApi {
  constructor() {
    this.url = null;
    this.db = null;
    this.uid = null;
    this.password = null;
  }

  /**
   * Configure the API client with server details
   */
  configure(url, db, uid = null, password = null) {
    this.url = url.replace(/\/$/, ''); // Remove trailing slash
    this.db = db;
    this.uid = uid;
    this.password = password;
  }

  /**
   * Make a JSON-RPC call to Odoo
   */
  async jsonRpc(service, method, args) {
    if (!this.url) {
      throw new Error('API not configured. Call configure() first.');
    }

    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service,
        method,
        args,
      },
      id: Math.floor(Math.random() * 1000000),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(`${this.url}/jsonrpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        const errorMessage = result.error.data?.message || 
                            result.error.message || 
                            'Unknown Odoo error';
        throw new Error(errorMessage);
      }

      return result.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection.');
      }
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection and server URL.');
      }
      throw error;
    }
  }

  /**
   * Authenticate user with Odoo
   * @returns {Promise<number>} User ID (uid)
   */
  async authenticate(db, login, password) {
    const uid = await this.jsonRpc('common', 'authenticate', [db, login, password, {}]);
    
    if (!uid) {
      throw new Error('Invalid credentials. Please check your email and password.');
    }

    this.db = db;
    this.uid = uid;
    this.password = password;

    return uid;
  }

  /**
   * Execute a method on an Odoo model
   */
  async execute(model, method, args = [], kwargs = {}) {
    if (!this.uid || !this.password) {
      throw new Error('Not authenticated. Please log in first.');
    }

    return await this.jsonRpc('object', 'execute_kw', [
      this.db,
      this.uid,
      this.password,
      model,
      method,
      args,
      kwargs,
    ]);
  }

  /**
   * Search and read records from a model
   */
  async searchRead(model, domain = [], fields = [], options = {}) {
    return await this.execute(model, 'search_read', [domain], {
      fields,
      ...options,
    });
  }

  /**
   * Create a new record
   */
  async create(model, values) {
    return await this.execute(model, 'create', [values]);
  }

  /**
   * Update existing records
   */
  async write(model, ids, values) {
    return await this.execute(model, 'write', [ids, values]);
  }

  /**
   * Read specific records
   */
  async read(model, ids, fields = []) {
    return await this.execute(model, 'read', [ids], { fields });
  }

  /**
   * Check if client is configured and authenticated
   */
  isAuthenticated() {
    return !!(this.url && this.uid && this.password);
  }

  /**
   * Clear authentication data
   */
  logout() {
    this.uid = null;
    this.password = null;
  }
}

// Singleton instance
const odooApi = new OdooApi();

export default odooApi;
