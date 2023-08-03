import frappe, requests, json
from frappe.model.document import Document
from frappe.integrations.utils import make_get_request, make_post_request, create_request_log
from pybpjs import bpjs
from frappe.utils import today, response

@frappe.whitelist(allow_guest=True)
def send(**kwargs):
    
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
    payload = '' #args.payload

    if args.payload is not None:
        payload = json.loads(args.payload)
    else:
        payload = args.payload
    #payload = json.loads(args.payload)
    
    data = bpjs.bridging(credential, service, method, payload)
    return data