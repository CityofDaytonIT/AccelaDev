function issueLicense() {
	
	//get ASI from Application
	var slhn = AInfo["State License Holder's Name"];
	var soocln = AInfo["State of Ohio Contractor's License Number"];
	var sooled = AInfo["State of Ohio License Expiration Date"];
	var be = AInfo["Bond Expiration"];
	var coled = AInfo["Certificate of Liability Expiration Date"];
	
	//SET CONTACT STATE
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if(capContactResult.getSuccess()){
		var contactList = capContactResult.getOutput();
		for(i in contactList){
			thisContact = contactList[i];
			conModel = thisContact.getCapContactModel();
			conModel.setState("OH");
			logDebug(aa.people.editContactByCapContact(conModel).getSuccess());
		}
	}
	
	newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);
	if(newLicId){
		editContactType("Applicant", "License Holder", newLicId);
		copyOwner(capId, newLicId);
		updateAppStatus("Issued","Original Issuance",newLicId);
		updateTask("License","Active","Updated via Script","Updated via Script",null,newLicId);
		copyAppSpecific(newLicId);
		copyASITables(capId,newLicId);
		
		jsDate = new Date();
		jsDate.setHours(0,0,0,0);
		
		switch(""+AInfo["Select Number of Years for Registration"]){
			case "1 Year":
				if(jsDate.getMonth() == 11){
					jsDate.setFullYear(jsDate.getFullYear()+1);
				}
				else{
					jsDate.setFullYear(jsDate.getFullYear());
				}
				break;
			case "2 Year":
				if(jsDate.getMonth() == 11){
					jsDate.setFullYear(jsDate.getFullYear()+2);
				}
				else{
					jsDate.setFullYear(jsDate.getFullYear()+1);
				}
				break;
		}
		
		jsDate.setMonth(11);
		jsDate.setDate(31);
		newLicIdString = newLicId.getCustomID();
		lic = new licenseObject(newLicIdString,newLicId);
		lic.setStatus("Active");
		lic.setExpiration(jsDateToASIDate(jsDate));
		saveId = capId;
		capId = newLicId;
//		AInfo["Business License #"] = newLicIdString;
		
		var conLicType = "";
		if(matches(appTypeArray[2],"Apprentice Plumbers")){
			conLicType = "Apprentice Plumber";
		}else if(matches(appTypeArray[2],"Electrical Contractor")){
			conLicType = "Electrical";
		}else if(matches(appTypeArray[2],"HVAC")){
			conLicType = "Mechanical";
		}else if(matches(appTypeArray[2],"Journeyman Plumbers")){
			conLicType = "Journeyman Plumber";
		}else if(matches(appTypeArray[2],"Pipe-Laying")){
			conLicType = "Pipe Laying Contractor";
		}else if(matches(appTypeArray[2],"Plumbing")){
			conLicType = "Plumbing";
		}else{
			logDebug("Could not match contractor type")
		}
		
		createRefLicProf(newLicIdString,conLicType,"License Holder");
		capId = saveId;
		refLP = getRefLicenseProf(newLicIdString);
		refLP.setLicenseExpirationDate(aa.date.parseDate(jsDateToASIDate(jsDate)));
		refLP.setLicenseIssueDate(aa.date.getCurrentDate());
		refLP.setBusinessName2("Issued");
		
//		if(!matches(typeof(slhn),"undefined",null)){//State License Holder's Name
//			logDebug("slhn: "+slhn);
//			refLP.set(slhn);
//		}
//		if(!matches(typeof(soocln),"undefined",null)){//State of Ohio Contractor's License Number
//			logDebug("soocln: "+soocln);
//			refLP.setBusinessLicense(soocln);
//		}
		if(!matches(typeof(sooled),"undefined",null)){//State of Ohio License Expiration Date
			logDebug("sooled: "+sooled);
			refLP.setBusinessLicExpDate(aa.date.parseDate(sooled));
		}
		if(!matches(typeof(be),"undefined",null)){//Bond Expiration
			logDebug("be: "+be);
			refLP.setInsuranceExpDate(aa.date.parseDate(be));
		}
		if(!matches(typeof(coled),"undefined",null)){//Certificate of Liability Expiration Date
			logDebug("coled: "+coled);
			refLP.setWcExpDate(aa.date.parseDate(coled));
		}
		
		aa.licenseScript.editRefLicenseProf(refLP);
		aa.licenseScript.associateLpWithCap(newLicId,refLP);
		
	}
}