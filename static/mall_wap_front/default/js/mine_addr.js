var mine = angular.module('mine_addr', []);

mine.controller('mine_addr_controller', ['$scope', '$window', function($scope, $window) {
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};
	$scope.addr_addresses_show = true;
	var mine_id = TBMM.getUser().id;
	$scope.addr_get_user_addresses = function(callback) {

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/user/" + mine_id + "/addresses"),
			async: true,
			data: {},
			dataType: 'json',
			success: function(data) {
				callback(data.data.list);
			},
			error: function() {
				console.log("数据错误");
				callback([]);
			}
		});

	};
	$scope.addr_get_user_addresses(function(data) {

		$scope.addr_user_addresses = data;

		//			angular.forEach($scope.addr_user_addresses, function(data, index, array) {
		//				if(data.is_default === 1) {
		//					$scope.gorder.address = data;
		//				}
		//			});
		//
		//			// 如果没有默认地址，选第一个
		//			if(!$scope.gorder.address && $scope.addr_user_addresses.length > 0) {
		//				$scope.gorder.address = $scope.addr_user_addresses[0]
		//			}

		$scope.$apply();

	});

	// ----------------- 收货地址，三级联动 --------------------

	$scope.addr_p_code = null;
	$scope.addr_c_code = null;
	$scope.addr_d_code = null;
	$scope.addr_provinces = [];
	$scope.addr_cities = [];
	$scope.addr_districts = [];
	$scope.addr_get_data = function(layer, parent, callback) {

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/sysData/districts"),
			async: true,
			data: {
				layer: layer,
				parent: parent
			},
			dataType: 'json',
			success: function(data) {

				return callback(data.data.list || [])
			},
			error: function() {
				console.log("数据错误");
				return callback([])
			}
		});

	};

	$scope.addr_selected = function(layer) {

		switch(layer) {
			case 1:
				$scope.addr_cities = [];
				$scope.addr_districts = [];
				// 初始化省级数据
				$scope.addr_get_data(2, $scope.addr_p_code, function(data) {
					$scope.addr_cities = data;
					$scope.$apply();
				});
				break;
			case 2:
				$scope.addr_districts = [];
				$scope.addr_get_data(3, $scope.addr_c_code, function(data) {
					$scope.addr_districts = data;
					$scope.$apply();
				});
				break;
		}
	};

	// 初始化创建地址页面
	$scope.addr_init_create = function(p_code, c_code, d_code) {
		$scope.addr_handle_type = 'create';
		$scope.addr_addresses_show = false; // 隐藏管理页
		$scope.addr_address_show = true; // 显示编辑页
		$scope.addr_addr = { // 当前操作的地址实例
			"receiver": "", // 收获地址
			"mobile": "", // 电话
			"address": { // 三级地址
				"p": { // 省级
					"c": "", // 区域代码
					"n": "" // 区域名称
				},
				"c": { // 市级
					"c": "",
					"n": ""
				},
				"d": { // 区、县级
					"c": "",
					"n": ""
				}
			},
			"detail": "", // 详细地址
			"is_default": 0, // 是否为默认
		};

		$scope.addr_init_3layer_addr(p_code, c_code, d_code);
	};

	// 初始化修改地址页面
	$scope.addr_init_update = function(addr) {
		$scope.addr_handle_type = 'update';
		$scope.addr_address_show = true;
		$scope.addr_addresses_show = false;
		$scope.addr_addr = addr;
		$scope.addr_init_3layer_addr(addr.address.p.c, addr.address.c.c, addr.address.d.c);
	};

	$scope.addr_init_3layer_addr = function(p_code, c_code, d_code) {

		$scope.addr_p_code = p_code || null;
		$scope.addr_c_code = c_code || null;
		$scope.addr_d_code = d_code || null;

		// 初始化省级数据
		$scope.addr_get_data(1, null, function(data) {
			$scope.addr_provinces = data;

			$scope.$apply();
		})

		if(p_code) {
			$scope.addr_get_data(2, p_code, function(data) {
				$scope.addr_cities = data;

				$scope.$apply();
			})
		}

		if(c_code) {
			$scope.addr_get_data(3, c_code, function(data) {
				$scope.addr_districts = data;

				$scope.$apply();
			})
		}
	};

	$scope.addr_cancel_address = function() {
		$scope.addr_addresses_show = true; // 隐藏管理页
		$scope.addr_address_show = false; // 显示编辑页

		$scope.addr_get_user_addresses(function(data) {
			$scope.addr_user_addresses = data;
			$scope.$apply();
		});
	};

	// 添加、修改新地址
	$scope.addr_confirm_handle = function() {

		var params = $scope.addr_addr;

		if(!params.receiver) {

			$scope.alert = {
				on: true,
				type: '',
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '请输入收货人姓名'
			};

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);

			return;
		};

		if(!params.mobile) {

			$scope.alert = {
				on: true,
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '请输入联系方式'
			}

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);

			return;
		};

		if(!params.detail) {
			$scope.alert = {
				on: true,
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '请输入详细地址'
			}

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);
			return;
		};

		params.p_name = '';
		params.p_code = '';

		angular.forEach($scope.addr_provinces, function(data, index, array) {
			if(data.code == $scope.addr_p_code) {
				params.p_name = data.name;
				params.p_code = data.code;

				$scope.addr_addr.address.p = {
					"n": data.name,
					"c": data.code
				}
			}
		});

		params.c_name = '';
		params.c_code = '';
		angular.forEach($scope.addr_cities, function(data, index, array) {
			if(data.code == $scope.addr_c_code) {
				params.c_name = data.name;
				params.c_code = data.code;
				$scope.addr_addr.address.c = {
					"n": data.name,
					"c": data.code
				}
			}
		});

		params.d_name = '';
		params.d_code = '';
		angular.forEach($scope.addr_districts, function(data, index, array) {
			if(data.code == $scope.addr_d_code) {
				params.d_name = data.name;
				params.d_code = data.code;
				$scope.addr_addr.address.d = {
					"n": data.name,
					"c": data.code
				}
			}
		});

		if(!params.p_code) {

			$scope.alert = {
				on: true,
				icon: 'warning',
				buttonStyle: 'none', // 'single', 'double', 'none'
				message: '至少选择省级'
			}

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);

			return;
		};

		// 修改
		if($scope.addr_addr._id) {

			params.address_id = $scope.addr_addr._id;

			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/user/" + mine_id + "/modAddress"),
				async: true,
				data: params,
				dataType: 'json',
				success: function(data) {
					if(data.code == 0) {
						// 设置ID
						$scope.addr_addr._id = data.data.id;
						$scope.alert = {
							on: true,
							icon: 'success',
							buttonStyle: 'none', // 'single', 'double', 'none'
							message: '修改成功！'
						}

						setTimeout(function() {
							$scope.alert.on = false;
							$scope.$apply()
						}, 1500);

						$scope.addr_addresses_show = true;
						$scope.addr_address_show = false;

						// 重新加载
						$scope.addr_get_user_addresses(function(data) {
							$scope.addr_user_addresses = data;
							$scope.$apply();
						});

					} else {
						TBMM.ajaxHandle(data);
					}
				},
				error: function() {
					console.log("数据错误");
				}
			});
		};

		// 添加
		if(!$scope.addr_addr._id) {
			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/user/" + mine_id + "/addAddress"),
				async: true,
				data: params,
				dataType: 'json',
				success: function(data) {
					if(data.code == 0) {
						// 设置ID
						$scope.addr_addr._id = data.data.id;

						$scope.alert = {
							on: true,
							icon: 'success',
							buttonStyle: 'none', // 'single', 'double', 'none'
							message: '添加成功！'
						}

						setTimeout(function() {
							$scope.alert.on = false;
							$scope.$apply()
						}, 1500);
						$scope.addr_address_show = false;
						$scope.addr_addresses_show = true;
						// 重新加载   （这个地方后台数据有问题 为什么添加不上在 付款页面添加地址也添加不上）
						$scope.addr_get_user_addresses(function(data) {
							$scope.addr_user_addresses = data;
							$scope.$apply();
						});
						$scope.$apply();

					} else {
						TBMM.ajaxHandle(data);
					}
				},
				error: function() {
					console.log("数据错误");
				}
			});
		};

	};
	//  添加或者修改时 设置默认
	$scope.addr_set_default = function() {
		$scope.addr_addr.is_default = $scope.addr_addr.is_default ? 0 : 1;
	};
	// 点击详细地址设定
	$scope.set_default_addr = function(addr_id) {
		$.ajax({
			type: "post",
			url: TBMM.genApiUrl("/user/" + mine_id + "/setDefaultAddress"),
			data: {
				"address_id": addr_id
			},
			success: function() {
				$scope.addr_get_user_addresses(function(data) {
					$scope.addr_user_addresses = data;
					$scope.$apply();
				});
			},
			error: function() {
				console.log("数据获取失败");
			}
		});
	};

	$scope.delete_addr = function(addr_id) {
		$.ajax({
			type: "post",
			url: TBMM.genApiUrl("/user/" + mine_id + "/delAddress"),
			dataType: 'json',
			data: {
				"address_id": addr_id
			},
			success: function() {
				$scope.alert = {
					on: true,
					type: '',
					buttonStyle: 'double', // 'single', 'double', 'none'
					icon: 'warning', // 'success', 'error', 'warning', 'info'
					message: '确定删除选中的收货地址？',
					confirmed: function() {
						$scope.alert.on = false;
						if($scope.alert.type == '') {
							$scope.addr_get_user_addresses(function(data) {
								$scope.addr_user_addresses = data;
								$scope.$apply();
							});
						};
					},
					canceled: function() {
						$scope.alert.on = false;
					}
				};
				$scope.$apply();

			},
			error: function() {
				console.log("数据错误");
			}
		});
	};

}]);