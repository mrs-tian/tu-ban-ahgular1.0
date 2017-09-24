var mine = angular.module('shoppingCar', []);

mine.controller('shoppingCarController', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;

	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.gcart = {
		'list': [],
		'g_num_total': 0,
		'g_price_total': 0
	};

	// 删除条目
	$scope.deleteItems = function() {

		if(!$scope.gcart.g_num_total) {
			$scope.alert = {
				on: true,
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '请先选择要删除的商品'
			}

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);
			return;
		}

		var ids = [];

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			if($scope.gcart.list[i].selected) {
				ids.push($scope.gcart.list[i].id);
			}
		}

		$scope.alert = {
			on: true,
			type: '',
			buttonStyle: 'double', // 'single', 'double', 'none'
			icon: 'warning',
			message: '确定删除所选的商品？',
			confirmed: function() {
				$scope.alert.on = false;
				$scope.isLoading = true;
				$.ajax({
					type: 'POST',
					url: TBMM.genApiUrl("/gcart/deleteItems"),
					data: {
						ids: JSON.stringify(ids)
					},
					success: function(data) {
						$scope.isLoading = false;
						if(data.code == 0) {

							var list = [];
							for(var i = 0; i < $scope.gcart.list.length; i++) {
								if(!$scope.gcart.list[i].selected) {
									list.push($scope.gcart.list[i]);
								}
							}

							$scope.gcart.list = list;
							//	console.log($scope.gcart.list.length);
							if($scope.gcart.list.length == 0) {
								$scope.cart_empty = true;
							} else {
								$scope.cart_empty = false;
							};
							$scope.recalculate();
							$scope.$apply();
						} else {
							TBMM.ajaxHandle(data);
							return;
						}

					},
					error: function() {
						$scope.isLoading = false;
						console.log('Error')
					},
					dataType: 'json'
				});
			},
			canceled: function() {
				$scope.alert.on = false;
			}
		}

	}

	$scope.cargo_minus = function(stock_id) {

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			if($scope.gcart.list[i].g_stock_id == stock_id) {

				if($scope.gcart.list[i].num > 1) {
					$scope.gcart.list[i].num--;
				} else {
					return;
				}

				$scope.modItem(stock_id, $scope.gcart.list[i].num, function(flag) {
					if(!flag) {
						$scope.gcart.list[i].num++;
					}
				});
				break;
			}
		}

	}

	$scope.cargo_plus = function(stock_id) {

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			if($scope.gcart.list[i].g_stock_id == stock_id) {
				$scope.gcart.list[i].num++;
				$scope.modItem(stock_id, $scope.gcart.list[i].num, function(flag) {
					if(!flag) {
						$scope.gcart.list[i].num--;
					}
				});
				break;
			}
		}

	}

	// 修改条目
	$scope.modItem = function(stock_id, num, callback) {

		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}

		if(num < 0) {
			num = 0;
		}

		$scope.isLoading = true;
		$.ajax({
			type: 'POST',
			url: TBMM.genApiUrl("/gcart/modItem"),
			data: {
				c_id: $scope.user.id,
				stock_id: stock_id,
				num: num
			},
			success: function(data) {
				$scope.isLoading = false;
				if(data.code == 0) {

					for(var i = 0; i < $scope.gcart.list.length; i++) {
						if($scope.gcart.list[i].g_stock_id == stock_id) {
							$scope.gcart.list[i].num = num;
							break;
						}
					}

					$scope.recalculate();
					$scope.$apply();

					callback(true);
				} else {
					TBMM.ajaxHandle(data);
					callback(false);
				}
			},
			error: function() {
				$scope.isLoading = false;
				console.log('Error')
				callback(false);
			},
			dataType: 'json'
		});
	}

	// 计算选中的商品数量和价格
	$scope.recalculate = function() {

		$scope.gcart.g_num_total = 0;
		$scope.gcart.g_price_total = 0;

		var num = 0;

		$.each($scope.gcart.list, function(index, item) {
			if(item.selected) {
				num++;
				$scope.gcart.g_num_total += item.num;
				$scope.gcart.g_price_total += item.num * item.p_price;
			}
		});

		if(num == $scope.gcart.list.length && num > 0) {
			$scope.checkall = true;
		} else {
			$scope.checkall = false;
		}

		if(num == 0) {
			$(".jie-suan-right").addClass("submit-disabled");
		} else {
			$(".jie-suan-right").removeClass("submit-disabled");
		}
	}

	$scope.checkall = false;

	$scope.checkAll = function() {
		$scope.checkall = $scope.checkall ? false : true;

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			$scope.gcart.list[i].selected = $scope.checkall;
		}
		$scope.recalculate();
	}

	$scope.selectCartItem = function(id) {

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			if($scope.gcart.list[i].id == id) {
				$scope.gcart.list[i].selected = $scope.gcart.list[i].selected ? 0 : 1;
			}
		}
		$scope.recalculate();

	}

	$scope.createOrder = function() {

		var goods_list = [];
		var cart_item_ids = [];

		for(var i = 0; i < $scope.gcart.list.length; i++) {
			if($scope.gcart.list[i].selected) {
				goods_list.push({
					"id": $scope.gcart.list[i].g_id,
					"num": $scope.gcart.list[i].num,
					"stock_id": $scope.gcart.list[i].g_stock_id,
				});
				cart_item_ids.push($scope.gcart.list[i].id);
			}
		}

		$window.location.href = HOST + "/pay/gorder.html?g_list=" + encodeURIComponent(JSON.stringify(goods_list)) + "&cart_item_ids=" + encodeURIComponent(JSON.stringify(cart_item_ids))

		/*$.ajax({
            type: 'POST',
            url: TBMM.genApiUrl("/gorder/create"),
            data: {
            	c_id: $scope.user.id,
            	goods_list: JSON.stringify(goods_list),
            	cart_item_ids: JSON.stringify(cart_item_ids)
            },
            success: function(data){
                $scope.isLoading = false;
                if(data.code == 0){
                    window.location.href = HOST + '/pay/gorder.html?seq=' + data.data.seq;
                }else{
                    TBMM.ajaxHandle(data);
                    return;
                }
                
            },
            error: function(){
            	$scope.isLoading = false;
                console.log('Error')
            },
            dataType: 'json'
        });*/

	}

	$scope.init = function() {
		if(!TBMM.isLogin()) {
//			$scope.alert = {
//		on: true,
//		type: '',
//		buttonStyle: 'double', // 'single', 'double', 'none'
//		icon: 'warning', // 'success', 'error', 'warning', 'info'
//		message: '尚未登录，是否登录？',
//		confirmed: function(){
//			$scope.alert.on = false;
//			if( $scope.alert.type == '' ){
//			$window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
//			};
//		},
//		canceled: function(){
//			$scope.alert.on = false;
//			window.location.href= HOST + '/index.html';
//		}
//	};
			$window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
	};
		$scope.g_loading=true;
		$scope.user = TBMM.getUser();
	//	$scope.isLoading = true;
		$.ajax({
			type: 'GET',
			url: TBMM.genApiUrl("/gcart/" + $scope.user.id + "/items"),
			data: {},
			success: function(data) {
			//	$scope.isLoading = false;
				$scope.g_loading=false;
				if(data.code == 0) {
					$scope.gcart.list = data.data.list;
					
					if($scope.gcart.list.length == 0) {
						$scope.cart_empty = true;
					} else {
						$scope.cart_empty = false;
					};
					$scope.recalculate();
					$scope.$apply();

				} else {

					TBMM.ajaxHandle(data);
					return;
				}

			},
			error: function() {
			//	$scope.isLoading = false;
				$scope.g_loading=false;
				console.log('Error')
			},
			dataType: 'json'
		});

	};

	$scope.init();

}]);