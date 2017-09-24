var coupon_app = angular.module('coupon_app', []);
coupon_app.controller('coupon_app_controller', ['$scope', '$window', function($scope, $window) {
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	//初始化获取优惠券列表
	$scope.init = function() {
		$scope.have_use_num = [];
		$scope.no_use_num = [];
		$scope.no_time_num = [];
		//	状态 1 可用 2 已使用 -2 过期
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/ucoupons/page"),
			async: true,
			dataType: 'json',
			data: {
				"status":0,
					//								"start":0 ,
				"limit":100
			},
			success: function(data) {	
				var now_time = new Date().getTime()/1000;
				$scope.coupon_status_list = data.data.list;
				angular.forEach($scope.coupon_status_list, function(data) {
					if(data.status == 1) {

						if(data.time_valid == 1 && now_time > data.time_valid_end) {
							$scope.no_time_num.push(data);
						} else {
							$scope.no_use_num.push(data);
						};

					} else if(data.status == 2) {
						$scope.have_use_num.push(data);
					} else if(data.status == -2) {
						$scope.no_time_num.push(data);
					};
				});
				$scope.$apply();
			},
			error: function() {
				alert('网络错误，请您刷新重试')
			}
		});

		//初始化 第一个即可用的显示
		$(".coupon-line ul li").eq(0).css('background', '#F53737');
		$(".coupon-status-name ul li").eq(0).css('color', '#F53737');
		$scope.ke_yong = true;
		$scope.yi_shi_yong = false;
		$scope.yi_guo_qi = false;
	};

	$scope.init();

	$scope.no_use = function(target) {
		$(".coupon-line ul li").eq(0).css('background', '#F53737');
		$(".coupon-status-name ul li").eq(0).css('color', '#F53737');
		$(target.target).addClass('active').siblings().removeClass('active');
		$($(".coupon-line ul li")[$(target.target).index()]).addClass('active').siblings().removeClass('active');
		$scope.ke_yong = true;
		$scope.yi_shi_yong = false;
		$scope.yi_guo_qi = false;
	};
	$scope.have_use = function(target) {
		$(".coupon-line ul li").eq(0).css('background', '#333333');
		$(".coupon-status-name ul li").eq(0).css('color', '#333333');
		$(target.target).addClass('active').siblings().removeClass('active');
		$($(".coupon-line ul li")[$(target.target).index()]).addClass('active').siblings().removeClass('active');
		$scope.ke_yong = false;
		$scope.yi_shi_yong = true;
		$scope.yi_guo_qi = false;

	};
	$scope.no_time = function(target) {
		$(".coupon-line ul li").eq(0).css('background', '#333333');
		$(".coupon-status-name ul li").eq(0).css('color', '#333333');
		$(target.target).addClass('active').siblings().removeClass('active');
		$($(".coupon-line ul li")[$(target.target).index()]).addClass('active').siblings().removeClass('active');
		$scope.ke_yong = false;
		$scope.yi_shi_yong = false;
		$scope.yi_guo_qi = true;
	};

}]);