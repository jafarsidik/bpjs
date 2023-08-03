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
        baseurlVclaim = doc.base_url_vclaim
        consumerid = doc.consumerid_vclaim
        secretkey = doc.consumersecret_vclaim
        userkey = doc.consumerkey_vclaim
    else:
        baseurlVclaim = doc.base_url_vclaim_dev
        consumerid = doc.consumerid_vclaim_dev
        secretkey = doc.consumersecret_vclaim_dev
        userkey = doc.consumerkey_vclaim_dev

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
