// Copyright (c) 2023, jafar sidik and contributors
// For license information, please see license.txt

frappe.ui.form.on('Antrean Ref Dokter', {
	refresh: function(frm) {
		frappe.call('bpjs.api.sendAntrean', {
			service: 'ref/dokter',
		 	method: 'GET',
		}).then(r => {
			let table = `<table class="table table-sm table-grid" id="jf"></table>`
			$(frm.fields_dict.daftar_dokter.wrapper).html(table);
			frm.refresh_field('daftar_dokter');
			let rows = [];
			$.each(r.message.response, function (index, value) {
				let arr = [value.kodedokter,value.namadokter];
				rows.push(arr)
				
			})
			const options = {
				columns: [
					{ name: 'Kode Dokter', width:150},
					{ name: 'Nama Dokter', width:500}
					],
				data: rows,
				//layout: 'fixed', // fixed, fluid, ratio
				inlineFilters: true,
				//dynamicRowHeight: false,
			}
			new DataTable('#jf', options);
		 	
		})
	}
});
