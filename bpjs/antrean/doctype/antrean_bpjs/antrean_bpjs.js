// Copyright (c) 2023, Muhamad Jafar Sidik and contributors
// For license information, please see license.txt

frappe.ui.form.on('Antrean BPJS',{
	refresh: function(frm) {
		if (frm.is_new()) {
			
			let kode_booking = generateUniqueBookingCode();
			frm.set_value('kode_booking',kode_booking);
			
			frm.set_df_property('task_id', 'hidden', 1)
			frm.set_df_property('no_bpjs', 'hidden', 1)
			frm.set_df_property('nik', 'hidden', 1)
			frm.set_df_property('no_hp', 'hidden', 1)
			frm.set_df_property('jeniskunjungan', 'hidden', 1)
			frm.set_df_property('no_rm', 'hidden', 1)
			frm.set_df_property('pasienbaru', 'hidden', 1)
			
		}else{
			frm.add_custom_button("Batal Antrian", function(){
				frappe.msgprint(frm.doc.email);
			}, "Aksi Antrean");
			frm.set_df_property('tanggalperiksa', 'read_only', 1)
			frm.set_df_property('no_bpjs', 'read_only', 1)
			frm.set_df_property('jadwal_dokter', 'hidden', 1)
			frm.set_df_property('task_id', 'hidden', 0)
			frm.set_df_property('no_rm', 'hidden', 0)
			frm.set_df_property('pasienbaru', 'hidden', 0)
			//call GetTaskList
			frm.refresh_field('task_list');	
			frm.set_value('task_list','');	
			let payload = {'kodebooking':frm.doc.kode_booking}
			frappe.call('bpjs.api.sendAntrean', {
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
			let data_qr_code = ` <img alt='QRCode Antrean BPJS' src='https://barcode.tec-it.com/barcode.ashx?data=`+frm.doc.kode_booking+`&code=QRCode&eclevel=L'/>`
			$(frm.fields_dict.qrcode.wrapper).html(data_qr_code);
		}
	},
	jenis_pasien:function(frm){
		frm.set_df_property('jeniskunjungan', 'hidden', 0)
		frm.set_df_property('nik', 'hidden', 0)
		frm.set_df_property('no_hp', 'hidden', 0)
		frm.set_df_property('no_rm', 'hidden', 0)
		frm.set_df_property('pasienbaru', 'hidden', 0)
		if(frm.doc.jenis_pasien == "JKN"){
			frm.set_df_property('no_bpjs', 'hidden', 0)
			
		}else if(frm.doc.jenis_pasien == "NON JKN"){
			frm.set_df_property('no_bpjs', 'hidden', 1)
			
			//Call Reff Poli
			frappe.call('bpjs.api.sendAntrean', {
				service: 'ref/poli',
				method: 'GET',	
			}).then(r => {
				let list_poli = [];
				let field_poli = frm.get_field('kode_poli');
				list_poli.push({label: 'Pilih', value: ''});		

				$.each(r.message.response, function (index, value) {
					let label_poli = value.nmpoli+" ("+value.kdsubspesialis+") "+value.nmsubspesialis;
					list_poli.push({label: label_poli, value: value.kdsubspesialis});			
				});
				console.log(list_poli);
				field_poli.df.options = list_poli;
				field_poli.set_options();
			});

		}else{
			frm.set_df_property('no_bpjs', 'hidden', 1)
			// frm.set_df_property('nik', 'hidden', 1)
		}
	},
	kode_poli: function(frm){
		frappe.call('bpjs.api.sendAntrean', {
			service: 'jadwaldokter/kodepoli/'+frm.doc.kode_poli+'/tanggal/'+frm.doc.tanggalperiksa,
		 	method: 'GET',
		}).then(r => {
			let list_jadwal = [];
			let field_jadwal = frm.get_field('jadwal_dokter');
			list_jadwal.push({label: 'Pilih', value: ''});		

			$.each(r.message.response, function (index, value) {
				let jadwal_dokter_lists = value.namadokter+" "+value.jadwal+" ";
				let gabungVal = value.kodedokter+"|"+value.namadokter+"|"+value.jadwal+"|"+value.hari+"|"+value.kapasitaspasien+"|"+value.libur;
				list_jadwal.push({label: jadwal_dokter_lists, value: gabungVal});			
			});

			field_jadwal.df.options = list_jadwal;
			field_jadwal.set_options();
		})
		
	},
	tanggalperiksa:function(frm){
		if(frm.doc.jenis_pasien =="JKN"){
			//call Data Rujukan VCLAIM
			frappe.call('bpjs.api.sendVClaim', {
				service: 'Rujukan/Peserta/'+frm.doc.no_bpjs,
				method: 'GET',
			}).then(r => {
				if(r.message.metaData.code !== "200"){
					frappe.show_alert({
						title: "Verifikasi Data",
						indicator: 'red',
						message:r.message.metaData.message,
					});
				}else{
					frm.set_value('nik',r.message.response.rujukan.peserta.nik);
		 			frm.set_value('no_hp',removeSpacesFromString(r.message.response.rujukan.peserta.mr.noTelepon));
				
					
					let poli = [];
					let field_poli = frm.get_field('kode_poli');
					let label_poli = r.message.response.rujukan.poliRujukan.nama+" ("+r.message.response.rujukan.poliRujukan.kode+") ";
					poli.push({label: label_poli, value: r.message.response.rujukan.poliRujukan.kode});		
					field_poli.df.options = poli;
					field_poli.set_options();
		 			
					frm.set_value('kode_poli',r.message.response.rujukan.poliRujukan.kode);
					frm.set_value('nama_poli',r.message.response.rujukan.poliRujukan.nama);
		 			frm.set_value('no_rm',r.message.response.rujukan.peserta.mr.noMR);
		 			frm.set_value('jeniskunjungan',r.message.response.rujukan.pelayanan.kode);
		 			
				}
				
			})
		}else{
			frm.set_value('nomorreferensi','');
		}
		frappe.call('bpjs.api.sendAntrean', {
			service: 'jadwaldokter/kodepoli/'+frm.doc.kode_poli+'/tanggal/'+frm.doc.tanggalperiksa,
			 method: 'get',
		}).then(r => {
			let list_jadwal = [];
			let field_jadwal = frm.get_field('jadwal_dokter');
			list_jadwal.push({label: 'Pilih', value: ''});		

			$.each(r.message.response, function (index, value) {
				let jadwal_dokter_lists = value.namadokter+" "+value.jadwal+" ";
				let gabungVal = value.kodedokter+"|"+value.namadokter+"|"+value.jadwal+"|"+value.hari+"|"+value.kapasitaspasien+"|"+value.libur;
				
				list_jadwal.push({label: jadwal_dokter_lists, value: gabungVal});			
			});

			field_jadwal.df.options = list_jadwal;
			field_jadwal.set_options();
		})
	},
	jadwal_dokter:function(frm){
		let val = frm.doc.jadwal_dokter
		x = val.split("|")
		
		frm.set_value('kodedokter',x[0]);
		frm.set_value('namadokter',x[1]);
		frm.set_value('jampraktek',x[2]);
		frm.set_value('kapasitaspasien',x[4]);
		frm.set_value('nama_poli',frm.doc.kode_poli);
		frappe.db.get_list('Antrean BPJS',{
			filters: {
				tanggalperiksa: frm.doc.tanggalperiksa,
				kodedokter:x[0],
				jampraktek:x[2]
			}
		}).then(count => {
			let x = count.length;
			x += 1;
			frm.set_value('noantrian',"B-"+x);
			frm.set_value('angka_antrian',x);
		})
	},
	validate:function(frm){
		let x_return = false;
		if (frm.is_new()) {
			//call api pasien
			
			let currentDate = Date.now();
			let payload = {
				"kodebooking": frm.doc.kode_booking,
				"jenispasien": frm.doc.jenis_pasien,
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
				"sisakuotanonjkn": frm.doc.kapasitaspasien,
				"kuotanonjkn": frm.doc.kapasitaspasien,
				"keterangan": "Peserta harap 30 menit lebih awal guna pencatatan administrasi."
			}
			frappe.call('bpjs.api.sendAntrean', {
				service: 'antrean/add',
				method: 'POST',
					payload:payload
			}).then(r => {
				if(r.message.metaData.code == "200"){
					frappe.show_alert({
						title: "Create Antrean BPJS",
						indicator: 'green',
						message:r.message.metaData.message,
					});
					x_return += true;
				}else{
					frappe.show_alert({
						title: "Create Antrean BPJS",
						indicator: 'red',
						message:r.message.metaData.message,
					});
					x_return += false;
				}
			})
			return x_return
		}else{
			const currentDate =  Date.now();
			let payload={
				"kodebooking": frm.doc.kode_booking,
				"taskid": frm.doc.task_id,
				"waktu": currentDate,
				//"jenisresep": "Tidak ada/Racikan/Non racikan" ---> khusus yang sudah implementasi antrean farmasi
			}
			frappe.call('bpjs.api.sendAntrean', {
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
	task_id:function(frm){
		if(frm.doc.task_id == 1){
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
  