from typing import Dict, Any, List

TEMPLATES_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "restaurant",
        "name": "Artisan Restaurant & Cafe",
        "category": "Food & Hospitality",
        "description": "Digital dining menu, table reservations, POS order dispatch, and automated Telegram alerts.",
        "icon": "Utensils",
        "color": "#D4146E",
        "badge": "Popular",
        "spec": {
            "version": "1.0.0",
            "name": "Artisan Restaurant & Cafe",
            "slug": "artisan-restaurant",
            "description": "Digital ordering and reservations",
            "theme": {
                "primaryColor": "#D4146E",
                "primaryDark": "#171717",
                "backgroundColor": "#FFFFFF",
                "surfaceColor": "#F7F7F8",
                "borderColor": "#E8E8EA",
                "borderRadius": "8px"
            },
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Menu", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-catalog", "label": "Food & Drinks", "pageId": "page-catalog", "icon": "Grid", "isVisible": True},
                    {"id": "nav-cart", "label": "My Order", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Chef's Specials",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {
                            "id": "c-hero",
                            "type": "HeroBanner",
                            "props": {
                                "title": "Artisan Gastronomy",
                                "subtitle": "Handcrafted culinary masterpieces fresh to your table.",
                                "badge": "Table Reservations Open",
                                "buttonText": "Order Table Specials",
                                "buttonAction": {"type": "NAVIGATE", "target": "page-catalog"}
                            }
                        },
                        {
                            "id": "c-grid",
                            "type": "ProductGrid",
                            "props": {"dataSource": "pos_products", "columns": 2, "limit": 4, "showAddToCart": True}
                        }
                    ]
                },
                {
                    "id": "page-catalog",
                    "title": "Complete Menu",
                    "slug": "/catalog",
                    "isHome": False,
                    "components": [
                        {"id": "c-head", "type": "SectionHeading", "props": {"title": "Full Dining Selection", "subtitle": "Starters, mains, and artisanal desserts"}},
                        {"id": "c-cat-grid", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Review Order",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-cart", "type": "CartView", "props": {"emptyText": "Your dining tray is empty.", "checkoutButtonText": "Send to Kitchen"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Kitchen Order Dispatch",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [{"field": "total", "operator": ">", "value": "0"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🍳 Kitchen alert: Order #{order_number} received! Total: ${total}"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "reservations",
                "display_name": "Table Reservations",
                "fields": [
                    {"name": "guest_name", "label": "Guest Name", "field_type": "text", "is_required": True},
                    {"name": "party_size", "label": "Guests", "field_type": "number", "is_required": True, "default_value": "2"},
                    {"name": "seating", "label": "Area", "field_type": "select", "options": ["Patio", "Main Room", "Bar"]},
                    {"name": "status", "label": "Status", "field_type": "select", "options": ["Booked", "Seated", "Cancelled"], "default_value": "Booked"}
                ]
            }
        ],
        "starter_products": [
            {"name": "Truffle Tagliolini", "price": 18.50, "cost": 4.50, "stock": 30, "sku": "PST-TRF-01", "img": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"},
            {"name": "Dry-Aged Ribeye 12oz", "price": 34.00, "cost": 12.00, "stock": 20, "sku": "STK-RIB-01", "img": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400"},
            {"name": "Pistachio Panna Cotta", "price": 8.50, "cost": 2.00, "stock": 25, "sku": "DST-PNC-01", "img": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400"}
        ]
    },
    {
        "id": "pos_retail",
        "name": "Retail Store & Express POS",
        "category": "Retail & Commerce",
        "description": "High-velocity cashier register, barcode/SKU catalog, and live inventory balance tracking.",
        "icon": "ShoppingBag",
        "color": "#171717",
        "badge": "High Demand",
        "spec": {
            "version": "1.0.0",
            "name": "Retail Express Store",
            "slug": "retail-express",
            "description": "Fast cashier checkout & inventory",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "6px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Store", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-cart", "label": "Register", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Product Catalog",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Retail Cashier Express", "subtitle": "Scan, add, and process customer sales.", "badge": "Active POS Session"}},
                        {"id": "c-grid", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 3, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Point of Sale Checkout",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-cart", "type": "CartView", "props": {"emptyText": "Register empty. Select products to begin sale.", "checkoutButtonText": "Charge Customer"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "POS Restock Notification",
                    "trigger_type": "LOW_STOCK",
                    "conditions": [{"field": "stock_quantity", "operator": "<=", "value": "5"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "⚠️ Low Stock: {product_name} has only {stock_quantity} units remaining!"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "suppliers",
                "display_name": "Product Suppliers",
                "fields": [
                    {"name": "company_name", "label": "Supplier Name", "field_type": "text", "is_required": True},
                    {"name": "contact_phone", "label": "Contact Phone", "field_type": "phone"},
                    {"name": "lead_days", "label": "Lead Time (Days)", "field_type": "number", "default_value": "3"}
                ]
            }
        ],
        "starter_products": [
            {"name": "Classic Leather Wallet", "price": 45.00, "cost": 15.00, "stock": 40, "sku": "ACC-WLT-01", "img": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"},
            {"name": "Ceramic Travel Mug", "price": 22.00, "cost": 6.50, "stock": 60, "sku": "HOM-MUG-01", "img": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400"}
        ]
    },
    {
        "id": "ecommerce",
        "name": "Modern E-Commerce Storefront",
        "category": "E-Commerce",
        "description": "Sleek direct-to-consumer store with product categories, cart drawer, and order tracking.",
        "icon": "ShoppingCart",
        "color": "#D4146E",
        "badge": "Essential",
        "spec": {
            "version": "1.0.0",
            "name": "Modern Storefront",
            "slug": "modern-storefront",
            "description": "DTC E-Commerce shop",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "12px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Shop", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-catalog", "label": "Products", "pageId": "page-catalog", "icon": "Grid", "isVisible": True},
                    {"id": "nav-cart", "label": "Cart", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Shop Home",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-hero", "type": "HeroBanner", "props": {"title": "Autumn Collection", "subtitle": "Curated essentials for everyday luxury.", "badge": "Free Shipping Available", "buttonText": "Shop Collection", "buttonAction": {"type": "NAVIGATE", "target": "page-catalog"}}},
                        {"id": "c-grid", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "limit": 4, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-catalog",
                    "title": "All Products",
                    "slug": "/catalog",
                    "isHome": False,
                    "components": [
                        {"id": "c-grid-full", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Checkout",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-cart", "type": "CartView", "props": {"emptyText": "No items in cart.", "checkoutButtonText": "Place Order"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Order Dispatch Notice",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [{"field": "total", "operator": ">", "value": "0"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "📦 New Store Order #{order_number} for ${total}!"}}]
                }
            ]
        },
        "database_tables": [],
        "starter_products": [
            {"name": "Minimalist Desk Lamp", "price": 68.00, "cost": 22.00, "stock": 18, "sku": "LMP-DESK-01", "img": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"},
            {"name": "Wireless Audio Headphones", "price": 129.00, "cost": 45.00, "stock": 25, "sku": "AUD-HDP-01", "img": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
        ]
    },
    {
        "id": "school",
        "name": "Academy & Course Portal",
        "category": "Education",
        "description": "Syllabus directories, cohort dates, tuition tiers, and student enrollment applications.",
        "icon": "GraduationCap",
        "color": "#171717",
        "badge": "Education",
        "spec": {
            "version": "1.0.0",
            "name": "Global Academy",
            "slug": "global-academy",
            "description": "Learning portal and student registration",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "8px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Programs", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-catalog", "label": "Courses", "pageId": "page-catalog", "icon": "Grid", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Academy Programs",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-hero", "type": "HeroBanner", "props": {"title": "Accelerate Your Future", "subtitle": "Industry-accredited software and design certifications.", "badge": "New Cohort Starting", "buttonText": "View Courses", "buttonAction": {"type": "NAVIGATE", "target": "page-catalog"}}},
                        {"id": "c-grid", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-catalog",
                    "title": "All Courses",
                    "slug": "/catalog",
                    "isHome": False,
                    "components": [
                        {"id": "c-grid", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Student Enrollment Notice",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🎓 New application: {student_name} applied for {course}!"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "students",
                "display_name": "Student Applicants",
                "fields": [
                    {"name": "student_name", "label": "Student Name", "field_type": "text", "is_required": True},
                    {"name": "email", "label": "Email", "field_type": "email", "is_required": True},
                    {"name": "course", "label": "Desired Program", "field_type": "select", "options": ["Web Engineering", "Product Design", "Cloud AI"]}
                ]
            }
        ],
        "starter_products": [
            {"name": "Full-Stack Web Engineering", "price": 499.00, "cost": 50.00, "stock": 20, "sku": "CRS-WEB-01", "img": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"},
            {"name": "Visual Design & UI/UX Mastery", "price": 399.00, "cost": 40.00, "stock": 25, "sku": "CRS-UIX-01", "img": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400"}
        ]
    },
    {
        "id": "booking",
        "name": "Salon, Spa & Specialist Booking",
        "category": "Services",
        "description": "Interactive appointment timeslot scheduler, specialist profiles, and automated confirmations.",
        "icon": "Calendar",
        "color": "#D4146E",
        "badge": "Booking",
        "spec": {
            "version": "1.0.0",
            "name": "Zenith Studio Booking",
            "slug": "zenith-booking",
            "description": "Appointment scheduling app",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "10px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Services", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-cart", "label": "Checkout", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Available Treatments",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Zenith Wellness & Care", "subtitle": "Select a treatment and schedule your appointment.", "badge": "Same-Day Slots Available"}},
                        {"id": "c-g", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Review Appointment",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-c", "type": "CartView", "props": {"emptyText": "No service selected.", "checkoutButtonText": "Confirm Booking"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Booking Confirmation",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🗓️ New Appointment confirmed! Order #{order_number} for ${total}"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "appointments",
                "display_name": "Appointments Roster",
                "fields": [
                    {"name": "client_name", "label": "Client Name", "field_type": "text", "is_required": True},
                    {"name": "appointment_time", "label": "Date & Time", "field_type": "datetime", "is_required": True},
                    {"name": "service", "label": "Service", "field_type": "text", "is_required": True}
                ]
            }
        ],
        "starter_products": [
            {"name": "Deep Tissue Therapeutic Massage (60m)", "price": 85.00, "cost": 20.00, "stock": 99, "sku": "SRV-MSG-01", "img": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400"},
            {"name": "Signature Rejuvenating Facial (45m)", "price": 65.00, "cost": 15.00, "stock": 99, "sku": "SRV-FCL-01", "img": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400"}
        ]
    },
    {
        "id": "inventory",
        "name": "Warehouse & Stock Operations",
        "category": "Logistics",
        "description": "Stock on hand, audit trail movements, supplier invoices, and reorder threshold alarms.",
        "icon": "Package",
        "color": "#171717",
        "badge": "Operations",
        "spec": {
            "version": "1.0.0",
            "name": "Warehouse Ledger",
            "slug": "warehouse-ledger",
            "description": "Inventory movement and stock tracking",
            "theme": {"primaryColor": "#171717", "borderRadius": "4px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Inventory", "pageId": "page-home", "icon": "Home", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Inventory Control",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Warehouse Logistics Central", "subtitle": "Live tracking of all SKU movements.", "badge": "Audit Logged"}},
                        {"id": "c-g", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 3, "showAddToCart": False}}
                    ]
                }
            ],
            "workflows": []
        },
        "database_tables": [
            {
                "name": "warehouse_locations",
                "display_name": "Aisles & Bins",
                "fields": [
                    {"name": "aisle", "label": "Aisle Number", "field_type": "text", "is_required": True},
                    {"name": "bin_code", "label": "Bin Code", "field_type": "text", "is_required": True}
                ]
            }
        ],
        "starter_products": [
            {"name": "Corrugated Shipping Cartons (Bundle)", "price": 28.00, "cost": 12.00, "stock": 150, "sku": "PKG-BOX-01", "img": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"}
        ]
    },
    {
        "id": "crm",
        "name": "Client Relations & Deals (CRM)",
        "category": "Sales & CRM",
        "description": "Lead pipeline, contact interaction notes, deal stages, and automatic follow-up tasks.",
        "icon": "Users",
        "color": "#D4146E",
        "badge": "Productivity",
        "spec": {
            "version": "1.0.0",
            "name": "Apex CRM",
            "slug": "apex-crm",
            "description": "Customer pipeline management",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "8px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Overview", "pageId": "page-home", "icon": "Home", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Pipeline",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Apex Relationship Hub", "subtitle": "Track prospects, deals, and lifetime revenue.", "badge": "Active Pipeline"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "New High-Value Lead Alert",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "💼 New Prospect added: {contact_name} ({company})!"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "leads",
                "display_name": "Sales Leads",
                "fields": [
                    {"name": "contact_name", "label": "Contact Name", "field_type": "text", "is_required": True},
                    {"name": "company", "label": "Company", "field_type": "text", "is_required": True},
                    {"name": "deal_value", "label": "Estimated Value ($)", "field_type": "number", "default_value": "5000"},
                    {"name": "stage", "label": "Deal Stage", "field_type": "select", "options": ["Discovery", "Proposal Sent", "Won", "Lost"], "default_value": "Discovery"}
                ]
            }
        ],
        "starter_products": []
    },
    {
        "id": "tasks",
        "name": "Team Task & Project Tracker",
        "category": "Productivity",
        "description": "Sprint milestones, team assignments, task statuses, and completion notifications.",
        "icon": "CheckSquare",
        "color": "#171717",
        "badge": "Collaboration",
        "spec": {
            "version": "1.0.0",
            "name": "Sprint Task Manager",
            "slug": "sprint-tasks",
            "description": "Team project tracking",
            "theme": {"primaryColor": "#171717", "borderRadius": "6px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [{"id": "nav-home", "label": "Tasks", "pageId": "page-home", "icon": "Home", "isVisible": True}]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Task Board",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Sprint Board 42", "subtitle": "Manage tasks, deadlines, and deliverables.", "badge": "Sprint Active"}}
                    ]
                }
            ],
            "workflows": []
        },
        "database_tables": [
            {
                "name": "tasks",
                "display_name": "Sprint Tasks",
                "fields": [
                    {"name": "title", "label": "Task Title", "field_type": "text", "is_required": True},
                    {"name": "assignee", "label": "Assignee", "field_type": "text"},
                    {"name": "priority", "label": "Priority", "field_type": "select", "options": ["Low", "Medium", "Urgent"], "default_value": "Medium"},
                    {"name": "status", "label": "Status", "field_type": "select", "options": ["Todo", "In Progress", "Done"], "default_value": "Todo"}
                ]
            }
        ],
        "starter_products": []
    },
    {
        "id": "membership",
        "name": "VIP Membership & Community Club",
        "category": "Community",
        "description": "Exclusive tiers, member directory, gated perks, and renewal notices.",
        "icon": "Award",
        "color": "#D4146E",
        "badge": "Community",
        "spec": {
            "version": "1.0.0",
            "name": "Elite Club Membership",
            "slug": "elite-club",
            "description": "Member perks and tiers",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "8px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Perks", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-cart", "label": "Join", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Club Privileges",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Welcome to The Syndicate", "subtitle": "Exclusive member access and community privileges.", "badge": "Members Only"}},
                        {"id": "c-g", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Membership Activation",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-c", "type": "CartView", "props": {"emptyText": "Select a membership tier.", "checkoutButtonText": "Activate Membership"}}
                    ]
                }
            ],
            "workflows": []
        },
        "database_tables": [
            {
                "name": "members",
                "display_name": "Active Members",
                "fields": [
                    {"name": "member_name", "label": "Full Name", "field_type": "text", "is_required": True},
                    {"name": "tier", "label": "Membership Tier", "field_type": "select", "options": ["Silver", "Gold", "Founders Club"], "default_value": "Silver"}
                ]
            }
        ],
        "starter_products": [
            {"name": "Gold Annual Membership Pass", "price": 250.00, "cost": 0.00, "stock": 100, "sku": "MBR-GLD-01", "img": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400"}
        ]
    },
    {
        "id": "portfolio",
        "name": "Creative Agency & Portfolio",
        "category": "Portfolio",
        "description": "Showcase client case studies, design gallery, skill highlights, and project inquiries.",
        "icon": "Sparkles",
        "color": "#171717",
        "badge": "Creative",
        "spec": {
            "version": "1.0.0",
            "name": "Studio Portfolio",
            "slug": "studio-portfolio",
            "description": "Creative showcase and inquiries",
            "theme": {"primaryColor": "#171717", "borderRadius": "12px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [{"id": "nav-home", "label": "Work", "pageId": "page-home", "icon": "Home", "isVisible": True}]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Selected Works",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Crafting Iconic Digital Brands", "subtitle": "Visual identities and bespoke software for world-class founders.", "badge": "Available for Q4 Commissions"}}
                    ]
                }
            ],
            "workflows": []
        },
        "database_tables": [
            {
                "name": "project_inquiries",
                "display_name": "Client Inquiries",
                "fields": [
                    {"name": "client_name", "label": "Client Name", "field_type": "text", "is_required": True},
                    {"name": "project_scope", "label": "Scope", "field_type": "text", "is_required": True},
                    {"name": "budget", "label": "Budget Range", "field_type": "select", "options": ["$5k - $10k", "$10k - $25k", "$25k+"]}
                ]
            }
        ],
        "starter_products": []
    },
    {
        "id": "events",
        "name": "Event Registration & Ticketing",
        "category": "Events",
        "description": "Event schedules, speaker roster, general/VIP ticket tiers, and instant Telegram badge delivery.",
        "icon": "Ticket",
        "color": "#D4146E",
        "badge": "Events",
        "spec": {
            "version": "1.0.0",
            "name": "Tech Summit 2026",
            "slug": "tech-summit-2026",
            "description": "Conference registration and tickets",
            "theme": {"primaryColor": "#D4146E", "borderRadius": "8px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [
                    {"id": "nav-home", "label": "Agenda", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-cart", "label": "Tickets", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
                ]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Summit Agenda",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "Global Tech Summit 2026", "subtitle": "Keynotes, masterclasses, and networking with 2,000+ industry pioneers.", "badge": "Early Bird Tickets Live"}},
                        {"id": "c-g", "type": "ProductGrid", "props": {"dataSource": "pos_products", "columns": 2, "showAddToCart": True}}
                    ]
                },
                {
                    "id": "page-cart",
                    "title": "Ticket Checkout",
                    "slug": "/cart",
                    "isHome": False,
                    "components": [
                        {"id": "c-c", "type": "CartView", "props": {"emptyText": "Select a ticket tier.", "checkoutButtonText": "Claim Tickets"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Ticket Telegram Pass Dispatch",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🎟️ Ticket confirmed! Order #{order_number} for ${total}. Present this message at badge pickup!"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "attendees",
                "display_name": "Registered Attendees",
                "fields": [
                    {"name": "attendee_name", "label": "Attendee Name", "field_type": "text", "is_required": True},
                    {"name": "badge_title", "label": "Company & Title", "field_type": "text"}
                ]
            }
        ],
        "starter_products": [
            {"name": "General Admission All-Access Pass", "price": 99.00, "cost": 10.00, "stock": 250, "sku": "TCK-GEN-01", "img": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"},
            {"name": "VIP Keynote & Dinner Pass", "price": 249.00, "cost": 40.00, "stock": 50, "sku": "TCK-VIP-01", "img": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400"}
        ]
    },
    {
        "id": "portal",
        "name": "Customer Support & Self-Service Portal",
        "category": "Customer Support",
        "description": "FAQ knowledgebase, support ticket submission, live resolution status, and agent dispatch.",
        "icon": "LifeBuoy",
        "color": "#171717",
        "badge": "Support",
        "spec": {
            "version": "1.0.0",
            "name": "Help Desk Portal",
            "slug": "helpdesk-portal",
            "description": "Customer self-service desk",
            "theme": {"primaryColor": "#171717", "borderRadius": "8px"},
            "navigation": {
                "type": "bottom_nav",
                "items": [{"id": "nav-home", "label": "Help", "pageId": "page-home", "icon": "Home", "isVisible": True}]
            },
            "pages": [
                {
                    "id": "page-home",
                    "title": "Customer Help Desk",
                    "slug": "/",
                    "isHome": True,
                    "components": [
                        {"id": "c-h", "type": "HeroBanner", "props": {"title": "How Can We Assist You Today?", "subtitle": "Submit inquiries and track resolutions directly inside Telegram.", "badge": "24/7 Response Time"}}
                    ]
                }
            ],
            "workflows": [
                {
                    "name": "Support Ticket Dispatch",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🎧 New Support Ticket: #{ticket_number} - {subject} from {customer_name}"}}]
                }
            ]
        },
        "database_tables": [
            {
                "name": "support_tickets",
                "display_name": "Support Tickets",
                "fields": [
                    {"name": "customer_name", "label": "Customer Name", "field_type": "text", "is_required": True},
                    {"name": "subject", "label": "Issue Subject", "field_type": "text", "is_required": True},
                    {"name": "description", "label": "Details", "field_type": "text", "is_required": True},
                    {"name": "status", "label": "Status", "field_type": "select", "options": ["Open", "In Review", "Resolved"], "default_value": "Open"}
                ]
            }
        ],
        "starter_products": []
    }
]
