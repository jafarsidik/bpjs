frappe.pages['pencarian-data-sep'].on_page_load = function(wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Pencarian Data SEP',
		single_column: true
	});
	
	page.set_title('Pencarian Data SEP');

	$(frappe.render_template('pencarian_data_sep',{})).appendTo(page.body);
		

}
