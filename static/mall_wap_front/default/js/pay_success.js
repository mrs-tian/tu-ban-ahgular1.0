var pay_success = angular.module('pay_success', []);

pay_success.controller('pay_successController', ['$scope', '$window', function($scope, $window) {
	
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	//取出订单号  传到订单详情的页面
		$scope.seq = $.query.get("seq");
		$scope.link = function(url) {
		$window.location.href = HOST + url;
	};
	

}]);