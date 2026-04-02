frappe.pages["org-chart"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: "Org Chart",
		single_column: true,
	});

	const page = wrapper.page;

	// Add a refresh button
	page.add_inner_button(__("Refresh"), () => loadOrgChart());

	// Add "New Employee" button
	page.set_primary_action(__("New Employee"), () => {
		frappe.new_doc("Org Employee");
	});

	// Inject CSS
	injectStyles();

	// Build the page container
	$(wrapper).find(".page-content").html(`
		<div id="org-chart-wrapper">
			<div id="org-chart-loading" class="org-loading">
				<div class="loading-spinner"></div>
				<p>Loading org chart...</p>
			</div>
			<div id="org-chart-empty" class="org-empty" style="display:none;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
					<circle cx="32" cy="20" r="10" fill="#d1d5db"/>
					<rect x="12" y="38" width="40" height="6" rx="3" fill="#d1d5db"/>
				</svg>
				<p>No employees found.</p>
				<a class="btn btn-primary btn-sm" onclick="frappe.new_doc('Org Employee')">Add First Employee</a>
			</div>
			<div id="org-chart-container" style="display:none;"></div>
		</div>
	`);

	loadOrgChart();

	function loadOrgChart() {
		$("#org-chart-loading").show();
		$("#org-chart-container").hide();
		$("#org-chart-empty").hide();

		frappe.call({
			method: "itc_org_frappe.page.org_chart.org_chart.get_org_chart_data",
			callback: function (r) {
				$("#org-chart-loading").hide();
				if (!r.message || r.message.length === 0) {
					$("#org-chart-empty").show();
					return;
				}
				const tree = buildTree(r.message);
				const html = renderTree(tree);
				$("#org-chart-container").html(html).show();

				// Click on node → open form
				$("#org-chart-container").on("click", ".org-node", function () {
					const name = $(this).data("name");
					if (name) frappe.set_route("Form", "Org Employee", name);
				});
			},
		});
	}
};

// ---------------------------------------------------------------------------
// Tree builder
// ---------------------------------------------------------------------------
function buildTree(employees) {
	const map = {};
	const roots = [];

	employees.forEach((emp) => {
		map[emp.name] = Object.assign({}, emp, { children: [] });
	});

	employees.forEach((emp) => {
		if (emp.reports_to && map[emp.reports_to]) {
			map[emp.reports_to].children.push(map[emp.name]);
		} else {
			roots.push(map[emp.name]);
		}
	});

	return roots;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
const COLOR_MAP = {
	Purple: { border: "#9b59b6", bg: "#f5eef8", text: "#6c3483" },
	Green: { border: "#27ae60", bg: "#eafaf1", text: "#1e8449" },
	Red: { border: "#e74c3c", bg: "#fdedec", text: "#c0392b" },
	Blue: { border: "#3498db", bg: "#ebf5fb", text: "#1a5276" },
	Orange: { border: "#e67e22", bg: "#fef9e7", text: "#d35400" },
	Teal: { border: "#16a085", bg: "#e8f8f5", text: "#0e6655" },
};
const DEFAULT_COLOR = COLOR_MAP["Blue"];

function getColor(nodeColor) {
	return COLOR_MAP[nodeColor] || DEFAULT_COLOR;
}

function renderNode(node) {
	const c = getColor(node.node_color);
	const subtitleParts = [node.designation, node.department, node.branch].filter(Boolean);
	const subtitle = subtitleParts.join(" · ");

	const nodeBox = `
		<div class="org-node"
			data-name="${frappe.utils.escape_html(node.name)}"
			style="border-color:${c.border}; background:${c.bg};">
			<div class="org-node-name" style="color:${c.text};">
				${frappe.utils.escape_html(node.employee_name)}
			</div>
			${subtitle ? `<div class="org-node-subtitle">${frappe.utils.escape_html(subtitle)}</div>` : ""}
		</div>
	`;

	if (!node.children.length) {
		return `<li>${nodeBox}</li>`;
	}

	return `
		<li>
			${nodeBox}
			<ul>
				${node.children.map(renderNode).join("")}
			</ul>
		</li>
	`;
}

function renderTree(roots) {
	if (!roots.length) return "";

	return `
		<div class="org-tree-scroll">
			<div class="org-tree">
				<ul>
					${roots.map(renderNode).join("")}
				</ul>
			</div>
		</div>
	`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
function injectStyles() {
	if (document.getElementById("org-chart-styles")) return;

	const css = `
		#org-chart-wrapper {
			padding: 24px;
			min-height: 200px;
		}

		.org-loading, .org-empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 60px 20px;
			color: #6b7280;
			gap: 12px;
		}

		.loading-spinner {
			width: 36px;
			height: 36px;
			border: 3px solid #e5e7eb;
			border-top-color: #3b82f6;
			border-radius: 50%;
			animation: org-spin 0.7s linear infinite;
		}

		@keyframes org-spin {
			to { transform: rotate(360deg); }
		}

		/* ---- Scroll container ---- */
		.org-tree-scroll {
			overflow-x: auto;
			padding-bottom: 24px;
		}

		/* ---- Tree layout ---- */
		.org-tree {
			display: inline-block;
			min-width: 100%;
		}

		.org-tree,
		.org-tree ul {
			margin: 0;
			padding: 0;
			list-style: none;
		}

		.org-tree ul {
			display: flex;
			justify-content: center;
			padding-top: 20px;
			position: relative;
		}

		/* Vertical stem down from parent node */
		.org-tree ul::before {
			content: '';
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 1px;
			height: 20px;
			background: #d1d5db;
		}

		.org-tree ul li {
			position: relative;
			padding: 0 12px;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		/* Horizontal line between siblings */
		.org-tree ul li::before,
		.org-tree ul li::after {
			content: '';
			position: absolute;
			top: 0;
			width: 50%;
			height: 20px;
			border-top: 1px solid #d1d5db;
		}

		.org-tree ul li::before {
			left: 0;
		}

		.org-tree ul li::after {
			right: 0;
		}

		/* First and last child — hide outer half of horizontal line */
		.org-tree ul li:first-child::before,
		.org-tree ul li:last-child::after {
			border: none;
		}

		/* Single child — hide horizontal lines entirely */
		.org-tree ul li:only-child::before,
		.org-tree ul li:only-child::after {
			display: none;
		}

		/* Vertical stem above each node (connects to horizontal bar) */
		.org-tree ul li > .org-node::before {
			content: '';
			display: block;
			margin: 0 auto;
			width: 1px;
			height: 20px;
			background: #d1d5db;
		}

		/* ---- Node card ---- */
		.org-node {
			cursor: pointer;
			border: 2px solid #3498db;
			border-radius: 10px;
			background: #ebf5fb;
			padding: 10px 16px;
			min-width: 140px;
			max-width: 180px;
			text-align: center;
			transition: box-shadow 0.15s, transform 0.15s;
			position: relative;
		}

		.org-node:hover {
			box-shadow: 0 4px 16px rgba(0,0,0,0.12);
			transform: translateY(-2px);
		}

		.org-node-name {
			font-weight: 700;
			font-size: 13px;
			line-height: 1.3;
			margin-bottom: 4px;
		}

		.org-node-subtitle {
			font-size: 11px;
			color: #4b5563;
			line-height: 1.4;
		}
	`;

	const style = document.createElement("style");
	style.id = "org-chart-styles";
	style.textContent = css;
	document.head.appendChild(style);
}
