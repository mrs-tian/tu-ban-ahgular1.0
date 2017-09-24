var activities_detail = angular.module('activities-detail', []);

activities_detail.controller('activities-detail-Controller', ['$scope', '$window', '$interval', function($scope, $window, $interval) {
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.init = function() {
		FastClick.attach(document.body);//手机浏览器300ms延迟快速点击 导致还会滑动
		$(".swiper-container").width($(window).width());
		$(".swiper-container").height($(window).width());
		$scope.g_loading = true;
		var timer = $interval(function() {
			$scope.now_time = new Date().getTime() / 1000; //获取当前的时间 转换成秒（因为这里后台数据是秒的格式）
		}, 1000);
		var actID = $.query.get('aid');
		$scope.cargo_buy_num = 1;
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/activity/seckill/" + actID),
			async: true,
			data: {},
			dataType: 'json',
			success: function(data) {
				if(data.code == 0) {
					$scope.act_detail = data.data;
					$scope.get_goods();

					// 初始化微信分享
					wxShare("途伴-" + $scope.act_detail.name, $scope.act_detail.desc, $scope.act_detail.cover ? HOST_IMAGE + "/" + $scope.act_detail.cover + "@200w" : null);

					$scope.$apply();

				} else {

					TBMM.ajaxHandle(data)
				};

			},
			error: function() {
				console.log("数据获取错误");
			}
		});

	};

	$scope.init();

	function touchmove(e) {
		e = e || window.event;
		e.preventDefault();
		e.stopPropagation();
	};

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

	$scope.get_goods = function() {
		var is_loop;
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/goods/" + $scope.act_detail.sku.g_id + "/info"),
			dataType: 'json',
			async: true,
			data: {},
			success: function(data) {
				var data = data.data;
				$scope.img_box = data.images;
				$scope.param_label = data.param_label;
				$scope.saled_label = data.saled_label;
				if(data.page_tpl) {
					data.desc = data.page_tpl.header + data.desc + data.page_tpl.footer;
				}
				var desc = TBMM.genScrollImgHtml(data.desc);
				var param_desc = TBMM.genScrollImgHtml(data.param_desc);
				var saled_desc = TBMM.genScrollImgHtml(data.saled_desc);
				$("#g_desc").html(desc);
				$("#g_param_desc").html(param_desc);
				$("#g_saled_desc").html(saled_desc);
				$scope.$apply();
				$scope.g_loading = false;
				initImgHandle();
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

				var pdIntroduceUl = $('.pd-introduce-ul');
				var pdIntroduceUl_top = pdIntroduceUl.offset().top;

				function on_scroll() {
					window.onscroll = function() {
						if(document.body.scrollTop > pdIntroduceUl_top) {
							pdIntroduceUl.addClass('fixededone');
						} else {
							pdIntroduceUl.removeClass('fixededone');
						};

					};
				};

				if(isSupportSticky()) {

					pdIntroduceUl.addClass('sticky');

				} else {
					on_scroll();
				};

				if($scope.img_box.length > 1) {
					is_loop = true;
				} else {
					is_loop = false;
				};
				var mySwiper = new Swiper('.swiper-container', {
					autoplay: 1500, //可选选项，自动滑动
					pagination: '.swiper-pagination',
					loop: is_loop
						//  observer: true, //修改swiper自己或子元素时，自动初始化swiper
						//	observeParents: true //修改swiper自己或父元素时，自动初始化swiper
				});

			},
			error: function() {
				console.log("获取商品信息错误");
			}
		});
	};
	$scope.cargo_submit = function(goods_id, stock_id, act_id) {
		$window.location.href = HOST + "/pay/gorder.html?activity_id=" + act_id + "&g_list=" + encodeURIComponent(JSON.stringify([{
			"id": goods_id,
			"num": $scope.cargo_buy_num,
			"stock_id": stock_id
		}]));
	};
	$scope.choose_num = function() {
		$(".act-mask").slideDown(100);
		$(".act-goto-buy").slideDown(100);
		//遮罩层问题 （遮罩层出来  后面不能滑动）
		document.getElementById("act-mask").addEventListener('touchmove', touchmove, false);
		document.getElementById("act-goto-buy").addEventListener('touchmove', touchmove, false);
	};
	$scope.close_buy = function() {
		$(".act-mask").hide();
		$(".act-goto-buy").hide();
	};

	$scope.cargo_minus = function() {
		if($scope.cargo_buy_num > 1) {
			$scope.cargo_buy_num--;
		}
	};

	$scope.cargo_plus = function() {
		if($scope.cargo_buy_num < $scope.act_detail.per_limit) {
			$scope.cargo_buy_num++;
		}
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

	function initImgHandle() {
		//$(".pd-introduce img").addClass("img_lock");

		// 必须指定container否则监听window的scroll失败
		$(".scrollLoading").scrollLoading({
			"container": $(window)
		});
	};

	function initWeixinShare(title, desc, imgUrl) {

		var title = title || "途伴旅行家";
		var desc = desc || "致力于打造瑞士旅游第一品牌，力荐定制游、亲子游、蜜月游、夏令营、户外活动等~";
		var imgUrl = imgUrl || "http://static.tubban.com.cn/public/image/FullBg300.jpg";

		$.ajax({
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
		});
	};
	// 页面加载完成时
	//$window.onload = function() {
	//	
	//	$scope.$apply();
	//};
}]);