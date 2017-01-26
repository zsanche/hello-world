(function() {
    angular
        .module("ims.managerApprovals")
        .controller("ManagerApprovalsDeptsController", ManagerApprovalsDeptsController);

    ManagerApprovalsDeptsController.$inject = ["user", "$scope", "$stateLoader", "$ionicLoading", "$ionicHistory", "$wmBasicPopup", "$wmToastr", "appCache", "ItemLookupServices",
                                               "$translate", "$userSettings", "$ionicScrollDelegate"];

    /* @ngInject */
    function ManagerApprovalsDeptsController(user, $scope, $stateLoader, $ionicLoading, $ionicHistory, $wmBasicPopup, $wmToastr, appCache,ItemLookupServices, 
    									 $translate, $userSettings, $ionicScrollDelegate) {
        var vm = this;
        vm.managerApprovalTxt = $translate.instant("managerApprovalTxt");
        var scrollBar = $ionicScrollDelegate.$getByHandle('deptListHandle');
        vm.loadPage = loadPage;
        vm.saveSelection = saveSelection;
        vm.showFilter = false;
        vm.topFilterDesc = "";
        var appCacheName = $ionicHistory.currentStateName() + "filterListCheck";         
        vm.loadPage();
        /** Condition to display toastr message only once */
        $scope.$on("$ionicView.enter", function() {
            if (!$userSettings.get("ManagerApprovalDeptListInstructionShown")) {
                $wmToastr.remove();
                $wmToastr.success($translate.instant("toastMsgMngrAprvl"), "3000");
                $userSettings.set("ManagerApprovalDeptListInstructionShown", true);
            }
        });
        /** Load page */
        function loadPage(checkedList) {
        	if(scrollBar){
        		scrollBar.scrollTop();
        	}        	
        	$ionicLoading.show();
        	if(checkedList){
        		vm.checkedItemList = checkedList;
        	}
        	else{
        		vm.checkedItemList = appCache.appCache().get("filterSelection"); 
        		if(!vm.checkedItemList){
        			vm.checkedItemList = [];
        		}
        	}        		        		

        	/** Fetches list of all the departments and number of items in each dept with pending Manager's approval */
            ItemLookupServices.GetProductCountChangeRequestSummary({
                user : user.getUser()
        	}).then(function(response) {
                vm.deptAuditList = response.deptAuditList;
    			vm.totalAudits = response.totalAudits;
            }, function(err) {
            	/** No more depts to review */
            	if (!err.aborted) {
        			if(err.errorCode === 404 || err.errorCode === "404" || err.errorCode === "300"){
        				$wmToastr.success($translate.instant("errNoDeptsToReviewTxt"), "3000");
        				$ionicHistory.goBack(-1);
    			
        		}
        		/** Another user is already reviewing */
        		else if(err.errorCode === 500 || err.errorCode === "500" ){
        			$wmBasicPopup.show({
        				title : $translate.instant("errText"),
        				msg : $translate.instant("errUnableToLock"),
        				onTap : function() {
        					$ionicHistory.goBack(-1);
        				}
        			});   
        		}
        		/** Generic error, caused most probably when the service fails */
        		else{
        			$wmBasicPopup.show({
        				title : $translate.instant("errText"),
        				msg : $translate.instant("errDeptList"),
        				onTap : function() {
        					$ionicHistory.goBack(-1);
        				}
        			});   
        		}
            	}
        	}).finally(function() {
        		$ionicLoading.hide();             	
        	});
        }
        /**Go to the selected department's items page.
         	deptNbr is the department that's selected
         	deptQty is the number of items in the dept that needs approval
        	deptName to display in the header bar*/
        function saveSelection(deptNbr, deptQty, deptName) {
        	$stateLoader.go("managerApprovalsMain", {
        		deptNbr : deptNbr,
        		deptQty : deptQty,
        		deptName : deptName
            });
                    
        }

    }
})();