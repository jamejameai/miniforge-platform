const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('miniforge_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('miniforge_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('miniforge_token');
    }
  }

  async ensureToken(): Promise<string | null> {
    let token = this.getToken();
    if (!token && typeof window !== 'undefined') {
      try {
        const resp = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@miniforge.app', password: 'admin123' }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.access_token) {
            this.setToken(data.access_token);
            token = data.access_token;
          }
        }
      } catch (err) {
        console.warn('Auto token acquisition fallback failed:', err);
      }
    }
    return token;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = this.getToken();
    if (!token && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/apps/public/')) {
      token = await this.ensureToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred.' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Applications
  async listApps() {
    return this.request('/api/apps');
  }

  async getApp(appId: string) {
    return this.request(`/api/apps/${appId}`);
  }

  async createApp(name: string, description: string = '', icon: string = 'Sparkles') {
    return this.request('/api/apps', {
      method: 'POST',
      body: JSON.stringify({ name, description, icon }),
    });
  }

  async updateApp(appId: string, payload: { name?: string; draft_spec?: any; icon?: string }) {
    return this.request(`/api/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async duplicateApp(appId: string) {
    return this.request(`/api/apps/${appId}/duplicate`, {
      method: 'POST',
    });
  }

  async deleteApp(appId: string) {
    return this.request(`/api/apps/${appId}`, {
      method: 'DELETE',
    });
  }

  async publishApp(appId: string, changelog: string = 'Published snapshot') {
    return this.request(`/api/apps/${appId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ changelog }),
    });
  }

  async listVersions(appId: string) {
    return this.request(`/api/apps/${appId}/versions`);
  }

  async rollbackVersion(appId: string, versionNumber: number) {
    return this.request(`/api/apps/${appId}/rollback/${versionNumber}`, {
      method: 'POST',
    });
  }

  async getPublishedApp(slug: string) {
    return this.request(`/api/apps/public/${slug}`);
  }

  // Database Studio
  async listTables(appId: string) {
    return this.request(`/api/apps/${appId}/tables`);
  }

  async createTable(appId: string, table: { name: string; display_name: string; description?: string; fields?: any[] }) {
    return this.request(`/api/apps/${appId}/tables`, {
      method: 'POST',
      body: JSON.stringify(table),
    });
  }

  async addField(tableId: string, field: { name: string; label: string; field_type: string; is_required?: boolean }) {
    return this.request(`/api/tables/${tableId}/fields`, {
      method: 'POST',
      body: JSON.stringify(field),
    });
  }

  async listRecords(tableId: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/tables/${tableId}/records${q}`);
  }

  async createRecord(tableId: string, data: Record<string, any>) {
    return this.request(`/api/tables/${tableId}/records`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async bulkImportRecords(tableId: string, records: Record<string, any>[]) {
    return this.request(`/api/tables/${tableId}/records/bulk`, {
      method: 'POST',
      body: JSON.stringify(records),
    });
  }

  async updateRecord(recordId: string, data: Record<string, any>) {
    return this.request(`/api/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteRecord(recordId: string) {
    return this.request(`/api/records/${recordId}`, {
      method: 'DELETE',
    });
  }

  // Telegram Bot Studio
  async getBotStatus(appId: string) {
    return this.request(`/api/apps/${appId}/bot/status`);
  }

  async connectBot(appId: string, botToken: string) {
    return this.request(`/api/apps/${appId}/bot/connect`, {
      method: 'POST',
      body: JSON.stringify({ bot_token: botToken }),
    });
  }

  async configureMenuButton(appId: string, webAppUrl: string) {
    return this.request(`/api/apps/${appId}/bot/menu-button?web_app_url=${encodeURIComponent(webAppUrl)}`, {
      method: 'POST',
    });
  }

  async disconnectBot(appId: string) {
    return this.request(`/api/apps/${appId}/bot/disconnect`, {
      method: 'POST',
    });
  }

  async verifyTelegramData(appId: string, initData: string) {
    return this.request(`/api/apps/${appId}/bot/verify-telegram`, {
      method: 'POST',
      body: JSON.stringify({ init_data: initData }),
    });
  }

  // POS & Inventory
  async listProducts(appId: string) {
    return this.request(`/api/apps/${appId}/pos/products`);
  }

  async createProduct(appId: string, product: any) {
    return this.request(`/api/apps/${appId}/pos/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async placeOrder(appId: string, order: { idempotency_key: string; items: { product_id: string; quantity: number }[]; customer_name?: string; payment_method?: string }) {
    return this.request(`/api/apps/${appId}/pos/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async listOrders(appId: string) {
    return this.request(`/api/apps/${appId}/pos/orders`);
  }

  async listInventoryMovements(appId: string) {
    return this.request(`/api/apps/${appId}/pos/inventory/movements`);
  }

  async adjustInventory(appId: string, adjustment: { product_id: string; movement_type: string; quantity_delta: number; notes?: string }) {
    return this.request(`/api/apps/${appId}/pos/inventory/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustment),
    });
  }

  // Workflows
  async listWorkflows(appId: string) {
    return this.request(`/api/apps/${appId}/workflows`);
  }

  async createWorkflow(appId: string, workflow: any) {
    return this.request(`/api/apps/${appId}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(workflowId: string, data: any) {
    return this.request(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(workflowId: string) {
    return this.request(`/api/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  async runTestWorkflow(workflowId: string, payload: Record<string, any>) {
    return this.request(`/api/workflows/${workflowId}/run-test`, {
      method: 'POST',
      body: JSON.stringify({ trigger_payload: payload }),
    });
  }

  async listWorkflowExecutions(workflowId: string) {
    return this.request(`/api/workflows/${workflowId}/executions`);
  }

  // AI Generator & Product Planning Blueprint
  async generateAppSpec(prompt: string) {
    return this.request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async generateBlueprint(prompt: string) {
    return this.request('/api/ai/blueprint', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async instantiateBlueprint(blueprint: any, includeSampleData: boolean = true) {
    return this.request('/api/ai/blueprint/instantiate', {
      method: 'POST',
      body: JSON.stringify({ blueprint, include_sample_data: includeSampleData }),
    });
  }

  // Templates
  async listTemplates() {
    return this.request('/api/templates');
  }

  async getTemplate(id: string) {
    return this.request(`/api/templates/${id}`);
  }

  async instantiateTemplate(templateId: string) {
    return this.request(`/api/templates/${templateId}/instantiate`, {
      method: 'POST',
    });
  }

  async applyAISpec(appId: string, spec: any) {
    return this.request(`/api/ai/apply/${appId}`, {
      method: 'POST',
      body: JSON.stringify(spec),
    });
  }
}

export const api = new ApiClient();

