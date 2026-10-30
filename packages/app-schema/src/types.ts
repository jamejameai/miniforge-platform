export type DeviceViewport = 'mobile' | 'tablet' | 'desktop';

export interface ThemeConfig {
  primaryColor: string; // Default: #D4146E
  primaryDark: string; // Default: #171717
  backgroundColor: string; // Default: #FFFFFF
  surfaceColor: string; // Default: #F7F7F8
  borderColor: string; // Default: #E8E8EA
  mutedTextColor: string; // Default: #777777
  mainTextColor: string; // Default: #171717
  fontFamily: string;
  borderRadius: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  pageId: string;
  icon?: string;
  badge?: string;
  isVisible?: boolean;
}

export interface NavigationConfig {
  type: 'bottom_nav' | 'header' | 'sidebar' | 'none';
  items: NavigationItem[];
}

export type ActionType =
  | 'NAVIGATE'
  | 'OPEN_URL'
  | 'SUBMIT_FORM'
  | 'TRIGGER_WORKFLOW'
  | 'ADD_TO_CART'
  | 'CHECKOUT_CART'
  | 'CALL_API'
  | 'TELEGRAM_HAPTIC'
  | 'SHOW_TOAST'
  | 'CLOSE_MODAL';

export interface ActionDefinition {
  type: ActionType;
  target?: string;
  payload?: Record<string, any>;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export type ComponentCategory =
  | 'typography'
  | 'layout'
  | 'inputs'
  | 'data'
  | 'commerce'
  | 'feedback';

export interface ComponentPropertySchema {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'action' | 'data_binding' | 'image_url';
  defaultValue: any;
  options?: { label: string; value: any }[];
  category?: 'content' | 'style' | 'layout' | 'behavior';
  description?: string;
}

export interface ComponentNode {
  id: string;
  type: string;
  name?: string;
  props: Record<string, any>;
  style?: Record<string, any>;
  children?: ComponentNode[];
  events?: {
    onClick?: ActionDefinition[];
    onSubmit?: ActionDefinition[];
    onChange?: ActionDefinition[];
  };
  visibilityRule?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty';
    value: any;
  };
}

export interface PageSpec {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  requiredRole?: string;
  components: ComponentNode[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty';
  value: any;
}

export interface WorkflowAction {
  type: 'TELEGRAM_NOTIFICATION' | 'CREATE_RECORD' | 'UPDATE_RECORD' | 'UPDATE_INVENTORY' | 'SEND_WEBHOOK';
  params: Record<string, any>;
}

export interface WorkflowSpec {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: {
    type: 'RECORD_CREATED' | 'RECORD_UPDATED' | 'ORDER_CREATED' | 'LOW_STOCK' | 'TELEGRAM_MESSAGE';
    config?: Record<string, any>;
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface TelegramBotConfig {
  botUsername?: string;
  isConfigured: boolean;
  menuButtonConfigured: boolean;
  miniAppUrl?: string;
  webhookConfigured: boolean;
  lastHealthCheck?: string;
}

export interface AppSpec {
  version: string; // e.g. "1.0.0"
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  theme: ThemeConfig;
  navigation: NavigationConfig;
  pages: PageSpec[];
  workflows: WorkflowSpec[];
  botConfig?: TelegramBotConfig;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#D4146E',
  primaryDark: '#171717',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F7F7F8',
  borderColor: '#E8E8EA',
  mutedTextColor: '#777777',
  mainTextColor: '#171717',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '8px',
};

