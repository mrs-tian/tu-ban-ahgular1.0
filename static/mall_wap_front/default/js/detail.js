var detail = angular.module('detail', ['ngSanitize']);

function initWxShare(goods) {
	wxShare("途伴-" + goods.name, goods.brief, goods.cover ? HOST_IMAGE + "/" + goods.cover + "@200w" : null);
}

function initKefu(data) {

	var user = JSON.parse(localStorage.getItem("user"));

	if(user) {
		var prepare = function() {
			// 轻量级CRM基础配置信息, 可选
			ysf.config({
				uid: user['id'],
				name: user['nickname'] + " " + user['realname'],
				email: user['email'],
				mobile: user['mobile']
			});

			// 商品链接接入接口
			ysf.product({
				show: 1, // 1为打开， 其他参数为隐藏（包括非零元素）
				title: data['name'] + " (" + data['code'] + ")",
				desc: data['brief'],
				picture: HOST_IMAGE + "/" + data['cover'] + "@100h",
				note: "原价：" + data['price']['o'] + ", 现价：" + data['price']['c'],
				url: window.location.href
			});
		}

		prepare();
		ysf.open(); // 或location.href = ysf.url();

	} else {

		var prepare = function() {

			// 商品链接接入接口
			ysf.product({
				show: 1, // 1为打开， 其他参数为隐藏（包括非零元素）
				title: data['name'] + " (" + data['code'] + ")",
				desc: data['brief'],
				picture: HOST_IMAGE + "/" + data['cover'] + "@100h",
				note: "原价：" + data['price']['o'] + ", 现价：" + data['price']['c'],
				url: window.location.href
			});
		}

		prepare();
		ysf.open(); // 或location.href = ysf.url();
	}

}

function initImgHandle() {
	//$(".pd-introduce img").addClass("img_lock");

	// 必须指定container否则监听window的scroll失败
	$(".scrollLoading").scrollLoading({
		"container": $(window)
	});
}

