var search_app = angular.module('search-app', []);
search_app.controller('search-controller', ['$scope', '$window', function($scope, $window) {
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	function initImgHandle() {
		//$(".pd-introduce img").addClass("img_lock");

		// 必须指定container否则监听window的scroll失败
		$(".scrollLoading").scrollLoading({
			"container": $(".search-detail-left")
		});
	};
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};
	
	$scope.init_show = true;
	$scope.no_search_result = false;
	$scope.recent_search = true;
	$scope.have_search_result = false;
	$scope.clear = function() {
		
		localStorage.removeItem('recent-search');
		$scope.recent_search = false;
	};
	//  热门搜索

	//	$scope.paganition = function() {
	//		alert(1)
	//	};

	// 热门搜索(猜你喜欢)

	//	$.ajax({
	//		type: "get",
	//		url: TBMM.genApiUrl("/goodss/related"),
	//		async: true,
	//		data: {
	//			"ids":
	//		},
	//		success: function() {
	//
	//			$scope.isLoading = false;
	//
	//			if(data.code == 0) {
	//				console.log(data);
	//			} else {
	//				TBMM.ajaxHandle(data);
	//				return;
	//			};
	//			$scope.$apply();
	//		},
	//		error: function() {
	//			console.log("cuowi ");
	//		}
	//	});

	//   获得搜索的商品
	
		Array.prototype.unique3 = function() {
								var res = [];
								var json = {};
								for(var i = 0; i < this.length; i++) {
									if(!json[this[i]]) {
									res.push(this[i]);
									json[this[i]] = 1;
										}
								}
							return res;
						};
	
	var data_recent;
	$scope.init_search = function() {	
		
		if(localStorage.getItem('recent-search')) {
			data_recent = JSON.parse(localStorage.getItem('recent-search'));
			$scope.data_recent = data_recent;
		} else {
			data_recent = [];
		};
		
	};

	$scope.search = function() {

		var input_val = $('.search-div-one input').val();
		if(input_val.length == 0) {
			$scope.alert = {
				on: true,
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '输入内容不能为空'
			};

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);
		} else {
			$.ajax({
				type: "get",
				url: TBMM.genApiUrl("/goods/page"),
				async: true,
				dataType: 'json',
				data: {
					"ps": 10,
					"p": 1,
					"key": input_val
				},
				success: function(data) {

					$scope.isLoading = false;

					if(data.code == 0) {
						var data_list = data.data.list;
						if(data_list.length == 0) {
							$scope.init_show = false;
							$scope.have_search_result = false;
							$scope.no_search_result = true;
							$scope.search_goods = input_val;
						} else {
							$scope.data_list = data_list;
							$scope.init_show = false;
							$scope.no_search_result = false;
							$scope.have_search_result = true;

							data_recent.push(input_val);
							data_recent=data_recent.unique3();
							localStorage.setItem('recent-search', JSON.stringify(data_recent));
						    $scope.init_search();
						};

						$scope.$apply();
						initImgHandle();
					} else {
						TBMM.ajaxHandle(data);
						return;
					};
				},
				error: function() {
					$scope.alert = {
						on: true,
						icon: 'error',
						buttonStyle: 'none', // 'single', 'double', 'none'
						message: '获取数据错误'
					};

					$scope.$apply();

					setTimeout(function() {
						$scope.alert.on = false;
						$scope.$apply()
					}, 1500);
				}
			});
		};

	};
	$scope.search_tiaozhuan = function(target) {
		// $(target.currentTarget).html()  这是jq取当前元素  比较简单
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/goods/page"),
			async: true,
			dataType: 'json',
			data: {
				"ps": 10,
				"p": 1,
				"key": target.currentTarget.innerHTML // 这里用了原生js方法
			},
			success: function(data) {

				$scope.isLoading = false;

				if(data.code == 0) {
					var data_list = data.data.list;
					$scope.data_list = data_list;
					if($scope.data_list.length == 0) {
						$scope.init_show = false;
						$scope.have_search_result = false;
						$scope.no_search_result = true;
					} else {

						$scope.init_show = false;
						$scope.no_search_result = false;
						$scope.have_search_result = true;
					};

					$scope.$apply();
					initImgHandle();
				} else {
					TBMM.ajaxHandle(data);
					return;
				};
			},
			error: function() {
				$scope.alert = {
					on: true,
					icon: 'error',
					buttonStyle: 'none', // 'single', 'double', 'none'
					message: '获取数据错误'
				};

				$scope.$apply();

				setTimeout(function() {
					$scope.alert.on = false;
					$scope.$apply()
				}, 1500);
			}
		});
	};
	$scope.init_search();
}]);

$(document).ready(function(){
	
	$('#testinput').focus();
//	alert(1)
});
