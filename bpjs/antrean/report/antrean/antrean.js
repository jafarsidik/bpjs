// Copyright (c) 2023, jafar sidik and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Antrean"] = {
	"filters": [
		{
            fieldname: 'kodebooking',
            label: "Code Booking",
            fieldtype: 'Data',
        },
		{
            fieldname: 'tanggal',
            label: "Tanggal",
            fieldtype: 'Date',
        },
	]
};