detail.controller('detailController', ['$scope', '$window', function($scope, $window) {
	$scope.g_loading = true;
	//一般情况下这么写   但是为了避免例如其他外部资源加载时候不可控延长时间（如七鱼客服），这里不这么写，写在数据请求成功时候消失；
	//	$window.onload = function() {
	//		$scope.g_loading = false;
	//		$scope.$apply();
	//	};
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'mall';

	// -------------------------添加到购物车相关的代码 -------------------------------
	// !!!!!!!!!!!!!!!!!!!!!!!!(严禁随意修改内部内容)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	$scope.cargo_goods = null;
	$scope.cargo_stocks = [];
	$scope.cargo_select_stock = null;
	$scope.cargo_stock_styles_flag = {};
	$scope.cargo_buy_num = 1;
	$scope.cargo_stock_num = 0;
	$scope.cargo_handle_type = null; // add 添加到购物车 buy 直接购买
	$scope.cargo_cart_num = 0; // 购物车内总数目

	$scope.cargoStockStyleSelect = function(spec, style) {

		for(var i = 0; i < $scope.cargo_goods.sku_styles[spec].length; i++) {

			var _style = $scope.cargo_goods.sku_styles[spec][i];

			$scope.cargo_stock_styles_flag[spec + "_" + _style] = 0;

			if(style == _style) {
				$scope.cargo_stock_styles_flag[spec + "_" + _style] = 1;
			}

		};

		var cur_spec = $scope.getStockSpec();

		for(var i = 0; i < $scope.cargo_stocks.length; i++) {
			if($scope.cargo_stocks[i].spec == cur_spec) {
				$scope.cargo_select_stock = $scope.cargo_stocks[i];
				$scope.cargo_stocks[i].selected = 1;
			}
		}

	};

	$scope.showStocks = function(type) {

		$scope.cargo_handle_type = type;
		if(type == 'buy') {
			$("#carge_submit").text("立即购买");
		} else {
			$("#carge_submit").text("加入购物车");
		};
		$('.mask').show();
		$('.cart-shopping-cart-layer').slideDown(200);
		$("html,body").addClass('fuceng-fixed');
	};

	$scope.initCartNum = function() {

		if(!TBMM.isLogin()) {
			return;
		};

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/gcart/" + TBMM.getUID() + "/itemNum"),
			async: true,
			data: {},
			dataType: 'json',
			success: function(data) {
				if(data.code == 0) {
					$scope.cargo_cart_num = data.data.num || 0;
					$scope.$apply();
				}
			},
			error: function() {
				console.log("数据有误");
			}
		});
	};

	$scope.hideStocks = function() {
		$('.mask').hide();
		$('.cart-shopping-cart-layer').slideUp(200);
		$("html,body").removeClass('fuceng-fixed')
	};

	$scope.getStockSpec = function() {

		var str = '';

		var first = true;

		for(var i = 0; i < $scope.cargo_goods.sku_specs.length; i++) {
			var spec = $scope.cargo_goods.sku_specs[i];

			for(var j = 0; j < $scope.cargo_goods.sku_styles[spec].length; j++) {
				var style = $scope.cargo_goods.sku_styles[spec][j];

				if($scope.cargo_stock_styles_flag[spec + '_' + style] == 1) {
					if(first) {
						str = style;
						first = false;
					} else {
						str = str + "*" + style;
					}
				}

			};

		};

		//	console.log(str);
		return str;
	}

	$scope.initStocks = function(goodsID) {

		// 清空原数据
		$scope.cargo_stocks = [];
		$scope.cargo_select_stock = null;
		$scope.cargo_buy_num = 1;
		$scope.cargo_stock_num = 0;
		$scope.cargo_handle_type = null; // add 添加到购物车 buy 直接购买
		$(".click-in").addClass("submit-disabled");

		// 清空原数据
		$scope.cargo_stocks = [];
		$scope.cargo_stock_num = 0;
		$scope.cargo_stock_styles_flag = {};

		// 构建规格样式选择字典

		for(var i = 0; i < $scope.cargo_goods.sku_specs.length; i++) {
			var spec = $scope.cargo_goods.sku_specs[i];

			var first = true;
			for(var j = 0; j < $scope.cargo_goods.sku_styles[spec].length; j++) {
				var style = $scope.cargo_goods.sku_styles[spec][j];
				if(first) {
					$scope.cargo_stock_styles_flag[spec + '_' + style] = 1;
				} else {
					$scope.cargo_stock_styles_flag[spec + '_' + style] = 0;
				}
				first = false;
			};

		};

		//		console.log($scope.cargo_stock_styles_flag);

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/goods/" + goodsID + "/stocks"),
			async: true,
			data: {
				"c_id": TBMM.getUID()
			},
			dataType: 'json',
			success: function(data) {
				$scope.g_loading = false; //数据请求成功马上消失  避免例如其他外部资源加载时候不可控延长时间
				var datalist = data.data.list;
				$scope.is_collected = data.data.is_collected;
				$scope.is_liked = data.data.is_liked;

				if($scope.is_collected) {
					$("#fav").addClass("on");
				}
				if($scope.is_liked) {
					$("#like").addClass("on");
				}

				$scope.cargo_stocks = datalist;

				var cur_spec = $scope.getStockSpec();
				var first = true;
				for(var i = 0; i < $scope.cargo_stocks.length; i++) {
					var stock_num = $scope.cargo_stocks[i].num - $scope.cargo_stocks[i].l_num;
					$scope.cargo_stock_num += stock_num;

					if($scope.cargo_stocks[i].spec == cur_spec) {
						$scope.cargo_select_stock = $scope.cargo_stocks[i];
						$scope.cargo_stocks[i].selected = 1;
					}
				}

				if($scope.cargo_stock_num > 0) {
					$(".click-in").removeClass("submit-disabled");
				}
				$scope.$apply();
			},
			error: function() {
				console.log("数据有误");
			}
		});

	}

	$scope.cargo_minus = function() {
		if($scope.cargo_buy_num > 1) {
			$scope.cargo_buy_num--;
		}
	}

	$scope.cargo_plus = function() {
		if($scope.cargo_select_stock.num - $scope.cargo_select_stock.l_num - $scope.cargo_buy_num > 0) {
			$scope.cargo_buy_num++;
		}
	}

	$scope.cargo_submit = function() {
		// 立即购买（根据类型来决定）
		if($scope.cargo_handle_type == 'buy') {

			$window.location.href = HOST + "/pay/gorder.html?g_list=" + encodeURIComponent(JSON.stringify([{
				"id": $scope.goods._id,
				"num": $scope.cargo_buy_num,
				"stock_id": $scope.cargo_select_stock.id
			}]))
			return;
		} else { //加入购物车
			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/gcart/addItem"),
				async: true,
				dataType: 'json',
				data: {
					"c_id": TBMM.getUID(),
					"stock_id": $scope.cargo_select_stock.id,
					"num": $scope.cargo_buy_num
				},
				success: function(data) {
					if(data.code == 0) {
						$scope.hideStocks();
						$scope.alert = {
							on: true,
							icon: 'success',
							buttonStyle: 'none', // 'single', 'double', 'none'
							message: '已添加到购物车'
						}

						$scope.cargo_cart_num += $scope.cargo_buy_num;

						$scope.$apply();

						setTimeout(function() {
							$scope.alert.on = false;
							$scope.$apply()
						}, 800);

					} else {
						TBMM.ajaxHandle(data)
					};
				},
				error: function() {
					console.log("数据获取错误");
				}
			});
		};

	};

	$scope.initCartNum();

	// ---------------------- 添加到购物车相关的代码 - 结束 -------------------------------

	$(document).ready(function() {
		FastClick.attach(document.body); //手机浏览器300ms延迟快速点击 导致还会滑动
		$(".swiper-container").width($(window).width());
		$(".swiper-container").height($(window).width());
		var goodsID = $.query.get('gid');
		$.ajax({
			type: "get",
			url: HOST_API + "/goods/" + goodsID + "/info", //这里边把goodsID传进去了  下边data不用传了
			async: true,
			dataType: "json",
			data: {}, //上边url传进去了  这里不用传了
			success: function(data) {

				if(-3 == data.code || -1 == data.code) {
					console.log(data.message);
				};
				if(data.code == 0) {

					var data = data.data; // 主要的数据
					if(data.page_tpl) {
						data.desc = data.page_tpl.header + data.desc + data.page_tpl.footer;
					}

					var desc = TBMM.genScrollImgHtml(data.desc);
					var param_desc = TBMM.genScrollImgHtml(data.param_desc);
					var saled_desc = TBMM.genScrollImgHtml(data.saled_desc);
					$("#g_desc").html(desc);
					$("#g_param_desc").html(param_desc);
					$("#g_saled_desc").html(saled_desc);
					$scope.goods = data;

					$scope.$apply();
					initImgHandle();

					//吸顶	必须在lunbo加载出来之后  要不取不到正常高度  因为ajax异步加载
					var pdIntroduceUl = $('.pd-introduce-ul');
					var pdIntroduceUl_top = pdIntroduceUl.offset().top;

					if(isSupportSticky()) {

						pdIntroduceUl.addClass('sticky');

					} else {
						on_scroll();
					};
					// 判断是否支持sticky属性（适应苹果6以上）
					function isSupportSticky() {
						var prefixTestList = ['', '-webkit-', '-ms-', '-moz-', '-o-'];
						var stickyText = '';
						for(var i = 0; i < prefixTestList.length; i++) {
							stickyText += 'position:' + prefixTestList[i] + 'sticky;';
						}
						// 创建一个dom来检查
						var div = document.createElement('div');
						var body = document.body;
						div.style.cssText = 'display:none;' + stickyText;
						body.appendChild(div);
						var isSupport = /sticky/i.test(window.getComputedStyle(div).position);
						body.removeChild(div);
						div = null;
						return isSupport;
					};
					//  对于现在不支持sticky属性的  例如pc和安卓 ，只能先用这个原始的方法（会跳动，并且只在滑动结束起作用，touchmove也是一样）
					function on_scroll() {
						window.onscroll = function() {
							if(document.body.scrollTop > pdIntroduceUl_top) {
								pdIntroduceUl.addClass('fixededone');
							} else {
								pdIntroduceUl.removeClass('fixededone');
							};

						};
					};
					//数组中取最大值

					//					var arr_pic_height = [];
					//					Array.prototype.maxup = function() {
					//						return Math.max.apply({}, this)
					//					};
					//
					//					$('.pic-show').each(function() {
					//
					//						arr_pic_height.push($(this).height());
					//
					//					});
					//					var maxup = arr_pic_height.maxup();

					//					$('.pic-show').each(function() {
					//						$(this).load(function(){
					//							$(this).css('min-height', maxup); //必须最小高度 
					//						});
					//						
					//					});

					//header 轮播 // 必须放在数据完成之后  要不会loop的时候出问题
					var lunbo_length = $('.lunbo').length;
					var is_loop;
					if(lunbo_length == 1) {
						is_loop = false;
					} else {
						is_loop = true;
					};
					var mySwiper = new Swiper('.swiper-container', {
						autoplay: 1500, //可选选项，自动滑动
						pagination: '.swiper-pagination',
						loop: is_loop
							//  observer: true, //修改swiper自己或子元素时，自动初始化swiper
							//	observeParents: true //修改swiper自己或父元素时，自动初始化swiper

					});
					$scope.cargo_goods = {
						id: $scope.goods._id,
						name: $scope.goods.name,
						cover: $scope.goods.cover,
						sku_specs: $scope.goods.sku_specs || [],
						sku_styles: $scope.goods.sku_styles || {}
					};

					$scope.initStocks($scope.cargo_goods.id);

					// 微信分享
					initWxShare(data);

				};
			},
			error: function() {

				console.log('商品信息获取错误');
			}
		});

		//tab切换

		$('.pd-introduce ul li').each(function() {
			$(this).click(function() {
				$(this).css('color', '#F53737');
				$(this).find('.red-line').css('display', 'block');
				$('.pic-show').eq($(this).index()).show();
				$(this).siblings('li').css('color', '#808080');
				$(this).siblings('li').find('.red-line').css('display', 'none');
				$('.pic-show').not($('.pic-show').eq($(this).index())).hide();

			});
		});

		//底部跳转
		var oFooter = $('.footer ul li');

		oFooter.eq(0).click(function() {
			initKefu($scope.goods);
		});

		oFooter.eq(1).click(function() {
			window.location.href = HOST + '/index.html';
		});

		oFooter.eq(2).click(function() {
			window.location.href = HOST + '/goods/shoppingcar.html';
		});
		oFooter.eq(3).click(function() {
			$scope.showStocks('add');
		});
		oFooter.eq(4).click(function() {
			$scope.showStocks('buy');
		});

		/* 商品点赞 */
		$("#like").click(function() {
			var gid;
			var type;
			gid = $(this).attr('gid');

			if($("#like").hasClass("on")) {
				type = 2;
			} else {
				type = 1;
			}

			$.post(
				TBMM.genApiUrl("/goods/" + gid + "/handle"), {
					"type": type,
					"uid": TBMM.getUID()
				},
				function(data) {
					try {
						if(data.code == 0) {
							$("#like").toggleClass("on");

							if(type == 1) {
								$scope.goods.r_num.like++;
								$scope.$apply();
							} else {
								$scope.goods.r_num.like--;
								$scope.$apply();
							}

						} else {
							TBMM.ajaxHandle(data);
						}
					} catch(e) {

					}
				}, 'json')
		});

		/* 收藏 */
		$("#fav").click(function() {
			var gid;
			var type;
			gid = $(this).attr('gid');

			if($("#fav").hasClass("on")) {
				type = 4;
			} else {
				type = 3;
			}

			$.post(
				TBMM.genApiUrl("/goods/" + gid + "/handle"), {
					"type": type,
					"uid": TBMM.getUID()
				},
				function(data) {
					try {
						if(data.code == 0) {
							$("#fav").toggleClass("on");
						} else {
							TBMM.ajaxHandle();
						}
					} catch(e) {

					}
				}, 'json')
		});

	});

}]);