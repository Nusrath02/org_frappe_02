frappe.ui.form.on("Org Employee", {
	refresh(frm) {
		if (!frm.is_new()) {
			frm.add_custom_button(__("View in Org Chart"), () => {
				frappe.set_route("org-chart");
			});
		}
	},
});
