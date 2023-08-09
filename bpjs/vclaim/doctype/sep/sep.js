// Copyright (c) 2023, jafar sidik and contributors
// For license information, please see license.txt

frappe.ui.form.on('SEP', {
	refresh: function(frm) {
		if(frm.is_new()){
			frm.set_value('tglsep', frappe.datetime.nowdate())
			frm.add_custom_button('Ambil Data Rujukan', () => {
				//frappe.set_route('Form', frm.doc.reference_type, frm.doc.reference_name);
				let d = new frappe.ui.Dialog({
					title: 'Data Rujukan',
					fields: [
						{
							label: 'Tipe',
							fieldname: 'tipe',
							fieldtype: 'Select',
							options:["No BPJS","No Rujukan"]
						},
						{
							label: 'Nomor',
							fieldname: 'nobpjs',
							fieldtype: 'Data'
						},
					],
					size: 'small', // small, large, extra-large 
					primary_action_label: 'Submit',
					primary_action(values) {

						//Pencarian data rujukan Berdasarkan NO Kartu
						if(values.tipe == 'No BPJS'){
							//call Data Rujukan
							frappe.call('bpjs.api.sendVClaim', {
								service: 'Rujukan/Peserta/'+values.nobpjs,
								method: 'get',
							}).then(r => {
								if(r.message.metaData.code == 200){
									let data = r.message.response;
									//set Form Data dari rujukan
									frm.set_value('nokartu',data.rujukan.peserta.noKartu);
									frm.set_value('nomr',data.rujukan.peserta.mr.noMR);
									frm.set_value('notelp',data.rujukan.peserta.mr.noTelepon);
									frm.set_value('jnspelayanan',data.rujukan.pelayanan.kode);
									frm.set_value('diagawal',data.rujukan.diagnosa.kode+" | ("+data.rujukan.diagnosa.nama+")");
									frm.set_value('catatan',data.rujukan.keluhan);
									frm.set_value('klsrawathak',data.rujukan.peserta.hakKelas.kode);
									frm.set_value('asalrujukan',data.asalFaskes);
									frm.set_value('tglrujukan',data.rujukan.tglKunjungan);
									frm.set_value('norujukan',data.rujukan.noKunjungan);
									frm.set_value('ppkrujukan',data.rujukan.provPerujuk.kode+" | "+data.rujukan.provPerujuk.nama+"");
									frm.set_value('tujuan',data.rujukan.poliRujukan.kode+" | "+data.rujukan.poliRujukan.nama+"");
									
									//Cal Pencarian data dokter DPJP untuk pengisian DPJP Layan
									frappe.call('bpjs.api.sendVClaim', {
										service: 'referensi/dokter/pelayanan/'+data.rujukan.pelayanan.kode+'/tglPelayanan/'+frm.doc.tglsep+'/Spesialis/'+data.rujukan.poliRujukan.kode,
										method: 'get',
									}).then(r => {
										
										let list_dokter_dpjp = [];
										let field_ = frm.get_field('dpjplayan');
										list_dokter_dpjp.push({label: 'Pilih', value: ''});		

										$.each(r.message.response.list, function (index, value) {
											let jadwal_dokter_lists = value.kode+" "+value.nama;
											let gabungVal = value.kode+"|"+value.nama;
											list_dokter_dpjp.push({label: jadwal_dokter_lists, value: gabungVal});			
										});

										field_.df.options = list_dokter_dpjp;
										field_.set_options();
									});
								}else{
								
									frappe.show_alert({
										title: "Ambil Data Rujukan",
										indicator: 'green',
										message:r.message.metaData.message,
									});
								}

							});
						}else if(values.tipe == 'No Rujukan'){
							//call Data Rujukan
							frappe.call('bpjs.api.sendVClaim', {
								service: 'Rujukan/'+values.nobpjs,
								method: 'get',
							}).then(r => {
								if(r.message.metaData.code == 200){
									let data = r.message.response;
									//set Form Data dari rujukan
									frm.set_value('nokartu',data.rujukan.peserta.noKartu);
									frm.set_value('nomr',data.rujukan.peserta.mr.noMR);
									frm.set_value('notelp',data.rujukan.peserta.mr.noTelepon);
									frm.set_value('jnspelayanan',data.rujukan.pelayanan.kode);
									frm.set_value('diagawal',data.rujukan.diagnosa.kode+" | ("+data.rujukan.diagnosa.nama+")");
									frm.set_value('catatan',data.rujukan.keluhan);
									frm.set_value('klsrawathak',data.rujukan.peserta.hakKelas.kode);
									frm.set_value('asalrujukan',data.asalFaskes);
									frm.set_value('tglrujukan',data.rujukan.tglKunjungan);
									frm.set_value('norujukan',data.rujukan.noKunjungan);
									frm.set_value('ppkrujukan',data.rujukan.provPerujuk.kode+" | "+data.rujukan.provPerujuk.nama+"");
									frm.set_value('tujuan',data.rujukan.poliRujukan.kode+" | "+data.rujukan.poliRujukan.nama+"");
									
									//Cal Pencarian data dokter DPJP untuk pengisian DPJP Layan
									frappe.call('bpjs.api.sendVClaim', {
										service: 'referensi/dokter/pelayanan/'+data.rujukan.pelayanan.kode+'/tglPelayanan/'+frm.doc.tglsep+'/Spesialis/'+data.rujukan.poliRujukan.kode,
										method: 'get',
									}).then(r => {
										
										let list_dokter_dpjp = [];
										let field_ = frm.get_field('dpjplayan');
										list_dokter_dpjp.push({label: 'Pilih', value: ''});		

										$.each(r.message.response.list, function (index, value) {
											let jadwal_dokter_lists = value.kode+" "+value.nama;
											let gabungVal = value.kode+"|"+value.nama;
											list_dokter_dpjp.push({label: jadwal_dokter_lists, value: gabungVal});			
										});

										field_.df.options = list_dokter_dpjp;
										field_.set_options();
									});
								}else{
								
									frappe.show_alert({
										title: "Ambil Data Rujukan",
										indicator: 'green',
										message:r.message.metaData.message,
									});
								}
								

							});
						}
						d.hide();
						//Cal data Kontrol
						// frappe.call('bpjs.api.sendVClaim', {
						// 	service: '/RencanaKontrol/noSuratKontrol/'+values.nobpjs,
						// 	method: 'get',
						// }).then(r => {
						// 	let data = r.message.response;
						// 	//set Form Data dari Kontrol
						// 	frm.set_value('nosurat',data.noSuratKontrol);
							
						// 	console.log(r);
						// });
						
						
						
						
					}
				});
				d.show();
			})
		}

		//call referensi Provinsi
		frappe.call('bpjs.api.sendVClaim', {
			service: 'referensi/propinsi',
			method: 'GET',			
		}).then(r => {
			let arr = [];
			let field = frm.get_field('kdpropinsi');
			arr.push({label: 'Pilih', value: ''});		

			$.each(r.message.response.list, function (index, value) {
				let label_list = value.kode+" "+value.nama;
				//let gabungVal = value.kode+"|"+value.nama;
				arr.push({label: label_list, value: value.kode});			
			});

			field.df.options = arr;
			field.set_options();
		})
	},
	kdpropinsi:function(frm){
		frappe.call('bpjs.api.sendVClaim', {
			service: 'referensi/kabupaten/propinsi/'+frm.doc.kdpropinsi,
			method: 'GET',			
		}).then(r => {
			let arr = [];
			let field = frm.get_field('kdkabupaten');
			arr.push({label: 'Pilih', value: ''});		

			$.each(r.message.response.list, function (index, value) {
				let label_list = value.kode+" "+value.nama;
				//let gabungVal = value.kode+"|"+value.nama;
				arr.push({label: label_list, value: value.kode});			
			});

			field.df.options = arr;
			field.set_options();
		})
	},
	kdkabupaten:function(frm){
		frappe.call('bpjs.api.sendVClaim', {
			service: 'referensi/kecamatan/kabupaten/'+frm.doc.kdkabupaten,
			method: 'GET',			
		}).then(r => {
			let arr = [];
			let field = frm.get_field('kdkecamatan');
			arr.push({label: 'Pilih', value: ''});		

			$.each(r.message.response.list, function (index, value) {
				let label_list = value.kode+" "+value.nama;
				//let gabungVal = value.kode+"|"+value.nama;
				arr.push({label: label_list, value: value.kode});			
			});

			field.df.options = arr;
			field.set_options();
		})
	},
	validate:function(frm){

		let ppkrujukan = frm.doc.ppkrujukan.split("|")
		let diagawal = frm.doc.diagawal.split("|")
		let tujuan = frm.doc.tujuan.split("|")
		let dpjplayan = frm.doc.dpjplayan.split("|")
		let ppkpelayanan = frm.doc.ppkpelayanan.split("|")
		let payload = {
			"request":{
			   "t_sep":{
				  "noKartu":frm.doc.nokartu,
				  "tglSep":frm.doc.tglsep,
				  "ppkPelayanan":removeSpacesFromString(ppkpelayanan[0]),
				  "jnsPelayanan":frm.doc.jnspelayanan,
				  "klsRawat":{
					 "klsRawatHak":frm.doc.klsrawathak,
					 "klsRawatNaik":frm.doc.klsrawatnaik,
					 "pembiayaan":frm.doc.pembiayaan,
					 "penanggungJawab":frm.doc.penanggungjawab
				  },
				  "noMR":frm.doc.nomr,
				  "rujukan":{
					 "asalRujukan":frm.doc.asalrujukan,
					 "tglRujukan":frm.doc.tglrujukan,
					 "noRujukan":frm.doc.norujukan,
					 "ppkRujukan":removeSpacesFromString(ppkrujukan[0])
				  },
				  "catatan":frm.doc.catatan,
				  "diagAwal":removeSpacesFromString(diagawal[0]),
				  "poli":{
					 "tujuan":removeSpacesFromString(tujuan[0]),
					 "eksekutif":frm.doc.eksekutif
				  },
				  "cob":{
					 "cob":frm.doc.cob
				  },
				  "katarak":{
					 "katarak":frm.doc.katarak
				  },
				  "jaminan":{
					 "lakaLantas":frm.doc.lakalantas,
					 "noLP":frm.doc.nolp,
					 "penjamin":{
						"tglKejadian":frm.doc.tglkejadian,
						"keterangan":frm.doc.keterangan,
						"suplesi":{
						   "suplesi":frm.doc.suplesi,
						   "noSepSuplesi":frm.doc.nosepsuplesi,
						   "lokasiLaka":{
							  "kdPropinsi":frm.doc.kdpropinsi,
							  "kdKabupaten":frm.doc.kdkabupaten,
							  "kdKecamatan":frm.doc.kdkecamatan
						   }
						}
					 }
				  },
				  "tujuanKunj":frm.doc.tujuankunj,
				  "flagProcedure":frm.doc.flagprocedure,
				  "kdPenunjang":frm.doc.kdpenunjang,
				  "assesmentPel":frm.doc.assesmentpel,
				  "skdp":{
					 "noSurat":frm.doc.nosurat,
					 "kodeDPJP":frm.doc.kodedpjp
				  },
				  "dpjpLayan":removeSpacesFromString(dpjplayan[0]),
				  "noTelp":frm.doc.notelp,
				  "user":"System, By Cepjeff"
			   }
			}
		}

		frappe.call('bpjs.api.sendVClaim', {
		 	service: 'SEP/2.0/insert',
		 	method: 'POST',
		 	payload:payload
		}).then(r => {
			
			if(r.message.metaData.code == 200){	
				frm.set_value('sep',r.message.response.sep.noSep); 
			}else{
				frappe.show_alert({
					title: "SEP",
					indicator: 'green',
					message:r.message.metaData.message,
			   },15);
			}
			
			
			
		})
		
	}
});
function removeSpacesFromString(inputString) {
	return inputString.replace(/\s/g, '');
}