var activities = angular.module('activities', []);

activities.controller('activitiesController', ['$scope', '$window', '$interval', function($scope, $window, $interval) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.init = function() {
		$scope.g_loading = true;	
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/activity/seckills/page"),
			async: true,
			data: {},
			dataType: 'json',
			success: function(data) {
				$scope.act_list = data.data.list;
				$scope.$apply();		
				$scope.g_loading = false;
				var timer = $interval(function() {
					$scope.now_time = new Date().getTime() / 1000; //获取当前的时间 转换成秒（因为这里后台数据是秒的格式）
				}, 1000);
			},
			error: function() {

				console.log("数据获取错误");
			}
		});
	};
	$scope.init();

	
	/* ----------------------下边注释掉的代码 不要 随意 删掉 ------------------------------------------*/
	// 时间转化 时分秒   
	//	$scope.formatSeconds = function(value) {
	//		var theTime = parseInt(value); // 秒 
	//		var theTime1 = 0; // 分 
	//		var theTime2 = 0; // 小时 
	//		if(theTime > 60) {
	//			theTime1 = parseInt(theTime / 60);
	//			theTime = parseInt(theTime % 60);
	//			if(theTime1 > 60) {
	//				theTime2 = parseInt(theTime1 / 60);
	//				theTime1 = parseInt(theTime1 % 60);
	//			}
	//		}
	//		var result = parseInt(theTime) + "秒";
	//		if(theTime1 > 0) {
	//			result = parseInt(theTime1) + "分" + result;
	//		}
	//		if(theTime2 > 0) {
	//			result = parseInt(theTime2) + "时" + result;
	//		}
	//		return result;
	//	};

	//  将 时  分 秒 分别 分开  。。
	$scope.get_hour = function(value) {
		var h = parseInt(value / 3600);
		if(h < 10) {
			h = '0' + h;
		};
		return h;
	};
	$scope.get_minite = function(value) {
		var m = parseInt((value / 3600 - parseInt(value / 3600)) * 60);
		if(m < 10) {
			m = '0' + m;
		};
		return m;
	};

	$scope.get_seconds = function(value) {
		var s = Math.floor(((value / 3600 - parseInt(value / 3600)) * 60 - parseInt((value / 3600 - parseInt(value / 3600)) * 60)) * 60);
		if(s < 10) {
			s = '0' + s;
		};
		return s;
	};
	// 页面加载完成时

}]);