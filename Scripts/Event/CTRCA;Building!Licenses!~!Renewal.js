aa.runScript("CONVERTTOREALCAPAFTER4RENEW");

/*
 * Fees not working due to assess fee issue with system/config. Not related to script.

if(matches(appTypeArray[3],"Renewal") && AInfo["Select Number of Years for Registration"] == "1 Year"){
	var fSched = aa.finance.getFeeScheduleByCapID(capId).getOutput();
	logDebug("fSched: "+fSched)
	updateFee("LIC01", fSched, "FINAL", 1, "Y")
}

if(matches(appTypeArray[3],"Renewal") && AInfo["Select Number of Years for Registration"] == "2 Year"){
	var fSched = aa.finance.getFeeScheduleByCapID(capId).getOutput()
	logDebug("fSched: "+fSched)
	updateFee("LIC02", fSched, "FINAL", 1, "Y")
}
 */