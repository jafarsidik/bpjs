frappe.ready(function(frm) {
	// bind events here
	
	//Set Kode Booking
	let kode_booking = generateUniqueBookingCode();
	frappe.web_form.set_value('kode_booking',kode_booking);
	//set Variable Hidden
	frappe.web_form.set_value('tanggalperiksa',frappe.datetime.nowdate());
	

	//validasi NOBPJS
	frappe.web_form.on('no_bpjs',(field, value)=>{
		
		//call Data Rujukan Vclaim Berdasarkan no bpjs
		frappe.call('bpjs.api.sendVClaim', {
			service: 'Rujukan/Peserta/'+value,
			method: 'get',
		}).then(r => {
			if(r.message.metaData.code == "200"){
				frappe.web_form.set_value('jenis_pasien','JKN');
				frappe.web_form.set_value('nik',r.message.response.rujukan.peserta.nik);
				frappe.web_form.set_value('no_hp',removeSpacesFromString(r.message.response.rujukan.peserta.mr.noTelepon));
				frappe.web_form.set_value('kode_poli',r.message.response.rujukan.poliRujukan.kode);
				frappe.web_form.set_value('nama_poli',r.message.response.rujukan.poliRujukan.nama);
				frappe.web_form.set_value('no_rm',r.message.response.rujukan.peserta.mr.noMR);
				frappe.web_form.set_value('jeniskunjungan',r.message.response.rujukan.pelayanan.kode);
				frappe.web_form.set_value('nomorreferensi',r.message.response.rujukan.noKunjungan);
				
				//Call Jadwal Dokter Berdasarkan Poli
				let getValKodepoli = r.message.response.rujukan.poliRujukan.kode;
				frappe.call('bpjs.api.sendAntrean', {
					service: 'jadwaldokter/kodepoli/'+getValKodepoli+'/tanggal/'+frappe.datetime.nowdate(),
					method: 'GET',
				}).then(r => {
					let list_jadwal = [];
					let field_jadwal = frappe.web_form.get_field('jadwal_dokter');
					list_jadwal.push({label: 'Pilih', value: ''});		

					$.each(r.message.response, function (index, value) {
						let jadwal_dokter_lists = value.namadokter+" "+value.jadwal+" ";
						let gabungVal = value.kodedokter+"|"+value.namadokter+"|"+value.jadwal+"|"+value.hari+"|"+value.kapasitaspasien+"|"+value.libur;
						list_jadwal.push({label: jadwal_dokter_lists, value: gabungVal});			
					});

					field_jadwal.df.options = list_jadwal;
					field_jadwal.set_options();
				})
			}else{
				frappe.show_alert({
					title: "Verifikasi Data",
					indicator: 'green',
					message:r.message.metaData.message,
				});
			}
		});
		
	})
	//Append Data Berdasrkan Pilihan Dokter
	frappe.web_form.on('jadwal_dokter',(field, value)=>{
		
		let x = value.split("|")
		
		frappe.web_form.set_value('kodedokter',x[0]);
		frappe.web_form.set_value('namadokter',x[1]);
		frappe.web_form.set_value('jampraktek',x[2]);
		frappe.web_form.set_value('kapasitaspasien',x[4]);
		
		frappe.call('bpjs.api.countAntrean', {
			tanggalperiksa: frappe.web_form.get_value('tanggalperiksa'),
			kodedokter:x[0],
			jampraktek:x[2]
		}).then(count => {
			let xx = count.message;
			xx += 1;
			frappe.web_form.set_value('noantrian',"B-"+xx);
			frappe.web_form.set_value('angka_antrian',xx);
			let sisakuotajkn = parseInt(x[4]) - parseInt(xx)
			
			frappe.web_form.set_value('sisakuotajkn',sisakuotajkn);
			frappe.show_alert({
				title: "Sisa Antrea",
				indicator: 'primary',
				message:"Sisa Quota Antrean "+sisakuotajkn,
			});
		})
	})
	
	
	//Action Send validate & Send BPJS
	frappe.web_form.validate = () => {
		
		//let x_return = '';
		let data = frappe.web_form.get_values();
		
		let angka_antrian = frappe.web_form.get_value('angka_antrian');
		let sisakuotajkn = parseInt(data['kapasitaspasien']) - parseInt(angka_antrian)
		let currentDate = Date.now();
		
		if(sisakuotajkn >= 0){
			let payload = {
				"kodebooking": data['kode_booking'],
				"jenispasien": data['jenis_pasien'],
				"nomorkartu": data['no_bpjs'],
				"nik": data['nik'],
				"nohp": data['no_hp'],
				"kodepoli": data['kode_poli'],
				"namapoli": data['nama_poli'],
				"pasienbaru": 0,
				"norm": data['no_rm'],
				"tanggalperiksa": data['tanggalperiksa'],
				"kodedokter": data['kodedokter'],
				"namadokter": data['namadokter'],
				"jampraktek": data['jampraktek'],
				"jeniskunjungan": data['jeniskunjungan'],
				"nomorreferensi": data['nomorreferensi'],
				"nomorantrean": data['noantrian'],
				"angkaantrean": data['angka_antrian'],
				"estimasidilayani": currentDate,
				"sisakuotajkn": sisakuotajkn,
				"kuotajkn": data['kapasitaspasien'],
				"sisakuotanonjkn": 0,
				"kuotanonjkn": 0,
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

					// $("<iframe>")                             // create a new iframe element
					// .hide()                               // make it invisible
					// .attr("src", "printview?doctype=POS%20Invoice&name=ACC-PSINV-2023-00001&trigger_print=1&format=POS%20Invoice&no_letterhead=1&letterhead=null&_lang=en") // point the iframe to the page you want to print
					// .appendTo("body");                    // add iframe to the DOM to cause it to load the page
					// const printWindow = window.open("", "_blank");
					// printWindow.document.write('<img src="' + qrcode._el.firstChild.toDataURL() + '" />');
					// printWindow.document.close();
					// printWindow.print();
					return true
				}else{
					frappe.show_alert({
						title: "Create Antrean BPJS",
						indicator: 'red',
						message:r.message.metaData.message,
					});
					return false
				}
			})
		}
		//window.print();
		//return false;
	}
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