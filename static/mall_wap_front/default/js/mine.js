var mine = angular.module('mineapp', []);

mine.controller('minecontroller', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'profile';

	$scope.signup = function() {

		$.ajax({
			type: "post",
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/signup"),
			async: true,
			dataType: "json",
			data: {}, //上边url传进去了  这里不用传了
			success: function(data) {

				if(data.code == 0) {

					$scope.alert = {
						on: true,
						buttonStyle: 'none', // 'single', 'double', 'none'
						message: '签到成功，请留意积分变动！'
					}

					$scope.$apply();
					setTimeout(function() {
						$scope.alert.on = false;
						$scope.$apply()
					}, 1500);

				} else {
					TBMM.ajaxHandle(data);
				}

			},
			error: function() {
				console('用户信息获取错误');
			}
		});

	};

	//	管理收获地址

	$scope.manger_addr = function() {
		$window.location.href = HOST + '/user/mine_addr.html';
	};

	$scope.init = function() {

		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}

		$scope.user = TBMM.getUser()

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/stat"),
			async: true,
			dataType: "json",
			data: {}, //上边url传进去了  这里不用传了
			success: function(data) {

				if(data.code == 0) {

					$scope.stat = data.data;
					$scope.$apply();

				} else {
					TBMM.ajaxHandle(data);
				}

			},
			error: function() {

				console.log('用户信息获取错误');

			}
		});
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/ucoupons/page"),
			async: true,
			dataType: 'json',
			data: {
				"status": 0,
					//								"start":0 ,
			    "limit":100
			},
			success: function(data) {
				$scope.zong_num=data.data.list.length;
				$scope.$apply();
			},

			error: function() {
				alert('网络错误，请您刷新重试')
			}
		});
	};

	$scope.init();

}]);