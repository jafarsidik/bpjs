// Copyright (c) 2023, Muhamad Jafar Sidik and contributors
// For license information, please see license.txt

frappe.ui.form.on('Antrean BPJS',{
	refresh: function(frm) {
		if (frm.is_new()) {
			$(frm.fields_dict.jadwal_dokter.wrapper).html('');
			let kode_booking = generateUniqueBookingCode();
			frm.set_value('kode_booking',kode_booking);
		}else{
			frm.add_custom_button("Batal Antrian", function(){
				frappe.msgprint(frm.doc.email);
			}, "Aksi Antrean");
			frm.set_df_property('tanggalperiksa', 'read_only', 1)
			frm.set_df_property('no_bpjs', 'read_only', 1)
			frm.set_df_property('no_bpjs', 'read_only', 1)
			frm.set_df_property('jadwal_dokter', 'hidden', 1)
			//call GetTaskList
			frm.refresh_field('task_list');	
			frm.set_value('task_list','');	
			let payload = {'kodebooking':frm.doc.kode_booking}
			frappe.call('bpjs.bpjs.antrean.send', {
				service: 'antrean/getlisttask',
				method: 'POST',
				payload:payload
			}).then(r => {
				$.each(r.message.response, function (index, value) {
					frm.add_child('task_list', {
						kode_booking:frm.doc.kode_booking,
						task_id: value.taskid,
						task_name:value.taskname,
						waktu: value.waktu,
						waktu_rs: value.wakturs,
					});
					frm.refresh_field('task_list');	
				});
				console.log(r);
				
			});
		}
	},
	task_id:function(frm){
		if(frm.doc.task_id ==1){
			frm.set_value('task_name',"mulai waktu tunggu admisi");
		}
		else if(frm.doc.task_id ==2){
			frm.set_value('task_name',"akhir waktu tunggu admisi/mulai waktu layan admisi");
		}
		else if(frm.doc.task_id ==3){
			frm.set_value('task_name',"akhir waktu layan admisi/mulai waktu tunggu poli");
		}
		else if(frm.doc.task_id ==4){
			frm.set_value('task_name',"akhir waktu tunggu poli/mulai waktu layan poli");
		}
		else if(frm.doc.task_id ==5){
			frm.set_df_property('is_farmasi', 'hidden', 0)
			frm.set_value('task_name',"akhir waktu layan poli/mulai waktu tunggu farmasi");
		}
		else if(frm.doc.task_id ==6){
			frm.set_value('task_name',"akhir waktu tunggu farmasi/mulai waktu layan farmasi membuat obat");
		}
		else if(frm.doc.task_id ==7){
			frm.set_value('task_name',"akhir waktu obat selesai dibuat");
		}
		else if(frm.doc.task_id ==99){
			frm.set_value('task_name',"tidak hadir/batal");
		}
	},
	before_save:function(frm){
		
		if (frm.is_new()) {
			//let currentDate = new Date().toJSON().slice(0, 10);
			let currentDate = Date.now();
			let payload = {
				"kodebooking": frm.doc.kode_booking,
				"jenispasien": "JKN",
				"nomorkartu": frm.doc.no_bpjs,
				"nik": frm.doc.nik,
				"nohp": frm.doc.no_hp,
				"kodepoli": frm.doc.kode_poli,
				"namapoli": frm.doc.nama_poli,
				"pasienbaru": 0,
				"norm": frm.doc.no_rm,
				"tanggalperiksa": frm.doc.tanggalperiksa,
				"kodedokter": frm.doc.kodedokter,
				"namadokter": frm.doc.namadokter,
				"jampraktek": frm.doc.jampraktek,
				"jeniskunjungan": frm.doc.jeniskunjungan,
				"nomorreferensi": frm.doc.nomorreferensi,
				"nomorantrean": frm.doc.noantrian,
				"angkaantrean": frm.doc.angka_antrian,
				"estimasidilayani": currentDate,
				"sisakuotajkn": frm.doc.kapasitaspasien,
				"kuotajkn": frm.doc.kapasitaspasien,
				"sisakuotanonjkn": 0,
				"kuotanonjkn": 0,
				"keterangan": "Peserta harap 30 menit lebih awal guna pencatatan administrasi."
			}
			frappe.call({
				method: 'bpjs.bpjs.antrean.send',
				args: {
					service: 'antrean/add',
					method: 'POST',
					payload:payload
				},
				callback: (r) => {
					console.log(r);
				},
				error: (r) => {
					frappe.show_alert(r.message.metaData.message);
				}
			})
		}else{
			const currentDate =  Date.now();
			let payload={
				"kodebooking": frm.doc.kode_booking,
				"taskid": frm.doc.task_id,
				"waktu": currentDate,
				//"jenisresep": "Tidak ada/Racikan/Non racikan" ---> khusus yang sudah implementasi antrean farmasi
			}
			frappe.call('bpjs.bpjs.antrean.send', {
				service: 'antrean/updatewaktu',
				method: 'POST',
				payload:payload
			}).then(r => {
				frappe.show_alert({
					title: "Update Task ID",
					indicator: 'green',
					message:r.message.metaData.message,
				});
			});
		}
	},
	
	tanggalperiksa:function(frm){
		frm.set_value('kodedokter','');
		frm.set_value('namadokter','');
		frm.set_value('jampraktek','');
		frm.set_value('kapasitaspasien','');
		frm.set_value('noantrian','');
		frm.set_value('angka_antrian','');

		frappe.call({
			method: 'bpjs.bpjs.vclaim.send',
			args: {
				service: 'Rujukan/Peserta/'+frm.doc.no_bpjs,
				method: 'get',
			},
		 	callback: (r) => {
		 	
				if(r.message.metaData.code == "200"){
					frm.set_value('nik',r.message.response.rujukan.peserta.nik);
					frm.set_value('no_hp',removeSpacesFromString(r.message.response.rujukan.peserta.mr.noTelepon));
					frm.set_value('kode_poli',r.message.response.rujukan.poliRujukan.kode);
					frm.set_value('nama_poli',r.message.response.rujukan.poliRujukan.nama);
					frm.set_value('no_rm',r.message.response.rujukan.peserta.mr.noMR);
					frm.set_value('jeniskunjungan',r.message.response.rujukan.pelayanan.kode);
					frm.set_value('nomorreferensi',r.message.response.rujukan.noKunjungan);
					//-------------------------------------------------------------
					//call jadwal
					$(frm.fields_dict.jadwal_dokter.wrapper).html('');
					frappe.call('bpjs.bpjs.antrean.send', {
						service: 'jadwaldokter/kodepoli/'+frm.doc.kode_poli+'/tanggal/'+frm.doc.tanggalperiksa,
						method: 'GET',
					}).then(r => {
						let html_button = `<ul class="list-group">`;
						$.each(r.message.response, function (index, value) {
							html_button += `<button
							data-namadokter="`+value.namadokter+`"
							data-kodedokter="`+value.kodedokter+`"
							data-jampraktek="`+value.jadwal+`"
							data-kapasitaspasien="`+value.kapasitaspasien+`"
							class="btn btn-xs btn-primary"
							data-fieldtype="Button"
							data-fieldname="cek_rujukan">
							`+value.namadokter+` `+value.jadwal+`
							</button>&nbsp;</br>`;
						});
						html_button += `</ul>`;
						$(frm.fields_dict.jadwal_dokter.wrapper).on('click', 'button', function() {
							let $btn = $(this);
							let namadokter = $btn.attr('data-namadokter');
							let kodedokter = $btn.attr('data-kodedokter');
							let jampraktek = $btn.attr('data-jampraktek');
							let kapasitaspasien = $btn.attr('data-kapasitaspasien');
							frm.set_value('kodedokter',kodedokter);
							frm.set_value('namadokter',namadokter);
							frm.set_value('jampraktek',jampraktek);
							frm.set_value('kapasitaspasien',kapasitaspasien);
							//----Call No Antrian
							frappe.db.get_list('Antrean BPJS',{
								filters: {
									tanggalperiksa: frm.doc.tanggalperiksa,
									kodedokter:kodedokter,
									jampraktek:jampraktek
								}
							})
							.then(count => {
								let x = count.length;
								x += 1;
								frm.set_value('noantrian',"B-"+x);
								frm.set_value('angka_antrian',x);
								
							})
							
							
						});
						// frappe.show_alert({
						// 	title: "Notifikasi",
						// 	indicator: 'green',
						// 	message:"Anda Memilih Dokter"+namadokter+' '+jampraktek,
						// });
						$(frm.fields_dict.jadwal_dokter.wrapper).html(html_button);
						frm.refresh_field('jadwal_dokter');
						
						frappe.show_alert({
							title: "Verifikasi Data",
							indicator: 'green',
							message:r.message.metaData.message,
						});
					})
					
				}else{
					frappe.show_alert({
						title: "Verifikasi Data",
						indicator: 'red',
						message:r.message.metaData.message,
					});
				}
		 	},
		 	error: (r) => {
		 		// on error
		 		frappe.show_alert({
		 			title: "Verifikasi Data",
		 			indicator: 'red',
		 			message:r.message.metaData.message,
		 		});
		 		frappe.show_alert(r.message);
		 	}
		});
		//-------------------------------------------
		
	},
	
});


frappe.ui.form.on('Task List Detail','hit_task_id', function(frm, cdt, cdn){
    // cdt is Child DocType name i.e Quotation Item
    // cdn is the row name for e.g bbfcb8da6a
	let items = locals[cdt][cdn];
})
function generateUniqueBookingCode() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let bookingCode = '';
  
	for (let i = 0; i < 6; i++) {
	  const randomIndex = Math.floor(Math.random() * characters.length);
	  bookingCode += characters[randomIndex];
	}
  
	return bookingCode;
  }
function removeSpacesFromString(inputString) {
	return inputString.replace(/\s/g, '');
}
  