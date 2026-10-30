export * from './types';

import { AppSpec, DEFAULT_THEME } from './types';

export function createDefaultAppSpec(name: string, slug: string, tenantId: string = 'tenant-demo'): AppSpec {
  const homePageId = 'page-home';
  return {
    version: '1.0.0',
    id: `app-${Date.now()}`,
    tenantId,
    name,
    slug,
    description: 'Created with MiniForge Visual Builder',
    icon: 'Sparkles',
    theme: { ...DEFAULT_THEME },
    navigation: {
      type: 'bottom_nav',
      items: [
        { id: 'nav-1', label: 'Home', pageId: homePageId, icon: 'Home', isVisible: true },
        { id: 'nav-2', label: 'Menu', pageId: 'page-menu', icon: 'Grid', isVisible: true },
        { id: 'nav-3', label: 'Cart', pageId: 'page-cart', icon: 'ShoppingCart', isVisible: true }
      ]
    },
    pages: [
      {
        id: homePageId,
        title: 'Home',
        slug: '/',
        isHome: true,
        components: [
          {
            id: 'hero-header',
            type: 'HeroBanner',
            props: {
              title: `Welcome to ${name}`,
              subtitle: 'Order directly inside Telegram or browse our interactive catalog.',
              badge: 'Fast Delivery',
              buttonText: 'Explore Catalog',
              buttonAction: { type: 'NAVIGATE', target: 'page-menu' }
            }
          },
          {
            id: 'featured-section-title',
            type: 'SectionHeading',
            props: {
              title: 'Featured Specials',
              subtitle: 'Hand-picked items available today'
            }
          },
          {
            id: 'featured-products',
            type: 'ProductGrid',
            props: {
              dataSource: 'pos_products',
              limit: 4,
              columns: 2,
              showAddToCart: true
            }
          }
        ]
      },
      {
        id: 'page-menu',
        title: 'Menu',
        slug: '/menu',
        isHome: false,
        components: [
          {
            id: 'menu-heading',
            type: 'SectionHeading',
            props: {
              title: 'Full Menu',
              subtitle: 'Filter by category and add items to your cart'
            }
          },
          {
            id: 'menu-products',
            type: 'ProductGrid',
            props: {
              dataSource: 'pos_products',
              columns: 2,
              showAddToCart: true
            }
          }
        ]
      },
      {
        id: 'page-cart',
        title: 'My Cart',
        slug: '/cart',
        isHome: false,
        components: [
          {
            id: 'cart-view',
            type: 'CartView',
            props: {
              emptyText: 'Your cart is currently empty.',
              checkoutButtonText: 'Confirm & Place Order'
            }
          }
        ]
      }
    ],
    workflows: [
      {
        id: 'wf-order-notify',
        name: 'Order Confirmation Notification',
        description: 'Send Telegram notification to customer when order is confirmed',
        isActive: true,
        trigger: {
          type: 'ORDER_CREATED'
        },
        conditions: [
          { field: 'total', operator: 'greater_than', value: 0 }
        ],
        actions: [
          {
            type: 'TELEGRAM_NOTIFICATION',
            params: {
              message: '🎉 Your order #{{order_number}} has been received! Total: ${{total}}'
            }
          }
        ]
      }
    ],
    botConfig: {
      isConfigured: false,
      menuButtonConfigured: false,
      webhookConfigured: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

