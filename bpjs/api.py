import frappe, json
from frappe import _ 
from frappe.utils import cint, flt, today, response
from frappe.model.document import Document
from frappe.integrations.utils import make_get_request, make_post_request, create_request_log
from pybpjs import bpjs

@frappe.whitelist(allow_guest=True)
def sendAntrean(**kwargs):
    
    args = frappe._dict(kwargs)
    doc = frappe.get_doc('Setting BPJS')
    
    if (doc.mode_bpjs == "Production"):
        baseurl = doc.base_url_antrean
        consumerid = doc.cons_id_antrean
        secretkey = doc.secret_key_antrean
        userkey = doc.user_key_antrean
    else:
        baseurl = doc.base_url_antrean_dev
        consumerid = doc.cons_id_antrean_dev
        secretkey = doc.secret_key_antrean_dev
        userkey = doc.user_key_antrean_dev

    credential = {
        "host": baseurl,
        "consid": consumerid,
        "secret": secretkey,
        "user_key": userkey,
        "is_encrypt": 1
    }

    service = args.service
    method = args.method
    payload = ''

    if args.payload is not None:
        payload = json.loads(args.payload)
    else:
        payload = args.payload
    #payload = json.loads(args.payload)
    
    data = bpjs.bridging(credential, service, method, payload)
    return data

@frappe.whitelist(allow_guest=True)
def sendVClaim(**kwargs):
    
    args = frappe._dict(kwargs)
    doc = frappe.get_doc('Setting BPJS')
    
    if (doc.mode_bpjs == "Production"):
        baseurlVclaim = doc.base_url_vclaim
        consumerid = doc.cons_id_vclaim
        secretkey = doc.secret_key_vclaim
        userkey = doc.user_key_vclaim
    else:
        baseurlVclaim = doc.base_url_vclaim_dev
        consumerid = doc.cons_id_vclaim_dev
        secretkey = doc.secret_key_vclaim_dev
        userkey = doc.user_key_vclaim_dev

    credential = {
        "host": baseurlVclaim,
        "consid": consumerid,
        "secret": secretkey,
        "user_key": userkey,
        "is_encrypt": 1
    }

    service = args.service
    method = args.method
    payload = '' #args.payload

    if args.payload is not None:
        payload = json.loads(args.payload)
    else:
        payload = args.payload
    #payload = json.loads(args.payload)
    
    data = bpjs.bridging(credential, service, method, payload)
    return data

@frappe.whitelist(allow_guest=True)
def countAntrean(**kwargs):
    args = frappe._dict(kwargs)
    res = frappe.db.count('Antrean BPJS', {
        'tanggalperiksa': args.tanggalperiksa,
		'kodedokter':args.kodedokter,
		'jampraktek':args.jampraktek
    })
    return res 

@frappe.whitelist(allow_guest=True)
def testing():
    data_store = []
    res = sendAntrean(service ='antrean/pendaftaran/tanggal/2023-08-04',method="GET")
	#for x in res['message']['response']:
    #if res['response'] is not None:
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
    return data_store