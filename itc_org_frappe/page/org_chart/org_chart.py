import frappe


@frappe.whitelist()
def get_org_chart_data():
	employees = frappe.get_all(
		"Org Employee",
		fields=["name", "employee_name", "designation", "department", "branch", "reports_to", "node_color"],
		filters={"is_active": 1},
		order_by="employee_name asc",
	)
	return employees
