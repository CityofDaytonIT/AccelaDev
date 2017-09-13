aa.runScript("CONVERTTOREALCAPAFTER4RENEW");

if(matches(appTypeArray[3],"Renewal")) {
	try{
		fSched = aa.finance.getFeeScheduleByCapID(capId).getOutput()
		if (AInfo["Select Number of Years for Registration"] == "1 Year")
			updateFee("LIC01", fSched, "FINAL", 1, "Y")
		if (AInfo["Select Number of Years for Registration"] == "2 Year")
			updateFee("LIC02", fSched, "FINAL", 1, "Y")
	} catch(err) {
		logDebug("***Error adding fee: " + err)
	}
}