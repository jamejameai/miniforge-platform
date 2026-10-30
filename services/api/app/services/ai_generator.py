import re
from typing import Dict, Any, List
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse

class AIGeneratorService:
    @staticmethod
    def generate_app_from_prompt(req: AIGenerateRequest) -> AIGenerateResponse:
        prompt = req.prompt.strip()
        lower_prompt = prompt.lower()

        # Derive title and theme
        if "restaurant" in lower_prompt or "cafe" in lower_prompt or "coffee" in lower_prompt or "bakery" in lower_prompt or "food" in lower_prompt:
            category = "Food & Hospitality"
            app_name = "Artisan Eats Mini App"
            slug = "artisan-eats"
            hero_title = "Delicious Culinary Delights"
            hero_sub = "Hand-crafted recipes, fresh ingredients, order ahead with ease."
            primary_color = "#D4146E"
        elif "fitness" in lower_prompt or "gym" in lower_prompt or "workout" in lower_prompt:
            category = "Health & Fitness"
            app_name = "Peak Performance Club"
            slug = "peak-performance"
            hero_title = "Level Up Your Fitness"
            hero_sub = "Book personal training sessions and track your workout streak."
            primary_color = "#D4146E"
        elif "service" in lower_prompt or "consulting" in lower_prompt or "agency" in lower_prompt:
            category = "Professional Services"
            app_name = "Elite Consultation"
            slug = "elite-consultation"
            hero_title = "Expert Advisory On Demand"
            hero_sub = "Book appointments and receive advisory support directly in Telegram."
            primary_color = "#171717"
        else:
            category = "General Business"
            # Extract first 4 words or default
            words = prompt.split()[:4]
            app_name = " ".join(w.capitalize() for w in words) if words else "Custom MiniForge App"
            slug = re.sub(r"[^a-z0-9]+", "-", app_name.lower()).strip("-")
            hero_title = f"Welcome to {app_name}"
            hero_sub = "Built with MiniForge visual development engine."
            primary_color = "#D4146E"

        suggested_spec = {
            "version": "1.0.0",
            "name": app_name,
            "slug": slug,
            "description": f"AI-generated application for {category}: '{prompt}'",
            "theme": {
                "primaryColor": primary_color,
                "primaryDark": "#171717",
                "backgroundColor": "#FFFFFF",
                "surfaceColor": "#F7F7F8",
                "borderColor": "#E8E8EA",
                "mutedTextColor": "#777777",
                "mainTextColor": "#171717",
                "fontFamily": "Inter, sans-serif",
                "borderRadius": "8px"
            },
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    { "id": "nav-home", "label": "Home", "pageId": "page-home", "icon": "Home", "isVisible": True },
                    { "id": "nav-catalog", "label": "Catalog", "pageId": "page-catalog", "icon": "Grid", "isVisible": True },
                    { "id": "nav-cart", "label": "Cart", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True }
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Home",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {
                            "id": "comp-hero",
                            "type": "HeroBanner",
                            "props": {
                                "title": hero_title,
                                "subtitle": hero_sub,
                                "badge": "Featured Mini App",
                                "buttonText": "Browse Catalog",
                                "buttonAction": { "type": "NAVIGATE", "target": "page-catalog" }
                            }
                        },
                        {
                            "id": "comp-heading-specials",
                            "type": "SectionHeading",
                            "props": {
                                "title": "Today's Highlights",
                                "subtitle": "Top picks ready for instant checkout"
                            }
                        },
                        {
                            "id": "comp-product-grid",
                            "type": "ProductGrid",
                            "props": {
                                "dataSource": "pos_products",
                                "columns": 2,
                                "limit": 4,
                                "showAddToCart": True
                            }
                        }
                    ]
                },
                {
                    "id": "page-catalog",
                    "title": "Catalog",
                    "slug": "/catalog",
                    "isHome": False,
                    "components": [
                        {
                            "id": "comp-catalog-heading",
                            "type": "SectionHeading",
                            "props": {
                                "title": "All Items & Services",
                                "subtitle": "Select items to build your order"
                            }
                        },
                        {
                            "id": "comp-all-products",
                            "type": "ProductGrid",
                            "props": {
                                "dataSource": "pos_products",
                                "columns": 2,
                                "showAddToCart": True
                            }
                        }
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Cart & Checkout",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {
                            "id": "comp-cart-view",
                            "type": "CartView",
                            "props": {
                                "emptyText": "Your cart is empty. Tap 'Catalog' to add items.",
                                "checkoutButtonText": "Complete Purchase"
                            }
                        }
                    ]
                }
            ],
            "workflows": [
                {
                    "id": "wf-order-alert",
                    "name": "Notify Telegram On Order Placement",
                    "isActive": True,
                    "trigger": { "type": "ORDER_CREATED" },
                    "conditions": [
                        { "field": "total", "operator": "greater_than", "value": 0 }
                    ],
                    "actions": [
                        {
                            "type": "TELEGRAM_NOTIFICATION",
                            "params": {
                                "message": f"🛍️ New {app_name} Order #{{{{order_number}}}} received! Total: ${{{{total}}}}"
                            }
                        }
                    ]
                }
            ]
        }

        suggested_tables = [
            {
                "name": "customer_inquiries",
                "display_name": "Customer Inquiries",
                "description": "Custom inquiries and messages submitted via the Mini App",
                "fields": [
                    { "name": "customer_name", "label": "Customer Name", "field_type": "text", "is_required": True },
                    { "name": "phone", "label": "Phone Number", "field_type": "phone", "is_required": False },
                    { "name": "message", "label": "Message / Request", "field_type": "text", "is_required": True },
                    { "name": "status", "label": "Status", "field_type": "select", "default_value": "New" }
                ]
            }
        ]

        summary_of_changes = [
            f"Configured app metadata: '{app_name}' ({category})",
            "Generated 3 core pages: Home (with Hero & Highlights), Catalog, and Cart & Checkout",
            "Created responsive ProductGrid components wired to POS catalog",
            "Configured Telegram notification workflow for order confirmations",
            "Generated 'customer_inquiries' custom database table definition"
        ]

        return AIGenerateResponse(
            app_name=app_name,
            slug=slug,
            description=f"AI Generated specification for {prompt}",
            suggested_spec=suggested_spec,
            summary_of_changes=summary_of_changes,
            suggested_tables=suggested_tables,
            suggested_workflows=suggested_spec["workflows"]
        )
