// 1 配置不同设备的字体及其大小的适配 及其 iscroll的使用组合

var docEl = document.documentElement,
	resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
	recalc = function() {
		var myfontSize = 10 * (docEl.clientWidth / 320);

		if(myfontSize > 30) {
			docEl.style.fontSize = "30px";
			
		} else {
			docEl.style.fontSize = 10 * (docEl.clientWidth / 320) + 'px';
		};
	};

window.addEventListener(resizeEvt, recalc, false);
document.addEventListener('DOMContentLoaded', recalc, false);

// Ajax交互锁定
$(document).ajaxStart(function() {
	$(".ajax_btn").addClass("locked", true);
}).ajaxStop(function() {
	$(".ajax_btn").removeClass("locked", false);
});

function isWeixin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
};

// 微信分享
function wxShare(title, desc, imgUrl) {

	if(!isWeixin()) {
		return true;
	};

	var title = title || "途伴旅行家";
	var desc = desc || "途伴旅行家致力于打造瑞士旅游第一品牌，力荐定制游、亲子游、蜜月游、夏令营、户外活动等~";
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
					title: title + desc, // 分享标题
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


