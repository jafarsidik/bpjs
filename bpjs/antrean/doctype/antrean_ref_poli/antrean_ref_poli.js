// Copyright (c) 2023, jafar sidik and contributors
// For license information, please see license.txt
//import DataTable from "frappe-datatable";

frappe.ui.form.on('Antrean Ref Poli', {
	refresh: function(frm) {
		
		frappe.call('bpjs.bpjs.antrean.send', {
			service: 'ref/poli',
		 	method: 'GET',
		}).then(r => {
			let table = `<table class="table table-sm table-grid" id="jf"></table>`
			$(frm.fields_dict.daftar_poli.wrapper).html(table);
			frm.refresh_field('daftar_poli');
			let rows = [];
			$.each(r.message.response, function (index, value) {
				let arr = [value.kdsubspesialis,value.nmsubspesialis,value.kdpoli,value.nmpoli];
				rows.push(arr)
				
			})
			const options = {
				columns: [
					{ name: 'Kode Poli Subspesialis', width:170},
					{ name: 'Nama Poli Subspesialis', width: 400},
					{ name: 'Kode Poli', width: 90},
					{ name: 'Nama Poli', width: 220},
					],
				data: rows,
				layout: 'fixed', // fixed, fluid, ratio
				inlineFilters: true,
				dynamicRowHeight: false,
			}
			new DataTable('#jf', options);
		 	
		})
					
	// 			}else{
	// 				frappe.show_alert({
	// 					title: "Verifikasi Data",
	// 					indicator: 'red',
	// 					message:r.message.metaData.message,
	// 				});
	// 			}
	}
});
