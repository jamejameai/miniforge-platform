# MiniForge Application Schema Specification

Every application created in MiniForge is defined by a declarative, versioned JSON document called the **Application Specification** (`AppSpec`).

---

## 1. Top-Level Specification (`AppSpec`)

```json
{
  "version": "1.0.0",
  "appId": "uuid-v4",
  "name": "Artisan Coffee Mini App",
  "slug": "artisan-coffee",
  "theme": {
    "primaryColor": "#D4146E",
    "primaryDark": "#171717",
    "backgroundColor": "#FFFFFF",
    "surfaceColor": "#F7F7F8",
    "borderColor": "#E8E8EA",
    "fontFamily": "Inter",
    "borderRadius": "8px"
  },
  "navigation": {
    "type": "bottom_nav",
    "items": [
      { "id": "nav-1", "label": "Menu", "pageId": "page-home", "icon": "Coffee" },
      { "id": "nav-2", "label": "Cart", "pageId": "page-cart", "icon": "ShoppingCart" },
      { "id": "nav-3", "label": "Orders", "pageId": "page-orders", "icon": "Receipt" }
    ]
  },
  "pages": [
    {
      "id": "page-home",
      "slug": "/",
      "title": "Menu",
      "isHome": true,
      "components": [
        {
          "id": "comp-header",
          "type": "Header",
          "props": {
            "title": "Fresh Roast & Pastries",
            "subtitle": "Order ahead and pick up in store."
          }
        },
        {
          "id": "comp-products",
          "type": "ProductGrid",
          "props": {
            "dataSource": "pos_products",
            "columns": 2,
            "showAddToCart": true
          }
        }
      ]
    }
  ],
  "workflows": [
    {
      "id": "wf-order-alert",
      "name": "Notify Telegram On New Order",
      "trigger": { "type": "ORDER_CREATED" },
      "conditions": [
        { "field": "total", "operator": "GREATER_THAN", "value": 0 }
      ],
      "actions": [
        {
          "type": "TELEGRAM_NOTIFICATION",
          "params": {
            "message": "New order #{{order_number}} placed! Total: ${{total}}"
          }
        }
      ]
    }
  ]
}
```

---

## 2. Component Primitive Schema

Every component stored in `page.components` satisfies the interface:

```typescript
export interface ComponentInstance {
  id: string;
  type: string; // e.g. "Button", "Text", "Card", "ProductGrid", "Table", "FormInput"
  props: Record<string, any>;
  style?: Record<string, any>;
  children?: ComponentInstance[];
  events?: {
    onClick?: ActionDefinition[];
    onSubmit?: ActionDefinition[];
  };
  visibilityRule?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than';
    value: any;
  };
}
```

This strict JSON representation enables schema migrations, AI generation, and runtime portability.

