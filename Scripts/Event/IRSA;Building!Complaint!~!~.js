//Script 21
if (inspResult == "Refer to Housing") {
	currentUserId = "ADMIN"
	childId = createChild("Enforcement","Case","NA","NA",capName )

	copyAppSpecific(capId, childId)
	copyOwner(capId, childId)	
	aa.asset.cloneAssets(cap.getCapModel(), childId); 
}