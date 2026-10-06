#!/usr/bin/env python3
"""Generate the MySafeHouse User & Admin Guide PDF."""

from pathlib import Path

from fpdf import FPDF

OUTPUT = Path(__file__).resolve().parent / "MySafeHouse-User-Admin-Guide.pdf"

NAVY = (3, 4, 94)  # #03045e
CYAN = (142, 224, 238)  # #8ee0ee
DARK = (17, 24, 39)
MUTED = (75, 85, 99)
LIGHT_BG = (240, 249, 251)  # #f0f9fb
WHITE = (255, 255, 255)
RULE = (209, 213, 219)


class GuidePDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*NAVY)
        self.rect(0, 0, self.w, 12, "F")
        self.set_xy(14, 3.5)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*CYAN)
        self.cell(0, 5, "MySafeHouse  |  User & Admin Guide", align="L")
        self.set_text_color(*DARK)
        self.ln(14)

    def footer(self):
        self.set_y(-15)
        self.set_draw_color(*RULE)
        self.set_line_width(0.2)
        self.line(14, self.get_y(), self.w - 14, self.get_y())
        self.set_y(-12)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 8, f"mysafehouse.co.uk  ·  Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, text: str):
        self.ln(4)
        self.set_fill_color(*NAVY)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 13)
        self.cell(0, 9, f"  {text}", new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(4)
        self.set_text_color(*DARK)

    def sub_title(self, text: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*NAVY)
        self.cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(*DARK)
        self.ln(1)

    def body(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.2, text)
        self.ln(1.5)

    def bullet(self, text: str, indent: float = 4):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        x = self.l_margin + indent
        self.set_x(x)
        bullet_w = 4
        self.cell(bullet_w, 5.2, "-")
        self.multi_cell(self.w - self.r_margin - x - bullet_w, 5.2, text)

    def numbered(self, n: int, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*DARK)
        x = self.l_margin + 4
        self.set_x(x)
        label = f"{n}."
        self.cell(7, 5.2, label)
        self.multi_cell(self.w - self.r_margin - x - 7, 5.2, text)

    def callout(self, title: str, text: str):
        self.ln(1)
        y = self.get_y()
        self.set_fill_color(*LIGHT_BG)
        self.set_draw_color(*CYAN)
        self.set_line_width(0.6)
        # provisional height; draw after measuring is hard - use multi_cell inside padded box
        start_y = self.get_y()
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*NAVY)
        # background rectangle approximated by filling after content using marker
        self.ln(2)
        self.set_x(self.l_margin + 4)
        self.cell(0, 5, title, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.set_x(self.l_margin + 4)
        self.multi_cell(self.w - self.l_margin - self.r_margin - 8, 5, text)
        end_y = self.get_y() + 2
        # redraw background behind (simple top bar instead of full box for reliability)
        self.set_draw_color(*CYAN)
        self.set_line_width(1.2)
        self.line(self.l_margin, start_y, self.l_margin, end_y)
        self.set_y(end_y)
        self.ln(2)

    def route(self, path: str, meaning: str):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(*NAVY)
        self.set_x(self.l_margin + 4)
        self.cell(52, 5.2, path)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        self.multi_cell(0, 5.2, meaning)


def build():
    pdf = GuidePDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(14, 16, 14)

    # -------- Cover --------
    pdf.add_page()
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, pdf.w, 70, "F")
    pdf.set_xy(14, 22)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 12, "MySafeHouse", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(14)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(*CYAN)
    pdf.cell(0, 8, "User & Admin Guide", new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(14, 78)
    pdf.set_text_color(*DARK)
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(
        0,
        6,
        "A practical guide to what MySafeHouse is, who it is for, and how to use "
        "the website - including property owner tools and the Admin Panel.",
    )
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*MUTED)
    pdf.multi_cell(0, 5.5, "Website: https://mysafehouse.co.uk\nDocument date: October 2026")
    pdf.ln(8)

    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 7, "Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(*DARK)
    pdf.set_font("Helvetica", "", 10)
    for item in [
        "1. What MySafeHouse is",
        "2. Who it is for",
        "3. Key concepts",
        "4. How to use the website (public visitors)",
        "5. Property owners - account & dashboard",
        "6. Managing access requests & payments",
        "7. Admin Panel",
        "8. Quick reference - important pages",
        "9. Tips & troubleshooting",
    ]:
        pdf.cell(0, 6, item, new_x="LMARGIN", new_y="NEXT")

    # -------- 1 --------
    pdf.add_page()
    pdf.section_title("1. What MySafeHouse is")
    pdf.body(
        "MySafeHouse is a secure property access platform. It helps property owners "
        "share controlled access information - such as keysafe location and codes - "
        "with emergency services and other authorised visitors, only when a request "
        "has been properly verified and approved."
    )
    pdf.body(
        "Instead of leaving codes in insecure places or answering unexpected calls "
        "under pressure, owners manage access through the website: visitors request "
        "access at a property, prove they are nearby, and wait for the owner to "
        "approve or deny. When approved, the visitor receives the details they need "
        "(also by email)."
    )
    pdf.callout(
        "In one sentence",
        "MySafeHouse gives emergency and authorised access to a home or property "
        "without permanently publishing keysafe details.",
    )

    # -------- 2 --------
    pdf.section_title("2. Who it is for")
    pdf.bullet("Property owners who want controlled emergency or authorised access for their homes or properties.")
    pdf.bullet("Emergency services and authorised visitors who need time-critical access at a registered address.")
    pdf.bullet("Administrators who manage users, NFC/QR codes, domains, system settings, and access monitoring.")

    # -------- 3 --------
    pdf.section_title("3. Key concepts")
    pdf.sub_title("Keysafe")
    pdf.body(
        "A physical key box at the property. MySafeHouse can store its location, access code, "
        "What3Words reference, coordinates, notes, and an optional photo. These details are "
        "only revealed after an access request is approved."
    )
    pdf.sub_title("Emergency vs standard access")
    pdf.bullet("Emergency access - for urgent situations. Marked clearly when requesting. Owners are notified promptly (email and, when configured, SMS).")
    pdf.bullet("Standard access - for non-urgent authorised visits. Owners are still notified and must approve or deny.")
    pdf.sub_title("Location verification")
    pdf.body(
        "Before submitting a request, visitors must verify they are at (or very near) the property "
        "using their device location. The allowed distance is configured by admins."
    )
    pdf.sub_title("Credits")
    pdf.body(
        "Owners need property credits to register properties (typically one credit per property). "
        "Credits come with a subscription plan and can also be purchased separately."
    )
    pdf.sub_title("NFC tags & QR codes")
    pdf.body(
        "Physical NFC tags or QR codes can be linked to a property. Scanning them takes a visitor "
        "straight to that property's access page on MySafeHouse."
    )
    pdf.sub_title("Allowed / blocked email domains")
    pdf.body(
        "Admins can allowlist trusted email domains (for example emergency service domains) or "
        "block domains. Allowed domains may receive streamlined access behaviour where configured."
    )

    # -------- 4 --------
    pdf.add_page()
    pdf.section_title("4. How to use the website (public visitors)")
    pdf.sub_title("Find a property")
    pdf.numbered(1, "Go to https://mysafehouse.co.uk")
    pdf.numbered(2, "Use the Property Address search bar on the homepage (the main tool on the page).")
    pdf.numbered(3, "Start typing an address and select a matching MySafeHouse property.")
    pdf.numbered(4, "You will open the Property Details page for that property.")
    pdf.sub_title("Request access")
    pdf.numbered(1, "On the property page, tap Request Access.")
    pdf.numbered(2, "Enter your email address.")
    pdf.numbered(3, "If this is urgent, tick This is an emergency.")
    pdf.numbered(4, "Tap Verify Location and allow location access so MySafeHouse can confirm you are at the property.")
    pdf.numbered(5, "Send the access request. The property owner is notified.")
    pdf.sub_title("What happens next")
    pdf.bullet("If you stay in the browser, MySafeHouse can wait for the owner's decision and redirect you when they respond.")
    pdf.bullet("If the owner approves - you are taken to an Access Approved page showing the same details sent in your approval email (property address and keysafe information when available).")
    pdf.bullet("If the owner denies - you are taken to a Permission Denied page. No property access details are shown.")
    pdf.bullet("You can leave the page at any time. You will still receive an email with the outcome (especially useful for standard access requests).")
    pdf.sub_title("NFC / QR / tag entry")
    pdf.body(
        "If you scan an NFC tag or QR code linked to a MySafeHouse property, you will be taken "
        "directly to that property's page and can follow the same Request Access steps."
    )

    # -------- 5 --------
    pdf.section_title("5. Property owners - account & dashboard")
    pdf.sub_title("Create an account")
    pdf.numbered(1, "Open Sign Up (/auth/register) and create your account.")
    pdf.numbered(2, "Confirm your email if prompted.")
    pdf.numbered(3, "Complete your profile - especially your mobile number (required before adding properties).")
    pdf.sub_title("Dashboard overview (/dashboard)")
    pdf.bullet("See your property credits and subscription status.")
    pdf.bullet("Add and switch between properties.")
    pdf.bullet("Store keysafe information for each property.")
    pdf.bullet("Manage emergency contacts for a property.")
    pdf.bullet("View NFC/QR details when a code is assigned.")
    pdf.bullet("Generate or download QR codes for a property where available.")
    pdf.sub_title("Adding a property")
    pdf.numbered(1, "Ensure you have enough credits and a mobile number on your profile.")
    pdf.numbered(2, "From the dashboard, add a property with name, address, type, and map location.")
    pdf.numbered(3, "Add keysafe details (location, code, What3Words, notes, image).")
    pdf.numbered(4, "Add emergency contacts (name, email, phone, relationship, access level).")
    pdf.numbered(5, "Enable emergency access for the property when you are ready to accept requests.")
    pdf.callout(
        "Credit tip",
        "One credit is typically used per property. Deleting a property can return a credit to your balance.",
    )

    # -------- 6 --------
    pdf.add_page()
    pdf.section_title("6. Managing access requests & payments")
    pdf.sub_title("Responding to requests")
    pdf.bullet("You may receive an email (and SMS for emergencies, when configured) with Approve / Deny links.")
    pdf.bullet("You can also review requests in Access Requests (/access-requests).")
    pdf.bullet("Approve - the requester receives keysafe/access details by email and, if still on the site, via the Access Approved page.")
    pdf.bullet("Deny - the requester is informed; they do not receive access details.")
    pdf.sub_title("Payments & plans (/payments)")
    pdf.bullet("Choose a subscription plan to receive property credits.")
    pdf.bullet("Purchase additional credits if you need more properties (subject to plan limits).")
    pdf.bullet("After checkout, Payment Success confirms your subscription or credit purchase.")
    pdf.sub_title("Profile (/profile)")
    pdf.bullet("Update your name, email, mobile number, and avatar.")
    pdf.bullet("Keep your mobile number current so emergency notifications can reach you.")

    # -------- 7 Admin --------
    pdf.section_title("7. Admin Panel")
    pdf.body(
        "Administrators have extra tools for operating MySafeHouse safely at scale. "
        "Admin routes are available to users with the admin role."
    )
    pdf.sub_title("Admin home (/admin)")
    pdf.bullet("Quick links to admin tools.")
    pdf.bullet("System Settings - configure the location verification distance (metres).")
    pdf.bullet("Maintenance Mode - temporarily divert visitors to a coming-soon experience when enabled.")
    pdf.bullet("User Role Management - search users and promote/demote Admin vs Standard roles.")
    pdf.sub_title("NFC codes (/admin/nfc-codes)")
    pdf.bullet("Search and review NFC codes.")
    pdf.bullet("Assign an NFC code to a property or unassign it.")
    pdf.bullet("View linked URLs and QR representations used for physical tags.")
    pdf.sub_title("Access logs (/admin/access-logs)")
    pdf.bullet("Monitor visits, emergency requests, and access activity across properties.")
    pdf.bullet("Filter/search logs to investigate incidents or usage patterns.")
    pdf.bullet("Review summary stats such as total accesses and emergency requests.")
    pdf.sub_title("Domain management (/domains)")
    pdf.bullet("Maintain Allowed Domains - trusted email domains that can receive streamlined emergency access behaviour.")
    pdf.bullet("Maintain Blocked Domains - domains that should not be used for access.")
    pdf.bullet("Optionally set descriptions and expiry dates for domain rules.")
    pdf.callout(
        "Admin responsibility",
        "Changes to distance tolerance, maintenance mode, roles, NFC assignments, and domains "
        "affect live access behaviour. Review carefully before saving.",
    )

    # -------- 8 --------
    pdf.section_title("8. Quick reference - important pages")
    pdf.route("/", "Homepage property address search")
    pdf.route("/property/[id]", "Property details & access request")
    pdf.route("/access/accepted", "Requester approval / keysafe details")
    pdf.route("/access/denied", "Requester permission denied")
    pdf.route("/dashboard", "Owner dashboard & properties")
    pdf.route("/access-requests", "Owner request inbox")
    pdf.route("/payments", "Plans & credits")
    pdf.route("/profile", "Account profile")
    pdf.route("/admin", "Admin panel & system settings")
    pdf.route("/admin/nfc-codes", "NFC code assignment")
    pdf.route("/admin/access-logs", "Access monitoring")
    pdf.route("/domains", "Allowed / blocked email domains")
    pdf.route("/how-it-works", "Public product overview")
    pdf.route("/about", "About MySafeHouse")

    # -------- 9 --------
    pdf.section_title("9. Tips & troubleshooting")
    pdf.bullet("Location verification fails - enable location permissions, move closer to the property, or retry outdoors for a better GPS signal.")
    pdf.bullet("No matching property on search - the address may not be registered yet on MySafeHouse.")
    pdf.bullet("Owner not receiving alerts - confirm profile email/mobile and that emergency access is enabled on the property.")
    pdf.bullet("Need access details again - check the approval email; approved browser sessions also show details on Access Approved.")
    pdf.bullet("Denied requests - no keysafe details are shown in the browser; contact the owner if you believe this was a mistake.")
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 9.5)
    pdf.set_text_color(*MUTED)
    pdf.multi_cell(
        0,
        5,
        "This guide describes the MySafeHouse website experience as of October 2026. "
        "Labels and exact layouts may evolve as features are improved.",
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUTPUT))
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
