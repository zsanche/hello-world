/**
 * Created by jrecto1 on 5/2/16
 */
(function() {
    angular
        .module("ims.managerApprovals")
        .run(appRun);

    appRun.$inject = ["routerHelper", "$stateLoader"];

    function appRun(routerHelper, $stateLoader) {
        routerHelper.configureStates(getStates($stateLoader));
    }

    function getStates($stateLoader) {
        return [{
            state : "managerApprovalsDepts",
            config : {
        		cache : false,
                url : "/managerApprovalsDepts",
                views : {
                    "main" : {
                        templateUrl : "../IMS_Manager_Approvals/manager-approvals/manager-approvals-depts.html",
                        controller : "ManagerApprovalsDeptsController as vm"
                    }
                },
                resolve: {
                	ManagerApprovalsDeptsController: ['$ocLazyLoad', function($ocLazyLoad) {
                             return $ocLazyLoad.load($stateLoader.getPaths("managerApprovalsDepts"), {serie : true});
                    }]
                }
            }
        },
        {
            state : "managerApprovalsMain",
            config : {
                cache : false,
                url : "/managerApprovalsMain?deptNbr,deptQty, deptName",
                views : {
                    "main" : {
                        templateUrl : "../IMS_Manager_Approvals/manager-approvals/manager-approvals-main.html",
                        controller : "ManagerApprovalsMainController as vm"
                    }        
                },
                resolve: {
                	ManagerApprovalsMainController: ['$ocLazyLoad', function($ocLazyLoad) {
                       return $ocLazyLoad.load($stateLoader.getPaths("managerApprovalsMain"), {serie : true});
                  }]
                }
            }
        }];
    }
})();