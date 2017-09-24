var mine = angular.module('gorderMine', []);

mine.controller('gorderMineController', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'profile';

	$scope.isLoading = false;

	$scope.init = function() {

		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}

		$scope.user = TBMM.getUser();

		$scope.isLoading = true;

		$scope.logisticAddress = null; // 退货公司收件地址

		$scope.seq = $.query.get('seq') || '';

		if(!$scope.seq) {
			window.location.href = HOST + '/index.html';
			return;
		}

		$.ajax({
			type: 'GET',
			url: TBMM.genApiUrl("/logistics/address/defReceive"),
			data: {},

			success: function(data) {
				$scope.isLoading = false;
				if(data.code == 0) {
					$scope.logisticAddress = data.data;

					$scope.$apply();
				} else {
					TBMM.ajaxHandle(data);
					return;
				}

			},
			error: function() {
				$scope.isLoading = false;
				console.log('Error')
			},
			dataType: 'json'
		});

	};

	$scope.requestRefund = function() {
		$scope.isLoading = true;
		$.ajax({
			type: 'POST',
			url: TBMM.genApiUrl("/gorder/" + $scope.seq + "/refund"),
			data: $("#refundForm").serialize(),
			success: function(data) {
				$scope.isLoading = false;
				if(data.code == 0) {

					$scope.alert = {
						on: true,
						icon: 'success',
						buttonStyle: 'none', // 'single', 'double', 'none'
						message: '发起退款成功!'
					};
					$scope.$apply(); // !!!!! 如果是Ajax内必须加此语句
					setTimeout(function() {
						$scope.alert.on = false;
						$scope.$apply();
						$window.location.href = $scope.HOST + '/gorder/detail.html?seq=' + $scope.seq;
					}, 1500);
				} else {

					$scope.alert = {
						on: true,
						icon: 'warning',
						buttonStyle: 'none', // 'single', 'double', 'none'
						message: '发起退款失败'
					};
					$scope.$apply();
					setTimeout(function() {
						$scope.alert.on = false;
						$scope.$apply();
					}, 1500);

					return;
				};
			},
			error: function() {
				$scope.isLoading = false;
				console.log('Error')
			},
			dataType: 'json'
		});

	};

	$scope.init();

}]);