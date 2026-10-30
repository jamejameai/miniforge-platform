import { ComponentCategory, ComponentPropertySchema } from '@miniforge/app-schema';

export interface ComponentMetadata {
  type: string;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  propertySchemas: ComponentPropertySchema[];
}

export const COMPONENT_REGISTRY: Record<string, ComponentMetadata> = {
  HeroBanner: {
    type: 'HeroBanner',
    label: 'Hero Banner',
    category: 'layout',
    icon: 'Sparkles',
    description: 'Impactful top promotional banner with title, badge and call-to-action.',
    defaultProps: {
      title: 'Welcome to our store',
      subtitle: 'Order fresh items and pick up locally.',
      badge: 'Special Promo',
      buttonText: 'Order Now',
      buttonAction: { type: 'NAVIGATE', target: '' }
    },
    propertySchemas: [
      { name: 'title', label: 'Title', type: 'string', defaultValue: 'Welcome to our store', category: 'content' },
      { name: 'subtitle', label: 'Subtitle', type: 'string', defaultValue: 'Order fresh items and pick up locally.', category: 'content' },
      { name: 'badge', label: 'Badge Label', type: 'string', defaultValue: 'Special Promo', category: 'content' },
      { name: 'buttonText', label: 'Button Text', type: 'string', defaultValue: 'Order Now', category: 'content' }
    ]
  },

  SectionHeading: {
    type: 'SectionHeading',
    label: 'Section Heading',
    category: 'typography',
    icon: 'Heading',
    description: 'Clean typographic section header with title and subtitle.',
    defaultProps: {
      title: 'Featured Category',
      subtitle: 'Explore our latest collection'
    },
    propertySchemas: [
      { name: 'title', label: 'Heading Text', type: 'string', defaultValue: 'Featured Category', category: 'content' },
      { name: 'subtitle', label: 'Subtitle', type: 'string', defaultValue: '', category: 'content' }
    ]
  },

  ProductGrid: {
    type: 'ProductGrid',
    label: 'Product Grid',
    category: 'commerce',
    icon: 'ShoppingBag',
    description: 'Dynamic product listing connected to POS catalog with direct cart actions.',
    defaultProps: {
      dataSource: 'pos_products',
      columns: 2,
      limit: 10,
      showAddToCart: true
    },
    propertySchemas: [
      { name: 'dataSource', label: 'Data Source', type: 'select', defaultValue: 'pos_products', options: [{ label: 'POS Products', value: 'pos_products' }], category: 'content' },
      { name: 'columns', label: 'Columns (Mobile / Desktop)', type: 'select', defaultValue: 2, options: [{ label: '1 Column', value: 1 }, { label: '2 Columns', value: 2 }, { label: '3 Columns', value: 3 }], category: 'layout' },
      { name: 'showAddToCart', label: 'Show Add to Cart', type: 'boolean', defaultValue: true, category: 'behavior' }
    ]
  },

  CartView: {
    type: 'CartView',
    label: 'Shopping Cart',
    category: 'commerce',
    icon: 'ShoppingCart',
    description: 'Interactive cart breakdown with quantity controls, subtotal, and checkout.',
    defaultProps: {
      emptyText: 'Your cart is currently empty.',
      checkoutButtonText: 'Place Order'
    },
    propertySchemas: [
      { name: 'emptyText', label: 'Empty State Text', type: 'string', defaultValue: 'Your cart is currently empty.', category: 'content' },
      { name: 'checkoutButtonText', label: 'Checkout Button Label', type: 'string', defaultValue: 'Place Order', category: 'content' }
    ]
  },

  Button: {
    type: 'Button',
    label: 'Action Button',
    category: 'inputs',
    icon: 'MousePointerClick',
    description: 'Customizable button with Telegram haptic feedback and navigation triggers.',
    defaultProps: {
      label: 'Click Here',
      variant: 'primary', // primary | secondary | outline
      size: 'default',
      action: { type: 'NAVIGATE', target: '' }
    },
    propertySchemas: [
      { name: 'label', label: 'Button Label', type: 'string', defaultValue: 'Click Here', category: 'content' },
      { name: 'variant', label: 'Style Variant', type: 'select', defaultValue: 'primary', options: [{ label: 'Primary Pink', value: 'primary' }, { label: 'Dark', value: 'secondary' }, { label: 'Outline', value: 'outline' }], category: 'style' }
    ]
  },

  Card: {
    type: 'Card',
    label: 'Content Card',
    category: 'layout',
    icon: 'Square',
    description: 'Clean border container with header, content area, and subtle shadow.',
    defaultProps: {
      title: 'Card Title',
      description: 'Supportive card description text.',
      padding: '16px'
    },
    propertySchemas: [
      { name: 'title', label: 'Card Title', type: 'string', defaultValue: 'Card Title', category: 'content' },
      { name: 'description', label: 'Description', type: 'string', defaultValue: 'Card description...', category: 'content' }
    ]
  },

  StatCard: {
    type: 'StatCard',
    label: 'Metric / Stat Card',
    category: 'data',
    icon: 'Activity',
    description: 'Minimal numeric indicator with delta percentage.',
    defaultProps: {
      title: 'Total Sales',
      value: '$2,450.00',
      change: '+14%',
      isPositive: true
    },
    propertySchemas: [
      { name: 'title', label: 'Metric Name', type: 'string', defaultValue: 'Total Sales', category: 'content' },
      { name: 'value', label: 'Value', type: 'string', defaultValue: '$2,450.00', category: 'content' },
      { name: 'change', label: 'Change Delta', type: 'string', defaultValue: '+14%', category: 'content' }
    ]
  },

  Table: {
    type: 'Table',
    label: 'Data Table',
    category: 'data',
    icon: 'Table',
    description: 'Render records from custom Database Studio tables.',
    defaultProps: {
      tableId: '',
      pageSize: 5
    },
    propertySchemas: [
      { name: 'tableId', label: 'Source Table', type: 'string', defaultValue: '', category: 'content' },
      { name: 'pageSize', label: 'Page Size', type: 'number', defaultValue: 5, category: 'layout' }
    ]
  },

  Input: {
    type: 'Input',
    label: 'Text Input',
    category: 'inputs',
    icon: 'TextCursor',
    description: 'Form input field with label and placeholder.',
    defaultProps: {
      label: 'Your Name',
      placeholder: 'Enter full name...',
      fieldName: 'name',
      required: false
    },
    propertySchemas: [
      { name: 'label', label: 'Field Label', type: 'string', defaultValue: 'Your Name', category: 'content' },
      { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: 'Enter full name...', category: 'content' },
      { name: 'required', label: 'Required', type: 'boolean', defaultValue: false, category: 'behavior' }
    ]
  },

  Divider: {
    type: 'Divider',
    label: 'Divider',
    category: 'layout',
    icon: 'Minus',
    description: 'Subtle separator line.',
    defaultProps: {
      margin: '16px'
    },
    propertySchemas: [
      { name: 'margin', label: 'Vertical Margin', type: 'string', defaultValue: '16px', category: 'style' }
    ]
  }
};

export function getComponentMetadata(type: string): ComponentMetadata | undefined {
  return COMPONENT_REGISTRY[type];
}

export function getAllComponents(): ComponentMetadata[] {
  return Object.values(COMPONENT_REGISTRY);
}
