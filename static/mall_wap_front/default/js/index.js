// 2   底部的跳转

var mm = angular.module('mm', []);

mm.controller('mmController-two', ['$scope', '$window', '$interval', '$timeout', function($scope, $window, $interval, $timeout) {
	$scope.qingzi = function(url) {
		$window.location.href = HOST + url;
	};
	$scope.miyue = function(url) {
		$window.location.href = HOST + url;
	};
	$scope.xialing = function(url) {
		$window.location.href = HOST + url;
	};
	$scope.huwai = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	$scope.activity_show = false;

	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.goto = function(url) {
		$window.location.href = url;
	};

	// -------------------------添加到购物车相关的代码 -------------------------------
	// !!!!!!!!!!!!!!!!!!!!!!!!(严禁随意修改内部内容)!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	$scope.cargo_goods = null;
	$scope.cargo_stocks = [];
	$scope.cargo_stock_styles_flag = {};
	$scope.cargo_select_stock = null;
	$scope.cargo_buy_num = 1;
	$scope.cargo_stock_num = 0;
	$scope.cargo_handle_type = null; // add 添加到购物车 buy 直接购买

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

	}

	function touchmove(e) {
		e = e || window.event;
		e.preventDefault();
		e.stopPropagation();
	};
	$scope.showStocks = function(type) {
		$scope.cargo_handle_type = type;

		if(type == 'buy') {
			$("#carge_submit").text("立即购买");
		} else {
			$("#carge_submit").text("加入购物车");
		}

		$('.mask').show();
		$('.cart-shopping-cart-layer').slideDown(200);
		$("html,body").addClass('fuceng-fixed')
			//遮罩层问题 （遮罩层出来  后面不能滑动）
			//		document.getElementById("mask").addEventListener('touchmove', touchmove, false);
			//		document.getElementById("cart-shopping-cart-layer").addEventListener('touchmove', touchmove, false);
	}

	$scope.hideStocks = function() {
		$('.mask').hide();
		$('.cart-shopping-cart-layer').slideUp(200);
		$("html,body").removeClass('fuceng-fixed')
	}

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

		//	console.log($scope.cargo_stock_styles_flag);

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/goods/" + goodsID + "/stocks"),
			async: true,
			data: {
				"c_id": TBMM.getUID()
			},
			dataType: 'json',
			success: function(data) {
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

		if($scope.cargo_handle_type == 'buy') {

			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/gorder/create"),
				async: true,
				dataType: 'json',
				data: {
					"c_id": TBMM.getUID(),
					"goods_list": JSON.stringify([{
						"id": $scope.goods._id,
						"num": $scope.cargo_buy_num,
						"stock_id": $scope.cargo_select_stock.id
					}]),
				},
				success: function(data) {
					if(data.code == 0) {

						$scope.hideStocks();
						window.location.href = HOST + '/pay/gorder.html?seq=' + data.data.seq;

					} else {
						TBMM.ajaxHandle(data)
					}
				},
				error: function() {
					console.log("数据获取错误");
				}
			});
		} else {
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
						//alert("添加到购物车成功!");

						$scope.alert = {
							on: true,
							type: '',
							icon: 'success',
							buttonStyle: 'none', // 'single', 'double', 'none'
							message: '已添加到购物车'
						}

						$scope.$apply();

						setTimeout(function() {
							$scope.alert.on = false;
							$scope.$apply()
						}, 800);

					} else {
						TBMM.ajaxHandle(data)
					}
				},
				error: function() {
					console.log("数据获取错误");
				}
			});
		}

	}

	// ---------------------- 添加到购物车相关的代码 - 结束 -------------------------------

	$scope.joincar = function(e, goodsID, name, cover, sku_specs, sku_styles) {

		e = event || window.event;
		e.stopPropagation();
		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		} else {
			$scope.cargo_goods = {
				id: goodsID,
				name: name,
				cover: cover,
				sku_specs: sku_specs || [],
				sku_styles: sku_styles || {}
			};

			//	console.log($scope.cargo_goods);
			$scope.showStocks();
			$scope.initStocks(goodsID);
		};
	};

	$scope.init = function() {
		FastClick.attach(document.body); //手机浏览器300ms延迟快速点击 导致还会滑动
		$scope.g_loading = true;
		// 页面加载完成时
		$window.onload = function() {
			$scope.g_loading = false;
		};
		var timer = $interval(function() {
			$scope.now_time = new Date().getTime() / 1000; //获取当前的时间 转换成秒（因为这里后台数据是秒的格式）
		}, 1000);
		$scope.footer_active = 'mall';
		$.ajax({
			type: "get",
			url: HOST_API + "/company/conf",
			async: true,
			data: {
				"elements": '["ad_slides", "nav_btns", "seckill"]'
			},
			success: function(data) {
				var dataObject = JSON.parse(data);

				$scope.acti_detail = dataObject.data.seckill;
				//if type=1  跳到列表   否则跳到详情
				if($scope.acti_detail && $scope.acti_detail.type == 1) {
					//  获得最新的秒杀活动
					$.ajax({
						type: "get",
						url: TBMM.genApiUrl("/activity/seckill/rencent/one"),
						data: {},
						async: true,
						dataType: 'json',
						success: function(data) {
							$scope.acti_list = data.data;

							if($scope.acti_list) {
								$scope.activity_show = true;
							}

						},
						error: function() {
							console.log("数据获取错误");
						}
					});
				} else if($scope.acti_detail) {
					$scope.link_detail = $scope.acti_detail.activity;
					if($scope.link_detail) {
						$scope.activity_show = true;
					}
				};
				$scope.picShuzu = dataObject.data.ad_slides.items; //一个数组	
				$scope.$apply();
				//跟detail中的一样 等数据加载完成
				var mySwiper = new Swiper('.swiper-container', {
					autoplay: 1500, //可选选项，自动滑动
					pagination: '.swiper-pagination',
					loop: true
						//		observer: true, //修改swiper自己或子元素时，自动初始化swiper
						//		observeParents: true //修改swiper自己或父元素时，自动初始化swiper
				});
			},
			error: function(e) {
				console.log("首页头部数据出现了错误", e);
				$('.swiper-container').html('数据出现了错误');
			}
		});

		$.ajax({
			type: "get",
			url: HOST_API + "/goods/page",
			async: true,
			dataType: 'json', //给的字符串，写这句话 可以不用parse转换成对象；这句话自带转成对象
			data: {
				'ps': 50,
				'p': 1
			},
			success: function(data) {
				//	$scope.picProduct = data.data.list; // 数组
				//	拿到所有的id

				var arr = data.data.list;
				var index = -1;
				var tmpDict = {};
				var newData = [];
				for(var i = 0; i < arr.length; i++) {

					if(!arr[i].groups || arr[i].groups.length == 0) {
						continue;
					}

					for(var j = 0; j < arr[i].groups.length; j++) {
						var group_id = arr[i].groups[j]._id;
						var group_name = arr[i].groups[j].name;
						if(typeof tmpDict[group_id] == 'undefined') {
							newData.push({
								"group_id": group_id,
								"group_name": group_name,
								"list": [arr[i]]
							});
							index++;
							tmpDict[group_id] = index;
						} else {
							newData[tmpDict[group_id]]['list'].push(arr[i]);
						}
					}

				}
				$scope.classID = newData;
				$scope.$apply();

				// 必须指定container否则监听window的scroll失败
				$(".scrollLoading").scrollLoading({
					"container": $(".wrapper")
				});
			},
			error: function(e) {
				console.log("商品信息获取错误", e);
				console.log('数据出现了错误');

			}
		});
		$scope.ling_qu = false;
		$scope.ling_qu_code = false;
		$scope.ling_qu_success = false;
		$scope.ling_qu_failed = false;
		//初始化系统的优惠券(首页展示优惠券)
		$.ajax({
			type: "get",
			url: HOST_API + "/scoupons/page",
			async: true,
			dataType: 'json',
			data: { //全是默认
				//				"status": 0
				//				"start": 0,
				"limit": 30
			},
			success: function(data) {
				if(data.code == 0) {
					$scope.coupon_list = data.data.list;
					//	console.log($scope.coupon_list)
					$scope.$apply();
					var myScroll = new IScroll('#wrapper', {
						mouseWheel: true,
						scrollY: false,
						scrollX: true
					});

					var margin_left = parseFloat($("#scroller li").eq(0).css('margin-left'));
					var scroll_ul_width = ($("#scroller li").eq(0).width() + margin_left) * ($("#scroller li").length);
					$("#scroller").width(scroll_ul_width + margin_left);
					myScroll.refresh();
				} else {
					TBMM.ajaxHandle(data);
				};

			},
			error: function() {
				alert('系统优惠券初始获取错误');
			}
		});

	};

	$scope.init();
	//首页领取优惠券
	$scope.close_exchange = function() {
		$scope.ling_qu = false;
		$scope.ling_qu_code = false;
		$scope.code_close = false;
		$(".input-content").css('visibility', 'hidden');
	};
	var updata = null;
	$scope.pick = function(type) {

		$.ajax({
			type: "post",
			//url: HOST_API + "/scoupons/pick",
			url: TBMM.genApiUrl("/scoupons/pick"),
			async: true,
			dataType: 'json',
			data: updata,
			success: function(data) {
				if(data.code == 0) {
					if(type == 2) {
						$scope.ling_qu_code = false;
						$scope.code_close = false;
						$(".input-content").css('visibility', 'hidden');
					};

					$scope.ling_qu_success = true;
					$timeout(function() {
						$scope.ling_qu = false;
						$scope.ling_qu_success = false;
					}, 2000);
				} else if(data.code == -1) {
					if(type == 2) {
						$scope.ling_qu_code = false;
						$scope.code_close = false;
						$(".input-content").css('visibility', 'hidden');
					};
					$scope.coupon_message = data.message;
					$scope.ling_qu_failed = true;
					$timeout(function() {
						$scope.ling_qu = false;
						$scope.ling_qu_failed = false;
					}, 2000);
				};

			},
			error: function(data) {
				alert('网络原因无法领取此优惠券，请您刷新重试');
			}
		});
	};
	$scope.get_coupon = function(id, type, dui_huan_code) {
		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		};

		$.ajax({
			type: "post",
			url: TBMM.genApiUrl("/scoupons/pick/check"),
			async: true,
			data: {
				'sys_coupon_id': id
			},
			dataType: 'json',
			success: function(data) {
				$scope.ling_qu = true;
				if(data.data.times == 0) { //表示可以领取
					//			type:1 普通领取  type:2 兑换码领取
					if(type == 1) {

						updata = {
							"sys_coupon_id": id
						};
						$scope.pick(1);
					}
					if(type == 2) {
						$scope.ling_qu_code = true;
						$scope.code_close = true;
						//以下定时器是因为可能性能原因出现不同步
						$timeout(function() {
							$(".input-content").css('visibility', 'visible');
							$(".input-content input").val(''); // focus手机不好使 pc好使
						}, 100);

						$scope.exchange = function() {
							if($(".shu-ru-neirong").val() == '') {
								alert('请输入兑换码')
							} else {
								updata = {
									"sys_coupon_id": id,
									"exchange_code": $(".shu-ru-neirong").val() //弹出框中的兑换码
								};
								$scope.pick(2);
							};
						};
					};

				} else {
					$scope.coupon_message = '您已经领过此优惠券';
					$scope.ling_qu_failed = true;
					$timeout(function() {
						$scope.ling_qu = false;
						$scope.ling_qu_failed = false;
					}, 2000);
				};
				//	console.log(data)
			},
			error: function() {
				alert('网络异常请刷新重试')
			},
		});

	};
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

}]);

