var mine = angular.module('mineapp', []);

mine.controller('minecontroller', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};
	
	$scope.footer_active = 'profile';
	
	$scope.deleteGoods = function() {
		
		
		
	};
	
	$scope.init = function(){
		
		if (!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}
		
		$scope.user = TBMM.getUser()
		
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/user/"+$scope.user.id+"/goods/collects/page"),
			async: true,
			dataType: "json",
			data: {
				"ps": 100
			},
			success: function(data) {
				
				if(data.code == 0) {

					$scope.goods_list = data.data.list;
					$scope.$apply();

				} else {
					TBMM.ajaxHandle(data);
				}

			},
			error: function() {

				console.log('收藏信息获取错误');

			}
		});
	}
	
	$scope.init();

}]);