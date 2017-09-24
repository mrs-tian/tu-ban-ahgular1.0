var app = angular.module('MM', []);

app.controller('MineInfoController', function($scope, $http, $window) {
	
	
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};
	$scope.footer_active = 'profile';
    
    $scope.init = function() {
    	
    	if (!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}
    	
    	
    	$.ajax({
            type: "GET",
            url: TBMM.genApiUrl("/user/"+TBMM.getUID()+"/info"),
            data: {},
            success: function(data){

              	if (data.code == 0) {
              		$scope.user = data.data;
                	$scope.$apply(); 
              	} else {
              		TBMM.ajaxHandle(data);
              	}
              
            },
            error: function(){
            },
            dataType: 'json'
        });

    
    }

    $scope.edit = function(id){
        $scope.isEdit = true;
        $("#divInfo").hide();
        $("#"+id).show();
    }
    $scope.submitUsername = function()
    {
//      submitInfo({'username':$scope.user.username});
 		submitInfo({'username':$("#txt_cust_loginname").val()});
    }
    $scope.submitPassword = function()
    {
//      submitInfo({'password':$scope.user.password});
 		submitInfo({'password':$("#txt_cust_pwd").val()});
    }
    $scope.submitName = function()
    {
        submitInfo({'realname':$scope.user.realname});
    }
    $scope.submitMobile = function()
    {
        submitInfo({'mobile':$scope.user.mobile});
    }
    $scope.submitEmail = function()
    {
        submitInfo({'email':$scope.user.email});
    }
    $scope.submitWechat = function()
    {
        submitInfo({'wx_name':$scope.user.wx_name});
    }
    
    $scope.cancelUpdate = function() {
    	$("section.login").hide();
    	$("#divInfo").show();
    }

    function submitInfo(data) {

        $.ajax({
            type: "POST",
            url: TBMM.genApiUrl("/user/"+$scope.user.id+"/baseinfo"),
            data: data,
            success: function(data){

              	if (data.code == 0) {
              		
              		console.log($scope.user);
                	$scope.isEdit = false;
                	$("section.login").hide();
                	$("#divInfo").show();
                	
                	$scope.$apply(); 
              	} else {
              		TBMM.ajaxHandle(data);
              	}
              
            },
            error: function(){
            },
            dataType: 'json'
        });
    }

    $window.postBack = function()
    {

        if($scope.isEdit)
        {
            $scope.isEdit = false;
            $("section.login").hide();
            $("#divInfo").show();
        }
        else
        {
            $window.history.back();
        }

    }
    
    $scope.logout = function() {
        
        
        if (confirm("确定退出登录？")) {
        	$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/user/logout"),
				async: true,
				dataType: "json",
				data: {},
				success: function(data) {
					TBMM.clear();
					$window.location.href = HOST + '/index.html';
				},
				error: function() {
					console.log('登出请求失败');
				}
			});
        }
        
    }
    
    $scope.init();
});