//  头部header 在滑动时的效果

window.onscroll = function() {
	if(document.body.scrollTop > 20) {
		$('header').addClass('active');
		$('.search-input').addClass('active')
	} else {
		$('header').removeClass('active');
		$('.search-input').removeClass('active')
	};
};

$(function() {
	wxShare("途伴旅行家", "致力于打造瑞士旅游第一品牌，力荐定制游、亲子游、蜜月游、夏令营、户外活动等~", "");
	/*$.ajax({
		type: "GET",
		url: HOST_API + '/weixin/jsSign',
		data: {
			'url': location.href.split("#")[0]
		},
		dataType: 'json',
		success: function(data) {
			var sign = data.data;
			wx.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: sign.appId, // 必填，公众号的唯一标识
				timestamp: sign.timestamp, // 必填，生成签名的时间戳
				nonceStr: sign.nonceStr, // 必填，生成签名的随机串
				signature: sign.signature, // 必填，签名，见附录1
				jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});

			var title = "途伴旅行家";
			var desc = ;
			var imgUrl = "";

			// 分享内容设置
			wx.ready(function() {
				wx.onMenuShareTimeline({
					title: title, // 分享标题
					desc: desc, // 分享描述
					imgUrl: imgUrl,
					success: function() {
						console.log("分享成功");
					},
					cancel: function() {
						console.log("取消分享");
					}
				}); // 分享到朋友圈
				wx.onMenuShareAppMessage({
					title: title, // 分享标题
					desc: desc, // 分享描述
					imgUrl: imgUrl,
					success: function() {
						console.log("分享到朋友圈成功");
					},
					cancel: function() {
						console.log("取消分享到朋友圈");
					}
				}); // 分享给朋友
				wx.onMenuShareQQ({
					title: title, // 分享标题
					desc: desc, // 分享描述
					imgUrl: imgUrl,
					success: function() {
						console.log("分享到QQ成功");
					},
					cancel: function() {
						console.log("取消分享到QQ");
					}
				}); // 分享到QQ
				wx.onMenuShareWeibo({
					title: title, // 分享标题
					desc: desc, // 分享描述
					imgUrl: imgUrl,
					success: function() {
						console.log("分享到腾讯微博成功");
					},
					cancel: function() {
						console.log("取消分享到腾讯微博");
					}
				});
				// 分享到腾讯微博
				wx.onMenuShareQZone({
					title: title, // 分享标题
					desc: desc, // 分享描述
					imgUrl: imgUrl,
					success: function() {
						console.log("分享到QQ空间成功");
					},
					cancel: function() {
						console.log("取消分享到QQ空间");
					}
				}); // 分享到腾讯微博
			});

		},
		error: function(jqXHR, textStatus, errorThrown) {

		}
	});*/

});