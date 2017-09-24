var mine = angular.module('gorderMine', []);
mine.controller('gorderMineController', ['$scope', '$window', function($scope, $window) {

	var locked = false; // 考虑到ajax读取耗，防止在一次ajax读取过程中多次触发事件，造成多次加载内容。

	var params = {
		callback: function() {
			if(!locked) {
				$scope.loadData();
			}
		}
	};

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'profile';

	$scope.tab = 0;
	$scope.pager = {
		type: 0,
		total: 0,
		p: 1,
		ps: 10,
	};

	$scope.gorder_list = [];
	$scope.isLoading = false;
	$scope.statTextClass = "";
	$scope.isDone = false;
	$scope.loadingCnt = 0;

	$scope.init = function() {
		
		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}

		$scope.user = TBMM.getUser();
	//	$scope.g_loading=true;
		$scope.tab = parseInt($.query.get('tab') || 0);

		if($scope.tab > 3) {
			$scope.tab = 0;
		}

		$(".dingdanOrder li").eq($scope.tab).addClass('active');
		$scope.pager.type = $(".dingdanOrder .active").attr("data-type");
		$scope.loadData();

	}

	var bindscroll = function(params) {
		$(window).scroll(function() {
			if(document.body.scrollTop >= $(document).height() - $(window).height() - 300) {
				params.callback && params.callback.call(params.scope, '');
			}
		});
	};

	// 一步请求指定类型的订单列表
	$scope.loadData = function() {

		if($scope.isDone) {
			return;
		}

		//console.log(pager);

		locked = true;

		$scope.msg = "";
		$scope.isLoading = true;
		$.ajax({
			type: 'GET',
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/gorders/page"),
			data: {
				'type': $scope.pager.type,
				'p': $scope.pager.p,
				'ps': $scope.pager.ps
			},
			success: function(data) {
				$scope.isLoading = false;
				if(data.code == 0) {
					var len = data.data.list.length;

					//console.log(data.data.list)

					if(len == 0) {
						$scope.isDone = true;
					} else {
						for(var i = 0; i < len; ++i) {
							$scope.gorder_list.push(data.data.list[i]);
						}
						$scope.pager.total = data.data.total;
						$scope.pager['p']++;

						$scope.loadingCnt = $scope.gorder_list.length;
					//	console.log($scope.gorder_list);
						if($scope.pager.total <= $scope.loadingCnt) {
							$scope.isDone = true;
						}

					}
					locked = false;
			//		$scope.g_loading=false;
					$scope.$apply();
					
				} else {
					locked = false;
					TBMM.ajaxHandle(data);
					return;
				}

			},
			error: function() {
				$scope.isLoading = false;
				locked = false;
				console.log('Error')
			},
			dataType: 'json'
		});
	}

	$scope.tabs = function(e) {
		var tab = $(e.target).attr('data-tab');
		var type = $(e.target).attr('data-type');
		if($scope.tab != tab) {
			$(e.target).addClass("active").siblings().removeClass("active");
			$scope.gorder_list = [];
			$scope.tab = tab;
			$scope.isDone = false;
			$scope.loadingCnt = 0;
			$scope.pager = {
				type: type,
				total: 0,
				p: 1,
				ps: 10
			}

			$scope.loadData();
		}
	}

	$scope.getStatText = function(index, status, pay_status, deliver_status) {
		if(status == -2) {
			$scope.gorder_list[index].statTextClass = "payMoney grey";
			return "已取消";
		} else if(status == -1) {
			$scope.gorder_list[index].statTextClass = "payMoney grey";
			return "已删除";
		} else if(pay_status == 5 && status == 10) {
			$scope.gorder_list[index].statTextClass = "payMoney grey";
			return "交易完成";
		} else if(status == 10) {
			$scope.gorder_list[index].statTextClass = "payMoney grey";
			return "已关闭";
		} else if(status == 1 && pay_status == 1) {
			$scope.gorder_list[index].statTextClass = "payMoney red";
			$scope.statTextClass = "payMoney red";
			return "等待买家付款";
		} else if(status == 1 && deliver_status == 1 && pay_status == 5) {
			$scope.gorder_list[index].statTextClass = "payMoney orange";
			return "待发货";
		} else if(status == 1 && deliver_status == 5) {
			$scope.gorder_list[index].statTextClass = "payMoney orange";
			return "待收货";
		} else if(status == 1 && deliver_status == 10) {
			$scope.gorder_list[index].statTextClass = "payMoney green";
			return "已签收";
		} else if(status == 1 && pay_status == 8) {
			$scope.gorder_list[index].statTextClass = "payMoney red";
			return "退款中";
		} else if(status == 1 && pay_status == 12) {
			$scope.gorder_list[index].statTextClass = "payMoney red";
			return "退款成功";
		} else if(status == 1 && pay_status == 10) {
			$scope.gorder_list[index].statTextClass = "payMoney red";
			return "退款失败";
		} else if(status == 1 && deliver_status == 2) {
			$scope.gorder_list[index].statTextClass = "payMoney red";
			return "发货中";
		} else if(status == 1 && pay_status == 4) {
			$scope.gorder_list[index].statTextClass = "payMoney orange";
			return "支付交易进行中";
		} else if(status == 1 && pay_status == 9) {
			$scope.gorder_list[index].statTextClass = "payMoney orange";
			return "退款交易进行中";
		}

	}

	$scope.goToDetail = function(seq) {
		$window.location.href = HOST + '/gorder/detail.html?seq=' + seq;
	}

	bindscroll(params);

	$scope.init();

}]);