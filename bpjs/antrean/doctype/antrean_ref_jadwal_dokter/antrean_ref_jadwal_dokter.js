// Copyright (c) 2023, jafar sidik and contributors
// For license information, please see license.txt

frappe.ui.form.on('Antrean Ref Jadwal Dokter', {
	refresh: function(frm) {
		frm.disable_save();
		var select = frm.get_field('poli'),
        val = frm.doc.poli_tujuan || null,
        // The select list options with the default first option
        list = [];
		
		// A function to add the list of options to the select field 
        var setOptions = function(optList) {
            // Adding the list of process names to the select field
            select.df.options = list;
            // Selecting the old value of setting_name if there is any
            select.set_options(val);
        };

		//Call Reff Poli
		frappe.call({
			method: 'bpjs.api.sendAntrean',
			args: {
				service: 'ref/poli',
				method: 'GET',
			},
			callback: (r) => {
				$.each(r.message.response, function (index, value) {
					let poli_lists = value.nmpoli+" ("+value.kdsubspesialis+") "+value.nmsubspesialis;
					list.push({label: poli_lists, value: value.kdsubspesialis});			
				});
				setOptions(list);
			},
			error: (r) => {
				frappe.show_alert(r.message.metaData.message);
			}
		})
		let current = new Date();
		frm.set_value('tanggal',frappe.datetime.nowdate())
	},
	poli: function(frm){
		frappe.call('bpjs.api.sendAntrean', {
			service: 'jadwaldokter/kodepoli/'+frm.doc.poli+'/tanggal/'+frm.doc.tanggal,
		 	method: 'GET',
		}).then(r => {
			
			let table = `<div id="t"><table class="table table-sm table-grid" id="jf"></table>Status Libur : 0=Ada, 1=Libur </div>`
			$(frm.fields_dict.list.wrapper).html(table);
			frm.refresh_field('list');
			let rows = [];
			$.each(r.message.response, function (index, value) {
				let arr = [value.kodepoli,value.kodesubspesialis,value.kodedokter,value.namadokter,value.namahari,value.jadwal,value.kapasitaspasien,value.libur];
				rows.push(arr)
			})
			const options = {
				
				columns: [
					{ name: 'Kode Poli',editable: false},
					{ name: 'Kode Subspesialis Poli',editable: false},
					{ name: 'Kode Dokter',editable: false},
					{ name: 'Nama Dokter',editable: false,},
					{ name: 'Hari',editable: false,},
					{ name: 'Jadwal',editable: false,},
					{ name: 'Kapasitas Pasien',editable: false,},
					{ name: 'Status Libur',editable: false,},
					//{ name: 'Status Libur',editable: false,format:value=>`<buton class='btn btn-default btn-xs'>Upadte</button>`},
					
				],
				data: rows,
				//layout: 'fixed', // fixed, fluid, ratio
				inlineFilters: true,
				//dynamicRowHeight: false,
				checkboxColumn:true,
				//checkedRowStatus:true,
				events: {
					onCheckRow(row) {
						
						//console.log(row);
						// your code
						let d = new frappe.ui.Dialog({
							title: 'Update Jadwal Dokter',
							fields: [
								{
									label: 'Kode Poli',
									fieldname: 'kodepoli',
									fieldtype: 'Read Only',
									default:row[2].content
								},
								{
									label: 'Kode Subspesialis',
									fieldname: 'kodesubspesialis',
									fieldtype: 'Read Only',
									default:row[3].content
								},
								{
									label: 'Kode Dokter',
									fieldname: 'kodedokter',
									fieldtype: 'Read Only',
									default:row[4].content
								},
								{
									label: 'Hari',
									fieldname: 'hari',
									fieldtype: 'Select',
									options: [
										'SENIN',
										'SELASA',
										'RABU',
										'KAMIS',
										'JUMAT',
										'SABTU',
										'MINGGU',
										'HARI LIBUR NASIONAL',
									],
									default:row[5].content
								},
								{
									label: 'Jam Buka',
									fieldname: 'buka',
									fieldtype: 'Time'
								},
								{
									label: 'Jam Tutup',
									fieldname: 'tutup',
									fieldtype: 'Time'
								}
							],
							size: 'small', // small, large, extra-large 
							primary_action_label: 'Submit',
							primary_action(values) {
								console.log(values);
								d.hide();
								//datatable.refresh(rows);
							}
						});
						
						d.show();
						
						
					}
				}
			}
			const datatable = new DataTable('#jf', options);
			datatable.refresh(data);
			
		})
	},
	tanggal: function(frm){
		frappe.call('bpjs.api.sendAntrean', {
			service: 'jadwaldokter/kodepoli/'+frm.doc.poli+'/tanggal/'+frm.doc.tanggal,
		 	method: 'GET',
		}).then(r => {
			
			let table = `<div id="t"><table class="table table-sm table-grid" id="jf"></table>Status Libur : 0=Ada, 1=Libur </div>`
			$(frm.fields_dict.list.wrapper).html(table);
			frm.refresh_field('list');
			let rows = [];
			$.each(r.message.response, function (index, value) {
				let arr = [value.kodepoli,value.kodesubspesialis,value.kodedokter,value.namadokter,value.namahari,value.jadwal,value.kapasitaspasien,value.libur];
				rows.push(arr)
			})
			const options = {
				
				columns: [
					{ name: 'Kode Poli',editable: false},
					{ name: 'Kode Subspesialis Poli',editable: false},
					{ name: 'Kode Dokter',editable: false},
					{ name: 'Nama Dokter',editable: false,},
					{ name: 'Hari',editable: false,},
					{ name: 'Jadwal',editable: false,},
					{ name: 'Kapasitas Pasien',editable: false,},
					{ name: 'Status Libur',editable: false,},
					//{ name: 'Status Libur',editable: false,format:value=>`<buton class='btn btn-default btn-xs'>Upadte</button>`},
					
				],
				data: rows,
				//layout: 'fixed', // fixed, fluid, ratio
				inlineFilters: true,
				//dynamicRowHeight: false,
				checkboxColumn:true,
				//checkedRowStatus:true,
				events: {
					onCheckRow(row) {
						
						//console.log(row);
						// your code
						let d = new frappe.ui.Dialog({
							title: 'Update Jadwal Dokter',
							fields: [
								{
									label: 'Kode Poli',
									fieldname: 'kodepoli',
									fieldtype: 'Read Only',
									default:row[2].content
								},
								{
									label: 'Kode Subspesialis',
									fieldname: 'kodesubspesialis',
									fieldtype: 'Read Only',
									default:row[3].content
								},
								{
									label: 'Kode Dokter',
									fieldname: 'kodedokter',
									fieldtype: 'Read Only',
									default:row[4].content
								},
								{
									label: 'Hari',
									fieldname: 'hari',
									fieldtype: 'Select',
									options: [
										'SENIN',
										'SELASA',
										'RABU',
										'KAMIS',
										'JUMAT',
										'SABTU',
										'MINGGU',
										'HARI LIBUR NASIONAL',
									],
									default:row[5].content
								},
								{
									label: 'Jam Buka',
									fieldname: 'buka',
									fieldtype: 'Time'
								},
								{
									label: 'Jam Tutup',
									fieldname: 'tutup',
									fieldtype: 'Time'
								}
							],
							size: 'small', // small, large, extra-large 
							primary_action_label: 'Submit',
							primary_action(values) {
								console.log(values);
								d.hide();
								//datatable.refresh(rows);
							}
						});
						
						d.show();
						
						
					}
				}
			}
			const datatable = new DataTable('#jf', options);
			datatable.refresh(data);
			
		})
	},
	
});
