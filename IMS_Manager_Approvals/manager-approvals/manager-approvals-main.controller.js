(function() {
    angular
        .module("ims.managerApprovals")
        .controller("ManagerApprovalsMainController", ManagerApprovalsMainController);
    
    ManagerApprovalsMainController.$inject = ["$rootScope", "user",  "$stateParams", "ItemLookupServices", "$ionicLoading", "$ionicHistory", "$translate", "appCache", 
           "$wmContextMenu", "$wmToastr", "$ionicScrollDelegate", "$ionicListDelegate", "$wmBasicPopup","$wmAdvPopup"];

    /* @ngInject */
    function ManagerApprovalsMainController ($rootScope, user,  $stateParams, ItemLookupServices, $ionicLoading, $ionicHistory, $translate, appCache,  
    		$wmContextMenu, $wmToastr, $ionicScrollDelegate, $ionicListDelegate, $wmBasicPopup,$wmAdvPopup) {
    	
    	var vm = this;    	
    	vm.managerApprovalTxt = $translate.instant("managerApprovalTxt");
    	vm.itemsText = $translate.instant("itemsText");
    	vm.onHands = $translate.instant("onHands");
    	vm.newOnHands = $translate.instant("newOnHands");
    	vm.qtyAdjusted = $translate.instant("qtyAdjusted");
    	vm.dollarAdj = $translate.instant("dollarAdj");
    	vm.details = $translate.instant("details");
    	vm.noActionBtnTxt = $translate.instant("noActionBtnTxt");
    	vm.denyBtnTxt = $translate.instant("denyBtnTxt");
    	vm.approveBtnTxt = $translate.instant("approveBtnTxt");
    	vm.item = $translate.instant("itemNbrHash");
    	vm.upc = $translate.instant("upc");
    	vm.sfCount = $translate.instant("sfCount");
    	vm.bckrmCount = $translate.instant("bckrmCount");
    	vm.cmpltd = $translate.instant("cmpltd");
    	vm.finalizeCaps = $translate.instant("finalizeCaps"); 
    	vm.moneySymbol = $translate.instant("moneySymbol");
    	
    	vm.deptNbr = $stateParams.deptNbr;
    	//vm.deptQty = $stateParams.deptQty;
    	vm.deptName = $stateParams.deptName;
    	vm.loadPage = loadPage;
    	vm.changeSelected = changeSelected;
    	vm.finalize = finalize;
    	vm.showToggle = showToggle; 
    	vm.showContextMenu = showContextMenu;
    	/**Load page*/
    	vm.loadPage();
    	
    	var listLength = 0;
    	/**Static variable to assign the total value when 'Approve All' option is selected */
    	var TOTAL_DOLLAR_ADJ_VAL = 0;
    	var scroll = $ionicScrollDelegate.$getByHandle('manager-approval-content');
    	$rootScope.mngrAprvlGoodToGoBack = false;

    	
    	/**Load page*/
        function loadPage() {    
        	if(scroll){
        	scroll.scrollTop();
        	}
        	$ionicLoading.show();
        	/** Loads all the items that needs Manager Approval(Approve/Deny/No Action) for the selected department */
            ItemLookupServices.GetChangedProductsForDept({
                user : user.getUser(),
                deptNbr : vm.deptNbr
        	}).then(function(response) {
               vm.itemList = response.sortedList;
               vm.totalDollarAdjVal = response.totalDollarAdjVal;
               TOTAL_DOLLAR_ADJ_VAL = response.totalDollarAdjVal;
               vm.deptQty = vm.itemList.length;
                            
               /**Setting the approve button to True for all items on page load 
                * Also handles 'Details' styling on landing*/
               for(var i=0; i<vm.deptQty; i++){
            	   vm.itemList[i].btnActionArray = [false, false, true];
            	   vm.itemList[i].showDetails = false;
            	   vm.itemList[i].uparrow = false;
            	   vm.itemList[i].downarrow = true;
               }
            }, function(err) {
            	if (!err.aborted) {
        			$wmBasicPopup.show({
        				title : $translate.instant("errText"),
        				msg : $translate.instant("errItemsList"),    
        				onTap : function() {
        					$ionicHistory.goBack(-1);
        				}
        			});        
        			}
        	}).finally(function() {
        		$ionicLoading.hide();             	
        	});
            
        }
        
        /** Handles the style change for a selected button(Approve/Deny/No Action) */
        function changeSelected(btnActionArray, index, itemDollarVal){
        	if(!btnActionArray[index]){
        		if((index == 0 || index ==1)&&(btnActionArray[2]) ){
        			vm.totalDollarAdjVal = parseFloat((parseFloat(vm.totalDollarAdjVal)-parseFloat(itemDollarVal)).toFixed(2));
        		}else if(index == 2){
        			vm.totalDollarAdjVal = parseFloat((parseFloat(vm.totalDollarAdjVal)+parseFloat(itemDollarVal)).toFixed(2));
        		}
        	btnActionArray[index] = !btnActionArray[index]; 
        	for(var i=0, len=btnActionArray.length; i < len; i++){
        		if(i !== index && btnActionArray[i]){
        			btnActionArray[i] = !btnActionArray[i];
        		}
        	}
        	}
        }
        /**Handles 'Details' styling when toggling*/
        function showToggle(showDetails, index){
        	vm.itemList[index].showDetails = !showDetails;
        	vm.itemList[index].downarrow = showDetails;
        	vm.itemList[index].uparrow = !showDetails;
        }
        
        
        /** Finalizes users actions*/
        function finalize(){
        	console.log("Started finalizing");
        	$ionicLoading.show();
        	ItemLookupServices.FinalizeCountChange({
        		user : user.getUser(),
        		items : vm.itemList,
        		dept : vm.deptNbr
        		}).then(function(response) {
        			if($rootScope.mngrAprvlGoodToGoBack){
        			$wmToastr.success($translate.instant("successManagerApprovalFinalize"), "3000");
        			$ionicLoading.hide();
        			$ionicHistory.goBack(-1);
        			}
        			else{
        			loadPage();
        			$wmToastr.success($translate.instant("successManagerApprovalFinalize"), "3000");
        			}
                }, function(err) {
                	/**Approve  or Deny at least one item*/
            		if (!err.aborted) {
            			if(err.errorCode == 404  || err.errorCode == "404"){
            				$wmBasicPopup.show({
                				title : $translate.instant("errText"),
                				msg : $translate.instant("errApproveDeny")        				
                			}); 
            			/**Departments are under review by another user or unauthorized user*/
            			}else if(err.errorCode == 405  || err.errorCode == "405"){
            				if(!(err.errorDesc.indexOf("User not authorized") == -1)){
            					$wmBasicPopup.show({
                    				title : $translate.instant("errText"),
                    				msg : $translate.instant("errUnAuthorizedUser")        				
                    			});	
            				}
            				else{
            				$wmBasicPopup.show({
                				title : $translate.instant("errText"),
                				msg : $translate.instant("errDeptLocked")        				
                			}); 
            				}
            			}else if(err.errorCode == 400  || err.errorCode == "400"){
            				if(!(err.error.indexOf("unauthorized") == -1)){
            					$wmBasicPopup.show({
                    				title : $translate.instant("errText"),
                    				msg : $translate.instant("errUnAuthorizedUser")        				
                    			});	
            				}
            				else{
            				$wmBasicPopup.show({
                				title : $translate.instant("errText"),
                				msg : $translate.instant("errFinalizeItems")        				
                			}); 
            				}
            			}
            			/**Generic error*/
            			else{
            			$wmBasicPopup.show({
            				title : $translate.instant("errText"),
            				msg : $translate.instant("errFinalizeItems ")        				
            			});       
            			}
            		}
            	}).finally(function() {
            		$ionicLoading.hide();             	
            	});
        }
        /**Adds stuff to context menu*/
        function showContextMenu() {
            $wmContextMenu.showContextMenu({
                menuOptions : [{
                    desc : "Approve all", //$translate.instant("approveAll"),
                    onTap : approveAll
                }
                ,
                {
                    desc : "Deny all", //$translate.instant("denyAll"),
                    onTap : denyAll
                }
                ]
                
            });
        }
        /**Handles the actions when Approve all option is selected*/
        function approveAll(){
        	for(var i=0; i<vm.deptQty; i++){
         	   vm.itemList[i].btnActionArray = [false, false, true];
         	   /**Sets the total dollar adjustment value*/
         	  vm.totalDollarAdjVal = TOTAL_DOLLAR_ADJ_VAL;
            }
        }
        
        /**Handles the actions when Deny all option is selected*/
        function denyAll(){
        	for(var i=0; i<vm.deptQty; i++){
          	   vm.itemList[i].btnActionArray = [false, true, false];
          	 /**Sets the total dollar adjustment value*/
          	 vm.totalDollarAdjVal = 0;
             }
        }
        
       
    }
})();