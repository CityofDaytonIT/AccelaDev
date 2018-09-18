function updateLicenseFromRenewal() {
	parentLicenseCAPID = getParentLicenseCapID(capId); 
	
	jsDate = new Date()
	jsDate.setHours(0,0,0,0)
	jsDate.setMonth(11)
	jsDate.setDate(31)
	
	switch(""+AInfo["Select Number of Years for Registration"]) {
		case "1 Year":
			jsDate.setFullYear(jsDate.getFullYear()+1)
			break;
		case "2 Year":
			jsDate.setFullYear(jsDate.getFullYear()+2)
			break;
	}
	
	//get ASI from renewal
	var slhn = AInfo["State License Holder's Name"];
	var sooled = AInfo["State of Ohio License Expiration Date"];
	var be = AInfo["Bond Expiration"];
	var coled = AInfo["Certificate of Liability Expiration Date"];
//	var dred = AInfo["Dayton Registration Expiration Date"];

	// New Expire date	
	newExpireDate = jsDateToASIDate(jsDate)

	//Update License
	var gm = aa.appSpecificTableScript.getAppSpecificGroupTableNames(parentLicenseCAPID).getOutput(); 
	for (x in gm) removeASITable(gm[x], parentLicenseCAPID);
	copyAppSpecific(parentLicenseCAPID); 
	copyASITables(capId,parentLicenseCAPID); 
	
	removeCapContacts(parentLicenseCAPID);
	
	copyContacts(capId,parentLicenseCAPID);  
	
	saveId = capId; 
	capId = parentLicenseCAPID;
	
	licEditExpInfo("Active",newExpireDate); 
	logDebug("License "+parentLicenseCAPID+" has been renewed and will expire on: "+ newExpireDate );
	updateAppStatus("Issued","Updated via Renewal");
	capId = saveId;
	
	//Update LP
	parentCapId = aa.cap.getCapID(parentLicenseCAPID.ID1,parentLicenseCAPID.ID2,parentLicenseCAPID.ID3).getOutput();
	var lic = getRefLicenseProf(parentCapId.getCustomID()); 
	
	if (lic != null){
		lic.setLicenseExpirationDate(aa.date.parseDate(newExpireDate))
		lic.setLicenseLastRenewalDate(aa.date.getCurrentDate())	
		
//		if(!matches(typeof(slhn),"undefined",null)){//State License Holder's Name
//			logDebug("slhn: "+slhn);
//			lic.set(slhn);
//		}
//		if(!matches(typeof(soocln),"undefined",null)){//State of Ohio Contractor's License Number
//			logDebug("soocln: "+soocln);
//			lic.setBusinessLicense(soocln);
//		}
		if(!matches(typeof(sooled),"undefined",null)){//State of Ohio License Expiration Date
			logDebug("sooled: "+sooled);
			lic.setBusinessLicExpDate(aa.date.parseDate(sooled));
		}
		if(!matches(typeof(be),"undefined",null)){//Bond Expiration
			logDebug("be: "+be);
			lic.setInsuranceExpDate(aa.date.parseDate(be));
		}
		if(!matches(typeof(coled),"undefined",null)){//Certificate of Liability Expiration Date
			logDebug("coled: "+coled);
			lic.setWcExpDate(aa.date.parseDate(coled));
		}
		
//		aa.licenseScript.editRefLicenseProf(lic);
		modifyRefLPAndSubTran(parentCapId, lic);
	}else{
		logDebug("Could not get LP");
	}
}