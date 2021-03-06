/******* Testing *******

aa.env.setValue("asiField","Plan Board Expiration Date");
aa.env.setValue("appGroup","Planning");
aa.env.setValue("appTypeType","Planning Case");
aa.env.setValue("appSubtype","NA");
aa.env.setValue("appCategory","NA");
aa.env.setValue("newStatus","Expired")
aa.env.setValue("conType","Board of Zoning Appeals")
aa.env.setValue("conName","Expired")

//***********************/
/*------------------------------------------------------------------------------------------------------/
| Client: Dayton OH
|
| Frequency: Daily
|
| Desc: Expire records whos ASI field "Plan Board Expiration Date" is today
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 60;		// number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
appTypeArray =[];
currentUserID = "ADMIN";
useAppSpecificGroupName = false;
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if(bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I"){
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if(bzr.getSuccess()){
		SAScript = bzr.getOutput().getDescription();
	}
}

if(SA){
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
}else{
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH",null,false));

function getScriptText(vScriptName, servProvCode, useProductScripts){
	if(!servProvCode) servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if(useProductScripts){
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		}else{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	}catch (err){
		return "";
	}
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = true//aa.env.getValue("showDebug").substring(0,1).toUpperCase().equals("Y");

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "Test" //+ aa.env.getValue("BatchJobName");
wfObjArray = null;

batchJobID = 0;
if (batchJobResult.getSuccess()){
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var asiField = getParam("asiField");
var appGroup = getParam("appGroup");							// 
var appTypeType = getParam("appTypeType");						//   app type to process {Rental License}
var appSubtype = getParam("appSubtype");						//   app subtype to process {NA}
var appCategory = getParam("appCategory");						//   app category to process {NA}
var newStatus = getParam("newStatus");
var conType = getParam("conType");
var conName = getParam("conName");
var emailAddress = getParam("emailAddress");					// email to send report
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");// send out emails?
var emailTemplate = getParam("emailTemplate");					// email Template

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var timeExpired = false;

var startTime = startDate.getTime();			// Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

if (appGroup=="")	appGroup="*";
if (appTypeType=="")	appTypeType="*";
if (appSubtype=="")	appSubtype="*";
if (appCategory=="")	appCategory="*";
var appType = appGroup+"/"+appTypeType+"/"+appSubtype+"/"+appCategory;

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

if (!timeExpired) mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
	//Batch Variables
	var today = new Date()
	var count = 0
	
	//Batch Record Set
	capResult = aa.cap.getCapIDsByAppSpecificInfoField(asiField,jsDateToASIDate(today))
	if (!capResult.getSuccess()) {
		logDebug("ERROR: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false
	} 

	//Process Records
	recList = capResult.getOutput();
	logDebug("Processing " + recList.length + " records")
	for (i in recList)  {
		if (elapsed() > maxSeconds) {
			// only continue if time hasn't expired
			logDebug("A script time-out has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break;
		}
		thisRec =recList[i]
		capId = thisRec.getCapID();
		tmpCapObj = aa.cap.getCap(capId)
		altId = tmpCapObj.getSuccess() ? tmpCapObj.getOutput().getCapModel().getAltID() : null
		
		if(!appMatch(appType,capId)){
			continue
		}
		
		logDebug(br + "Expiring record: " + altId)
		updateAppStatus(newStatus, "Set by Script")
		addStdCondition(conType,conName)
		count++
	}
	logDebug(br + "Expired " + count + " record" + (count == 1 ? "" : "s"))
}
