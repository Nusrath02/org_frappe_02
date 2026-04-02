from . import __version__ as app_version

app_name = "itc_org_frappe"
app_title = "Itc Org Frappe"
app_publisher = "ITChamps"
app_description = "ITC Org Frappe App"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = ""
app_license = "MIT"

# Whitelisted API methods
whitelisted_methods = {
    "itc_org_frappe.page.org_chart.org_chart.get_org_chart_data"
}
