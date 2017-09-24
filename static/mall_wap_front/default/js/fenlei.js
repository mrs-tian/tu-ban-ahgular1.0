var feileiapp = angular.module('fenleiapp', []);

feileiapp.controller('fenlei-controller', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'category';

	$scope.category = [];
	$scope.category_index = {};

	$scope.init = function() {
	$scope.g_loading = true;
		$.ajax({
			type: 'GET',
			url: TBMM.genApiUrl("/goods/page"),
			data: {
				'ps': 100,
				'p': 1
			},
			success: function(data) {
				if(data.code == 0) {
					
					var index = 0;
					// 按类别归类商品
					for(var i = 0; i < data.data.list.length; i++) {
						var goods = data.data.list[i];		
						if(typeof $scope.category_index[goods.category._id] === 'undefined') {
							$scope.category.push({
								_id: goods.category._id,
								name: goods.category.name,
								goods_list: [goods]
							});
							$scope.category_index[goods.category._id] = index++;
						} else {
							$scope.category[$scope.category_index[goods.category._id]].goods_list.push(goods);
						}
					};
			//		console.log($scope.category)

					// 用于改变样式
					//判断是不是第一个   为什么在css里写或者eq(0)不好使 我也不清楚
					$scope.name = $scope.category[0].name;

					// 1  点击左边  右边滑动

					$('.category-left ul').on('click', 'li', function() {
						$('.category-right').unbind('scroll'); //解除绑定 scroll绑定 要不li会抖动
						$(this).addClass('click-on').siblings().removeClass('click-on').addClass('click-no');
						var now_index = $(this).index();
						var now_ul = $('.category-right ul').eq(now_index);
						var prev_li = now_ul.prevAll('ul').find('li');
						var top = prev_li.length * prev_li.height();
						$('.category-right').animate({
							'scrollTop': top
						}, 100, function() {
							$('.category-right').scroll(function() {
								var li_height = $('.category-right ul').find('li').height();
								var scroll_top = $(this).scrollTop() + li_height / 1.2; //加接近一个li的高度为了优化接近下一个时提前转换左边li的样式	
								var num = scroll_top / li_height;
								$('.category-right ul').each(function() {
									var prev_ul_length = $(this).prevAll('ul').find('li').length;
									var now_ul_length = $(this).find('li').length;
									if(prev_ul_length < num && num < prev_ul_length + now_ul_length) {
										$('.category-left ul li').eq($(this).index()).addClass('click-on').siblings().removeClass('click-on').addClass('click-no');
									};

								});

							});
						});

					});

					// 2  滑动右边  左边改变

					$('.category-right').scroll(function() {
						var li_height = $('.category-right ul').find('li').height();
						var scroll_top = $(this).scrollTop() + li_height / 1.2;
						var num = scroll_top / li_height;
						$('.category-right ul').each(function() {
							var prev_ul_length = $(this).prevAll('ul').find('li').length;
							var now_ul_length = $(this).find('li').length;
							if(prev_ul_length < num && num < prev_ul_length + now_ul_length) {
								$('.category-left ul li').eq($(this).index()).addClass('click-on').siblings().removeClass('click-on').addClass('click-no');
							};

						});

					});
					$scope.g_loading = false;  //这个地方 必须放在传递之前  ，  我也不知道为什么  如果之后loading图会不消失
					$scope.$apply();		
					initImgHandle();			
				} else {
					TBMM.ajaxHandle(data);
					return;
				};
			},
			error: function() {
				console.log('Error')
			},
			dataType: 'json'
		});

	}

	$scope.init();
	
	function initImgHandle() {
		//$(".pd-introduce img").addClass("img_lock");

		// 必须指定container否则监听window的scroll失败
		$(".scrollLoading").scrollLoading({
			"container": $(".category-right")
		});
	}

}]);