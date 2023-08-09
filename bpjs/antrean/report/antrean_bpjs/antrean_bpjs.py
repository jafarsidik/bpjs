# Copyright (c) 2023, jafar sidik and contributors
# For license information, please see license.txt


import frappe, json
from frappe import _ 
from frappe.utils import cint, flt,today

from bpjs.api import *


def execute(filters=None):
	columns = [
		{'fieldname': 'kodebooking','label': "Kode Booking",'fieldtype': 'Link','options':'Antrean BPJS'},
		{'fieldname': 'noantrean','label': "Nomor Antrean",'fieldtype': 'Data'},
		{'fieldname': 'status','label': "Status",'fieldtype': 'Data'},
		{'fieldname': 'tanggal','label': "Tanggal",'fieldtype': 'Date'},
		{'fieldname': 'kodepoli','label': "Kode Poli",'fieldtype': 'Data'},
		{'fieldname': 'kodedokter','label': "Kode Dokter",'fieldtype': 'Data'},
		{'fieldname': 'jampraktek','label': "Jam Praktek",'fieldtype': 'Data'},
		{'fieldname': 'nik','label': "NIK",'fieldtype': 'Data'},
		{'fieldname': 'nokapst','label': "No BPJS",'fieldtype': 'Data'},
		{'fieldname': 'nohp','label': "No HP",'fieldtype': 'Data'},
		{'fieldname': 'norekammedis','label': "No RM",'fieldtype': 'Data'},
		{'fieldname': 'jeniskunjungan','label': "Jenis Kunjungan",'fieldtype': 'Data'},
		{'fieldname': 'nomorreferensi','label': "No Referensi",'fieldtype': 'Data'},
		{'fieldname': 'sumberdata','label': "Sumber Data",'fieldtype': 'Data'}
	]
	data_store = []
	if filters.kodebooking:
		res = sendAntrean(service ='antrean/pendaftaran/kodebooking/'+filters.kodebooking,method="GET")
		#for x in res['message']['response']:
		if res['response'] is not None:
			data_store.append({
				'kodebooking':res['response'][0]['kodebooking'],
				'noantrean':res['response'][0]['noantrean'],
				'status':res['response'][0]['status'],
				'tanggal':res['response'][0]['tanggal'],
				'kodepoli':res['response'][0]['kodepoli'],
				'kodedokter':res['response'][0]['kodedokter'],
				'jampraktek':res['response'][0]['jampraktek'],
				'nik':res['response'][0]['nik'],
				'nokapst':res['response'][0]['nokapst'],
				'nohp':res['response'][0]['nohp'],
				'norekammedis':res['response'][0]['norekammedis'],
				'jeniskunjungan':res['response'][0]['jeniskunjungan'],
				'nomorreferensi':res['response'][0]['nomorreferensi'],
				'sumberdata':res['response'][0]['sumberdata'],
			})
	if filters.tanggal:
		res = sendAntrean(service ='antrean/pendaftaran/tanggal/'+filters.tanggal,method="GET")
		if res['response'] is not None:
			for x in res['response']:
				data_store.append({
					'kodebooking':x['kodebooking'],
					'noantrean':x['noantrean'],
					'status':x['status'],
					'tanggal':x['tanggal'],
					'kodepoli':x['kodepoli'],
					'kodedokter':x['kodedokter'],
					'jampraktek':x['jampraktek'],
					'nik':x['nik'],
					'nokapst':x['nokapst'],
					'nohp':x['nohp'],
					'norekammedis':x['norekammedis'],
					'jeniskunjungan':x['jeniskunjungan'],
					'nomorreferensi':x['nomorreferensi'],
					'sumberdata':x['sumberdata'],
				})
	# if filters is not None:
	# 	res = sendAntrean(service ='antrean/pendaftaran/tanggal/'+today(),method="GET")
	# 	if res['response'] is not None:
	# 		for x in res['response']:
	# 			data_store.append({
	# 				'kodebooking':x['kodebooking'],
	# 				'noantrean':x['noantrean'],
	# 				'status':x['status'],
	# 				'tanggal':x['tanggal'],
	# 				'kodepoli':x['kodepoli'],
	# 				'kodedokter':x['kodedokter'],
	# 				'jampraktek':x['jampraktek'],
	# 				'nik':x['nik'],
	# 				'nokapst':x['nokapst'],
	# 				'nohp':x['nohp'],
	# 				'norekammedis':x['norekammedis'],
	# 				'jeniskunjungan':x['jeniskunjungan'],
	# 				'nomorreferensi':x['nomorreferensi'],
	# 				'sumberdata':x['sumberdata'],
	# 			})
		
	return columns, data_store
