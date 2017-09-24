var mine = angular.module('gorderDetail', []);

mine.controller('gorderDetailController', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'profile';

	$scope.gorder_list = [];
	$scope.isLoading = true;

	$scope.deliver_type = 1;

	$scope.pay_type = {
		"wx_pub": "微信公众号支付",
		"wx": "微信支付",
		"alipay_wap": "阿里云支付"
	};

	$scope.init = function() {
		$scope.g_loading = true;
		$scope.seq = $.query.get("seq") || 0;
		$scope.user = TBMM.getUser();
		if(!$scope.seq) {
			window.location.href = HOST + '/index.html';
			return;
		};

		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		};

		$.ajax({
			type: 'get',
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/gorder/" + $scope.seq),
			async: true,
			data: {
				"id": $scope.user.id,
				"seq": $scope.seq
			},
			dataType: 'json',
			success: function(data) {

				if(data.code == 0) {
					$scope.gorder = data.data;
					if($scope.gorder.status == 10) {
						$scope.deliver_type = 3;
					} else if($scope.gorder.deliver_status >= 5 && $scope.gorder.deliver_status < 10) {
						$scope.deliver_type = 2;
					}

				} else {
					TBMM.ajaxHandle(data);
					return;
				};	
				$scope.g_loading = false;	
				$scope.$apply();			
			},
			error: function() {

				locked = false;
				$scope.alert = {
					on: true,
					type: '',
					buttonStyle: 'double', // 'single', 'double', 'none'
					icon: 'warning', // 'success', 'error', 'warning', 'info'
					message: '获取数据出错啦！是否刷新？',
					confirmed: function() {
						$scope.alert.on = false;
						if($scope.alert.type == '') {
							window.location.reload(); //数据出错，重新刷新页面获取数据
						};
					},
					canceled: function() {
						$scope.alert.on = false;
					}
				};
				$scope.$apply(); // !!!!! 如果是Ajax内必须加此语句
			
			}

		});
	};

	$scope.getStatText = function(status, pay_status, deliver_status) {
		if(status == -2) {
			$scope.gorder.statTextClass = "payMoney grey";
			return "已取消";
		} else if(status == -1) {
			$scope.gorder.statTextClass = "payMoney grey";
			return "已删除";
		} else if(pay_status == 5 && status == 10) {
			$scope.gorder.statTextClass = "payMoney grey";
			return "交易完成";
		} else if(status == 10) {
			$scope.gorder.statTextClass = "payMoney grey";
			return "已关闭";
		} else if(status == 1 && pay_status == 1) {
			$scope.gorder.statTextClass = "payMoney red";
			$scope.statTextClass = "payMoney red";
			return "等待买家付款";
		} else if(status == 1 && deliver_status == 1 && pay_status == 5) {
			$scope.gorder.statTextClass = "payMoney orange";
			return "待发货";
		} else if(status == 1 && deliver_status == 5) {
			$scope.gorder.statTextClass = "payMoney orange";
			return "待收货";
		} else if(status == 1 && deliver_status == 10) {
			$scope.gorder.statTextClass = "payMoney green";
			return "已签收";
		} else if(status == 1 && pay_status == 8) {
			$scope.gorder.statTextClass = "payMoney red";
			return "退款中";
		} else if(status == 1 && pay_status == 12) {
			$scope.gorder.statTextClass = "payMoney red";
			return "退款成功";
		} else if(status == 1 && pay_status == 10) {
			$scope.gorder.statTextClass = "payMoney red";
			return "退款失败";
		} else if(status == 1 && deliver_status == 2) {
			$scope.gorder.statTextClass = "payMoney red";
			return "发货中";
		} else if(status == 1 && pay_status == 4) {
			$scope.gorder.statTextClass = "payMoney orange";
			return "支付交易进行中";
		} else if(status == 1 && pay_status == 9) {
			$scope.gorder.statTextClass = "payMoney orange";
			return "退款交易进行中";
		}

	};

	$scope.init();
	

}]);