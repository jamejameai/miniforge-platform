import re
from typing import Dict, Any, List
from app.schemas.ai import (
    AIGenerateRequest, AIGenerateResponse,
    BlueprintRequest, ProductBlueprint, BlueprintFeatureBreakdown
)

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

    @classmethod
    def generate_blueprint(cls, req: BlueprintRequest) -> ProductBlueprint:
        prompt = req.prompt.strip()
        lower = prompt.lower()

        # Categorize
        if any(w in lower for w in ["restaurant", "cafe", "coffee", "bistro", "food", "bakery", "dining", "menu", "pizza", "pizzeria", "bar", "gelato", "dessert", "eatery", "kitchen"]):
            category = "Food & Hospitality"
            # Derive custom app name if words present
            matched_name = "Artisan Eats & Coffee"
            for candidate in ["Pizzeria", "Pizza", "Gelato", "Coffee", "Cafe", "Bakery", "Bistro"]:
                if candidate.lower() in lower:
                    matched_name = f"Artisan {candidate} Mini App"
                    break
            app_name = matched_name
            purpose = "Digital menu, ordering, table reservations, and live kitchen dispatch for culinary establishments."
            target_users = ["Dine-in Patrons", "Takeaway Customers", "Cashiers & Baristas", "Restaurant Manager"]
            problems_solved = [
                "Long counter queues during peak hours",
                "Paper menu reprints when seasonal items change",
                "Lack of instant order notification to patrons via Telegram",
                "Inventory discrepancies during daily closing"
            ]
            roles = [
                {"role": "Guest / Customer", "description": "Browses digital menu, builds cart, selects dine-in/takeaway, tracks order status"},
                {"role": "Cashier / Staff", "description": "Operates POS register, logs cash/card payments, marks orders preparing/ready"},
                {"role": "Manager / Owner", "description": "Manages product catalog, monitors sales analytics, configures bot notifications"}
            ]
            sitemap = [
                {"path": "/", "name": "Digital Menu", "description": "Hero banner, seasonal specials, category browsing"},
                {"path": "/catalog", "name": "Full Food & Beverage", "description": "Categorized item cards with pricing and add-to-cart"},
                {"path": "/reservations", "name": "Table Booking", "description": "Table reservation form with date/time and seating preference"},
                {"path": "/cart", "name": "Cart & Checkout", "description": "Order review, discount code, table number, instant checkout"}
            ]
            features = BlueprintFeatureBreakdown(
                essential=[
                    "Digital product catalog with real-time stock levels",
                    "POS register & self-service mobile ordering",
                    "Atomic inventory deduction on completed checkout",
                    "Telegram Mini App menu launch button"
                ],
                recommended=[
                    "Automated Telegram message receipt on order placement",
                    "Table reservation management table with customer contact details",
                    "Daily gross sales and average order value metrics"
                ],
                optional_future=[
                    "Kitchen Display System (KDS) live ticket dispatch",
                    "Multi-tier customer loyalty points program",
                    "Scheduled morning opening inventory checklist"
                ]
            )
            tables = [
                {
                    "name": "table_reservations",
                    "display_name": "Table Reservations",
                    "description": "Guest dining bookings with date, time, and party size",
                    "fields": [
                        {"name": "guest_name", "label": "Guest Name", "field_type": "text", "is_required": True},
                        {"name": "phone", "label": "Phone Number", "field_type": "phone", "is_required": True},
                        {"name": "party_size", "label": "Party Size", "field_type": "number", "is_required": True, "default_value": "2"},
                        {"name": "reservation_time", "label": "Date & Time", "field_type": "datetime", "is_required": True},
                        {"name": "seating", "label": "Seating Area", "field_type": "select", "options": ["Indoor", "Patio", "Bar", "Private Dining"], "default_value": "Indoor"},
                        {"name": "status", "label": "Status", "field_type": "select", "options": ["Confirmed", "Seated", "Cancelled", "No-Show"], "default_value": "Confirmed"}
                    ]
                },
                {
                    "name": "special_dietary_requests",
                    "display_name": "Dietary Inquiries",
                    "description": "Allergy questions and custom catering requests",
                    "fields": [
                        {"name": "customer_name", "label": "Customer Name", "field_type": "text", "is_required": True},
                        {"name": "dietary_needs", "label": "Allergies / Dietary", "field_type": "text", "is_required": True},
                        {"name": "contact_info", "label": "Email / Telegram", "field_type": "text", "is_required": True}
                    ]
                }
            ]
            workflows = [
                {
                    "name": "Notify Telegram On New Order",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [{"field": "total", "operator": ">", "value": "0"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "☕ New Order #{order_number} received! Amount: ${total}"}}]
                },
                {
                    "name": "Alert Manager On Large Party Reservation",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [{"field": "party_size", "operator": ">=", "value": "6"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🔔 Large party booking for {guest_name} ({party_size} guests) on {reservation_time}!"}}]
                }
            ]
            questions = [
                "Will your establishment accept online advance orders with cash on pickup, or in-app payment?",
                "Do you have outdoor patio seating that requires separate weather-dependent booking?",
                "Would you like an automatic alert sent to your Telegram group when a product drops below 5 units?"
            ]

        elif any(w in lower for w in ["school", "education", "course", "learn", "academy", "class", "student"]):
            category = "Education & Training"
            app_name = "Apex Academy Portal"
            purpose = "Student enrollment, course catalogs, class schedule management, and direct instructor inquiries."
            target_users = ["Prospective Students", "Enrolled Learners", "Instructors", "Academic Coordinators"]
            problems_solved = [
                "Scattered course information across PDFs and chat groups",
                "Manual student registration spreadsheet maintenance",
                "Missed inquiries from prospective students interested in upcoming cohorts"
            ]
            roles = [
                {"role": "Student", "description": "Explores courses, views curriculum, submits enrollment requests, asks questions"},
                {"role": "Instructor", "description": "Publishes syllabus updates, reviews enrolled students"},
                {"role": "Administrator", "description": "Approves enrollments, manages pricing, dispatches announcements"}
            ]
            sitemap = [
                {"path": "/", "name": "Academy Home", "description": "Accreditation highlights, upcoming cohort dates, featured programs"},
                {"path": "/courses", "name": "Course Catalog", "description": "Full curriculum directory with difficulty levels and tuition"},
                {"path": "/admissions", "name": "Apply / Enroll", "description": "Structured enrollment application form"},
                {"path": "/contact", "name": "Student Advisory", "description": "Direct inquiry form connected to admissions desk"}
            ]
            features = BlueprintFeatureBreakdown(
                essential=[
                    "Curated course program directory with schedules",
                    "Interactive student enrollment application form",
                    "Real-time database table of applications and review statuses"
                ],
                recommended=[
                    "Automated Telegram message confirmation to student upon application",
                    "Course capacity tracking and waitlist triggers"
                ],
                optional_future=[
                    "Integrated quiz/assessment module",
                    "Digital certificate verification lookup"
                ]
            )
            tables = [
                {
                    "name": "enrollment_applications",
                    "display_name": "Enrollment Applications",
                    "description": "Student admission forms and evaluation statuses",
                    "fields": [
                        {"name": "student_name", "label": "Full Name", "field_type": "text", "is_required": True},
                        {"name": "email", "label": "Email Address", "field_type": "email", "is_required": True},
                        {"name": "phone", "label": "Phone / Telegram", "field_type": "phone", "is_required": False},
                        {"name": "course_selected", "label": "Selected Program", "field_type": "select", "options": ["Software Engineering", "UI/UX Design", "Product Management", "Data Analytics"], "default_value": "Software Engineering"},
                        {"name": "status", "label": "Application Status", "field_type": "select", "options": ["Pending Review", "Interview Scheduled", "Accepted", "Waitlisted"], "default_value": "Pending Review"}
                    ]
                }
            ]
            workflows = [
                {
                    "name": "Admissions Telegram Dispatch",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🎓 New student application received: {student_name} for {course_selected}!"}}]
                }
            ]
            questions = [
                "Are tuition fees paid upfront via payment checkout or processed via invoice upon review?",
                "Do applicants need to upload prerequisite portfolio links during admission?"
            ]

        elif any(w in lower for w in ["booking", "appointment", "salon", "barber", "spa", "doctor", "consult", "service"]):
            category = "Appointments & Services"
            app_name = "Zenith Booking & Services"
            purpose = "Appointment scheduling, practitioner availability, service menus, and automatic reminder alerts."
            target_users = ["Clients / Patients", "Service Specialists", "Reception Desk"]
            problems_solved = [
                "Double-booking confusion and telephone scheduling overhead",
                "Customer no-shows without confirmation notices",
                "Lack of customer service history records"
            ]
            roles = [
                {"role": "Client", "description": "Selects specialist, picks open calendar timeslot, receives confirmation"},
                {"role": "Specialist", "description": "Views daily appointment agenda and client service notes"},
                {"role": "Receptionist", "description": "Reschedules appointments, collects payment records"}
            ]
            sitemap = [
                {"path": "/", "name": "Services Overview", "description": "Featured treatments/services, specialist credentials, reviews"},
                {"path": "/services", "name": "Service Menu", "description": "Complete service list with duration and pricing"},
                {"path": "/book", "name": "Schedule Appointment", "description": "Timeslot picker, specialist selection, and booking confirmation"}
            ]
            features = BlueprintFeatureBreakdown(
                essential=[
                    "Service menu with durations, prices, and practitioner mapping",
                    "Online appointment booking form",
                    "Centralized appointments table with status workflow"
                ],
                recommended=[
                    "Telegram appointment confirmation to practitioner & client",
                    "Client visit history notes and preference tracking"
                ],
                optional_future=[
                    "Automated 24-hour advance SMS / Telegram reminder",
                    "Deposit collection during booking checkout"
                ]
            )
            tables = [
                {
                    "name": "appointments",
                    "display_name": "Appointments Schedule",
                    "description": "Booked client appointments, service types, and practitioner assignments",
                    "fields": [
                        {"name": "client_name", "label": "Client Name", "field_type": "text", "is_required": True},
                        {"name": "phone", "label": "Phone Number", "field_type": "phone", "is_required": True},
                        {"name": "service_name", "label": "Service", "field_type": "text", "is_required": True},
                        {"name": "appointment_date", "label": "Appointment Time", "field_type": "datetime", "is_required": True},
                        {"name": "status", "label": "Status", "field_type": "select", "options": ["Booked", "Completed", "Cancelled", "Rescheduled"], "default_value": "Booked"}
                    ]
                }
            ]
            workflows = [
                {
                    "name": "Notify Specialist of Booking",
                    "trigger_type": "RECORD_CREATED",
                    "conditions": [],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "📅 New appointment: {client_name} for {service_name} at {appointment_date}!"}}]
                }
            ]
            questions = [
                "What is your standard cancellation policy (e.g. 24 hours notice)?",
                "Do you assign appointments to specific staff members or any available specialist?"
            ]

        else:
            # General / E-commerce / Modern Business
            category = "E-Commerce & Retail"
            words = prompt.split()[:4]
            app_name = " ".join(w.capitalize() for w in words) if words else "Vanguard Commercial Mini App"
            purpose = f"Visual product storefront, inventory management, instant checkout, and customer engagement for: {prompt}"
            target_users = ["Mobile Shoppers", "Cashiers & Fulfilment Staff", "Store Manager"]
            problems_solved = [
                "Friction in customer ordering across chat channels",
                "Manual inventory record keeping",
                "Slow order fulfillment without real-time notifications"
            ]
            roles = [
                {"role": "Customer", "description": "Discovers featured items, adds to cart, places orders via Web or Telegram"},
                {"role": "Store Operator", "description": "Manages order dispatch, stock adjustments, and customer inquiries"}
            ]
            sitemap = [
                {"path": "/", "name": "Storefront", "description": "Brand hero, product grid highlights, customer testimonials"},
                {"path": "/catalog", "name": "Catalog Directory", "description": "Full product catalog with live stock status and filters"},
                {"path": "/cart", "name": "Cart & Checkout", "description": "Shopping cart review, payment method selector, order confirmation"}
            ]
            features = BlueprintFeatureBreakdown(
                essential=[
                    "Responsive product catalog with image gallery and pricing",
                    "Self-service shopping cart with instant checkout",
                    "Centralized orders database with atomic stock deduction"
                ],
                recommended=[
                    "Instant Telegram order receipt notifications",
                    "Low stock alert notifications to inventory manager"
                ],
                optional_future=[
                    "Multi-currency support and customer loyalty tiers",
                    "Bulk order discounts"
                ]
            )
            tables = [
                {
                    "name": "customer_inquiries",
                    "display_name": "Customer Support Tickets",
                    "description": "Customer questions, custom orders, and support requests",
                    "fields": [
                        {"name": "customer_name", "label": "Customer Name", "field_type": "text", "is_required": True},
                        {"name": "contact_info", "label": "Email or Phone", "field_type": "text", "is_required": True},
                        {"name": "subject", "label": "Subject", "field_type": "text", "is_required": True},
                        {"name": "message", "label": "Message", "field_type": "text", "is_required": True},
                        {"name": "status", "label": "Status", "field_type": "select", "options": ["Open", "In Progress", "Resolved"], "default_value": "Open"}
                    ]
                }
            ]
            workflows = [
                {
                    "name": "Store Telegram Order Alert",
                    "trigger_type": "ORDER_CREATED",
                    "conditions": [{"field": "total", "operator": ">", "value": "0"}],
                    "actions": [{"type": "TELEGRAM_NOTIFICATION", "params": {"message": "🛍️ New order #{order_number} confirmed! Total: ${total}"}}]
                }
            ]
            questions = [
                "Will your items be physical goods requiring shipping addresses, or local pickup?",
                "Do you want to enable customer discounts or promotional coupon codes?"
            ]

        # Generate complete suggested AppSpec
        slug = re.sub(r"[^a-z0-9]+", "-", app_name.lower()).strip("-")
        suggested_spec = {
            "version": "1.0.0",
            "name": app_name,
            "slug": slug,
            "description": purpose,
            "theme": {
                "primaryColor": "#D4146E",
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
                    {"id": "nav-home", "label": "Home", "pageId": "page-home", "icon": "Home", "isVisible": True},
                    {"id": "nav-catalog", "label": "Catalog", "pageId": "page-catalog", "icon": "Grid", "isVisible": True},
                    {"id": "nav-cart", "label": "Cart", "pageId": "page-cart", "icon": "ShoppingCart", "isVisible": True}
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
                                "title": f"Welcome to {app_name}",
                                "subtitle": purpose,
                                "badge": category,
                                "buttonText": "Explore Catalog",
                                "buttonAction": {"type": "NAVIGATE", "target": "page-catalog"}
                            }
                        },
                        {
                            "id": "comp-heading-highlights",
                            "type": "SectionHeading",
                            "props": {
                                "title": "Featured Highlights",
                                "subtitle": "Top rated selections ready for instant ordering"
                            }
                        },
                        {
                            "id": "comp-product-grid-home",
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
                                "title": "Complete Catalog",
                                "subtitle": "Select items and add to your cart"
                            }
                        },
                        {
                            "id": "comp-catalog-grid",
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
                                "emptyText": "Your cart is currently empty. Tap 'Catalog' to discover items.",
                                "checkoutButtonText": "Confirm Order"
                            }
                        }
                    ]
                }
            ],
            "workflows": workflows
        }

        return ProductBlueprint(
            app_name=app_name,
            purpose=purpose,
            category=category,
            target_users=target_users,
            problems_solved=problems_solved,
            roles=roles,
            sitemap=sitemap,
            features=features,
            database_tables=tables,
            workflows=workflows,
            clarifying_questions=questions,
            suggested_spec=suggested_spec
        )


