var mine = angular.module('gorderPay', []);

mine.controller('gorderPayController', ['$scope', '$window', function($scope, $window) {

	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.handle_type = 'create';

	$scope.src_type = 'cart'; // cart 购物车 activity 活动

	$scope.initPay = function() {

		$scope.handle_type = 'pay';

		$.ajax({
			type: 'GET',
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/gorder/" + $scope.seq),
			data: {},
			success: function(data) {

				if(data.code == 0) {
					$scope.gorder = data.data;
					$scope.$apply();
				} else {
					TBMM.ajaxHandle(data);
					return;
				}
			},
			error: function() {

				locked = false;
				console.log('Error')
			},
			dataType: 'json'
		});
	};

	// 订单模型
	$scope.gorder = {}

	$scope.cargo_minus = function(stock_id) {

		for(var i = 0; i < $scope.gorder.items.length; i++) {
			if($scope.gorder.items[i].g_stock_id == stock_id) {

				if($scope.gorder.items[i].num > 1) {
					$scope.gorder.items[i].num--;
				} else {
					return;
				}

				break;
			}
		}

		// 计算运费
		$scope.calculateDeliverPrice(function(data) {
			$scope.gorder.deliver_price = data.total || 0;
			$scope.recalculateOrder();
			$scope.$apply();
		});
	}

	$scope.cargo_plus = function(stock_id) {

		//		$(".coupon-mask input").prop('checked', false);
		for(var i = 0; i < $scope.gorder.items.length; i++) {
			if($scope.gorder.items[i].g_stock_id == stock_id) {

				if($scope.gorder.items[i].num + 1 < $scope.gorder.items[i].g_stock_num) {
					$scope.gorder.items[i].num++;
				} else {

					$scope.alert = {
						on: true,
						icon: 'warning',
						buttonStyle: 'none', // 'single', 'double', 'none'
						message: '库存不足'
					}

					setTimeout(function() {
						$scope.alert.on = false;
						$scope.$apply()
					}, 1000);

				}

				break;
			}
		}

		// 计算运费
		$scope.calculateDeliverPrice(function(data) {
			$scope.gorder.deliver_price = data.total || 0;
			$scope.recalculateOrder();
			$scope.$apply();
		});
	}

	$scope.calculateDeliverPrice = function(callback) {

		var addr = $scope.gorder.address ? $scope.gorder.address.address : null;

		var items = [];

		for(var i = 0; i < $scope.gorder.items.length; i++) {
			items.push({
				"g_id": $scope.gorder.items[i].g_id, // 库存ID
				"g_stock_id": $scope.gorder.items[i].g_stock_id, // 库存ID
				"fare_tpl_id": $scope.gorder.items[i].g_fare_tpl_id, // 商品绑定的运费模板
				"num": $scope.gorder.items[i].num, // 购买的数量
				"p_price": $scope.gorder.items[i].p_price, // 单价
			});
		}

		if(!addr || items.length == 0) {
			return;
		}

		$.ajax({
			type: "post",
			url: TBMM.genApiUrl("/gorder/deliverPrice/calculate"),
			async: true,
			data: {
				addr: JSON.stringify(addr),
				items: JSON.stringify(items)
			},
			dataType: 'json',
			success: function(data) {
				callback(data.data);
			},
			error: function() {
				console.log("数据错误");
				callback(0);
			}
		});

	}

	$scope.recalculateOrder = function() {
		var pay_price = 0;
		var g_num = 0;
		var t_price = 0;
		for(var i = 0; i < $scope.gorder.items.length; i++) {
			g_num += $scope.gorder.items[i].num;
			$scope.gorder.items[i].t_price = $scope.gorder.items[i].num * $scope.gorder.items[i].p_price;
			$scope.gorder.items[i].pay_price = $scope.gorder.items[i].t_price;
			t_price += $scope.gorder.items[i].t_price;
		}
		$scope.gorder.g_num = g_num;
		$scope.gorder.deliver_price = $scope.gorder.deliver_price || 0;
		$scope.gorder.t_price = t_price;
		if($scope.gorder.coupon_price) {
			$scope.gorder.pay_price = t_price + $scope.gorder.deliver_price - $scope.gorder.coupon_price;
		} else {
			$scope.gorder.pay_price = t_price + $scope.gorder.deliver_price;
		};
		//	$scope.gorder.pay_price = t_price + $scope.gorder.deliver_price - $scope.gorder.coupon_price||0; // TODO 加入积分等
		cal_coupon();
	};

	$scope.initCreate = function() {
		$scope.handle_type = 'create';
		if($scope.activity_id) {
			$scope.src_type = 'activity';
		}

		//alert("此页面为下单确认页");

		$.ajax({
			type: "GET",
			url: TBMM.genApiUrl("/gorder/preCreate/data"),
			data: {
				'goods_list': JSON.stringify($scope.pre_goods_list),
				'activity_id': $scope.activity_id // 活动ID			
			},
			success: function(json) {

				if(json.code != 0) {
					TBMM.ajaxHandle(json);
				} else {

					$scope.gorder.items = []

					var goods_list = json.data.goods_list;
					var stock_list = json.data.stock_list;

					// TOTO 这是个牛逼的三层循环，不要惊慌不要害怕
					for(var m = 0; m < $scope.pre_goods_list.length; m++) {
						for(var i = 0; i < goods_list.length; i++) {
							if($scope.pre_goods_list[m].id == goods_list[i]._id) {
								for(var j = 0; j < stock_list.length; j++) {
									if($scope.pre_goods_list[m].stock_id == stock_list[j].id) {
										var item = {
											g_code: goods_list[i].code,
											g_cover: goods_list[i].cover,
											g_id: goods_list[i]._id,
											g_name: goods_list[i].name,
											g_spec: stock_list[j].spec,
											g_stock_id: stock_list[j].id,
											g_fare_tpl_id: goods_list[i].fare_tpl ? goods_list[i].fare_tpl._id : '',
											g_unit: goods_list[i].unit,
											num: $scope.pre_goods_list[m].num,
											p_price: stock_list[j].price,
											// 库存余量
											g_stock_num: stock_list[j].num - stock_list[j].l_num
										}

										$scope.gorder.items.push(item)
										break;
									}
								}
								break;
							}
						}
					}

					$scope.recalculateOrder();

					$scope.$apply();

					// 获取用户收货地址
					$scope.addr_get_user_addresses(function(data) {

						$scope.addr_user_addresses = data;

						angular.forEach($scope.addr_user_addresses, function(data, index, array) {
							if(data.is_default === 1) {
								$scope.gorder.address = data;
							}
						});

						// 如果没有默认地址，选第一个
						if(!$scope.gorder.address && $scope.addr_user_addresses.length > 0) {
							$scope.gorder.address = $scope.addr_user_addresses[0]
						}

						$scope.$apply();

						// 计算运费
						$scope.calculateDeliverPrice(function(data) {
							$scope.gorder.deliver_price = data.total || 0;
							$scope.recalculateOrder();
							$scope.$apply();

						})

					});

				}
			},
			error: function(json) {

			},
			dataType: 'json'
		});

	};
	//优惠券
	$scope.chose_coupon = function() {
		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/ucoupons/page"),
			async: true,
			dataType: 'json',
			data: {
				"status": 1,
				//				"start":0 ,
				//				"limit":10
				"o_price": $scope.gorder.t_price
			},
			success: function(data) {
				//				console.log(data);
				var now_time = new Date().getTime() / 1000;
				$scope.coupon_status_list = data.data.list;
				//从所有的优惠券中拿到未使用的
				angular.forEach($scope.coupon_status_list, function(data) {
					if(data.time_valid == 0) {
						$scope.no_use_num.push(data);
					} else if(data.time_valid == 1 && now_time > data.time_valid_start && now_time < data.time_valid_end) {
						$scope.no_use_num.push(data);
					};
				});
				cal_coupon();
				$scope.$apply();
			},
			error: function() {
				alert('网络错误，请您刷新重试')
			}
		});
	};

	$scope.init = function() {

		if(!TBMM.isLogin()) {
			window.location.href = HOST + '/login/login.html?fromUrl=' + encodeURIComponent(window.location.href);
			return;
		}

		$scope.no_use_num = [];
		$scope.g_loading = true;
		$scope.user = TBMM.getUser();
		$scope.seq = $.query.get("seq") || 0; // 是否是未支付订单
		$scope.activity_id = $.query.get("activity_id"); // 是否是活动订单
		$scope.pre_goods_list = $.query.get("g_list") ? JSON.parse($.query.get("g_list")) : null;
		$scope.pre_cart_item_ids = $.query.get("cart_item_ids") ? JSON.parse($.query.get("cart_item_ids")) : null;
		if($scope.seq) {
			$scope.no_seq = false;
			$scope.have_seq = true;
			$scope.sub_click_before = false;
			$scope.sub_click_later = true;
			$scope.initPay();
		} else if($scope.pre_goods_list) {
			$scope.no_seq = true;
			$scope.have_seq = false;
			$scope.sub_click_before = true;
			$scope.sub_click_later = false;
			$scope.xuan_le = false;
			$scope.mei_xuan = true;
			$scope.initCreate();
		} else {
			window.location.href = HOST + '/index.html';
			return;
		};
		$scope.chose_coupon();
	};
	
	$scope.toWxPay = function() {

		if(!$scope.gorder || !$scope.seq) {
			alert("订单不能支付");
			return;
		}

		$.ajax({
			type: "POST",
			url: TBMM.genApiUrl("/gorder/" + $scope.seq + "/pay"),
			data: {
				'openid': $scope.user.openid,
				'third_pay_channel': 'wx_pub',
				'type': 'native'
			},
			success: function(json) {
				if(json.code != 0) {
					TBMM.ajaxHandle(json);
				} else {
					var pre_order_id = json.data.charge.id;

					$.ajax({
						type: "GET",
						async: true,
						url: TBMM.genApiUrl("/weixin/jsSign"), // TODO 以后改成线上接口
						data: {
							'url': location.href.split("#")[0]
						},
						dataType: 'json',
						success: function(data) {
							var sign = data.data;
							var get_sign_params = {
								"appId": sign.appId,
								"nonceStr": sign.nonceStr,
								"package": "prepay_id=" + pre_order_id,
								"signType": "MD5",
								"timestamp": sign.timestamp				
							};


							wx.config({
								debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
								appId: sign.appId, // 必填，公众号的唯一标识
								timestamp: sign.timestamp, // 必填，生成签名的时间戳
								nonceStr: sign.nonceStr, // 必填，生成签名的随机串
								signature: sign.signature, // 必填，签名，见附录1
								jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
							});

							// 分享内容设置

							wx.ready(function() {
								wx.chooseWXPay({
									timestamp: sign.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
									nonceStr: sign.nonceStr, // 支付签名随机串，不长于 32 位
									package: "prepay_id=" + pre_order_id, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
									signType: "MD5", // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
									paySign:TBMM.getPaySignStr(get_sign_params), // 支付签名
									success: function(ress) {
										// 支付成功后的回调函数
										alert(ress);
										//										$.ajax({
										//											type: "POST",
										//											url: TBMM.genApiUrl("/gorder/" + $scope.seq + "/paying"),
										//											data: {
										//												'third_pay_id': payment_id, // 支付凭证ID，用于验证
										//											},
										//											success: function(json) {
										//
										//												//把订单号	传到成功时的页面
										//												$window.location.href = $scope.HOST + '/pay/pay_success.html?seq=' + $scope.seq;
										//
										//											},
										//											error: function(json) {
										//												// 支付失败是做的事情请
										//											},
										//											dataType: 'json'
										//										});
									}
								});
							});

						},
						error: function(jqXHR, textStatus, errorThrown) {
							alert('网络出现异常，请刷新重试');
						}
					});

					//										var charge = json.data.charge;
					//										var payment_id = charge.id;
					//										pingpp.createPayment(charge, function(result, err) {
					//					
					//											$scope.$apply();
					//					
					//											if(result == "success") {
					//					
					//												// 成功后的回调
					//												$.ajax({
					//													type: "POST",
					//													url: TBMM.genApiUrl("/gorder/" + $scope.seq + "/paying"),
					//													data: {
					//														'third_pay_id': payment_id, // 支付凭证ID，用于验证
					//													},
					//													success: function(json) {
					//					
					//														//把订单号	传到成功时的页面
					//														$window.location.href = $scope.HOST + '/pay/pay_success.html?seq=' + $scope.seq;
					//					
					//													},
					//													error: function(json) {
					//														// 支付失败是做的事情请
					//													},
					//													dataType: 'json'
					//												});
					//					
					//											} else {
					//					
					//												$scope.alert = {
					//													on: true,
					//													type: '',
					//													icon: 'warning',
					//													buttonStyle: 'single', // 'single', 'double', 'none'
					//													message: '支付取消，自动转入未支付订单中~',
					//													confirmed: function() {
					//														$scope.alert.on = false;
					//														$window.location.href = HOST + '/gorder/mine.html?tab=1';
					//													},
					//												}
					//					
					//												$scope.$apply();
					//					
					//												return;
					//					
					//											}
					//					
					//										});

				}
			},
			error: function(json) {

			},
			dataType: 'json'
		});
	};

	$scope.pay_detail_hide = function() {
		$scope.pay_detail_mask = false;
		$scope.pay_detail = false;
	}

	$scope.payOrder = function() {
		$scope.pay_detail_mask = true;
		$scope.pay_detail = true;
	};

	$scope.createOrder = function() {

		var goods_list = [];
		for(var i = 0; i < $scope.gorder.items.length; i++) {
			goods_list.push({
				id: $scope.gorder.items[i].g_id,
				stock_id: $scope.gorder.items[i].g_stock_id,
				num: $scope.gorder.items[i].num,
			})
		};
		if(!$scope.gorder.address) {
			$scope.sub_click_before = true;
			$scope.sub_click_later = false;
			alert("请设置收货地址！");
			return;
		} else {
			$scope.sub_click_before = false;
			$scope.sub_click_later = true;
		};
		if(goods_list.length == 0) {
			alert("没有商品可下单！");
			return;
		};
		// 活动订单
		if($scope.src_type == 'activity') {

			var params = {
				c_id: $scope.user.id,
				activity_id: $scope.activity_id,
				address_id: $scope.gorder.address._id,
				stock_id: goods_list[0].stock_id,
				num: goods_list[0].num,
				note: $scope.gorder.note

			};
			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/promotion/gorder/create"),
				async: true,
				dataType: 'json',
				data: params,
				success: function(data) {

					if(data.code == 0) {
						$scope.seq = data.data.seq;
						$scope.gorder.seq = data.data.seq;
						$scope.handle_type = 'pay';
						$scope.$apply();

					} else {
						TBMM.ajaxHandle(data)
					}
				},
				error: function() {

					console.log("数据获取错误");
				}
			});
		} else {
			var params = {
				c_id: $scope.user.id,
				goods_list: JSON.stringify(goods_list),
				address_id: $scope.gorder.address._id,
				note: $scope.gorder.note
			};

			if($scope.gorder.coupon_id) {
				params['coupon_id'] = $scope.gorder.coupon_id;
			};

			if($scope.pre_cart_item_ids) {
				params['cart_item_ids'] = JSON.stringify($scope.pre_cart_item_ids)
			};

			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/gorder/create"),
				async: true,
				dataType: 'json',
				data: params,
				success: function(data) {
					if(data.code == 0) {
						$scope.seq = data.data.seq;
						$scope.gorder.seq = data.data.seq;
						$scope.gorder.deliver_price = data.data.deliver_price;
						$scope.recalculateOrder();
						$scope.handle_type = 'pay';
						$scope.$apply();

					} else {
						TBMM.ajaxHandle(data)
					}
				},
				error: function() {

					console.log("数据获取错误");
				}
			});
		};
		$scope.no_seq = false;
		$scope.have_seq = true;

	};

	$scope.pay = function() {
		alert('支付成功')
	};

	// ----------------- 收货地址，三级联动 --------------------

	$scope.addr_address_show = false; // 编辑框是否展示
	$scope.addr_addresses_show = false; //
	$scope.addr_addr = null; // 当前操作的地址实例
	$scope.addr_p_code = null;
	$scope.addr_c_code = null;
	$scope.addr_d_code = null;

	$scope.addr_provinces = [];
	$scope.addr_cities = [];
	$scope.addr_districts = [];

	$scope.addr_user_addresses = []; // 用户所有收货地址
	$scope.addr_handle_type = 'create';

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

	}

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
	}

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
			"is_default": 1, // 是否为默认
		}

		$scope.addr_init_3layer_addr(p_code, c_code, d_code);
	}

	// 初始化修改地址页面
	$scope.addr_init_update = function(addr) {
		$scope.addr_handle_type = 'update';
		$scope.addr_address_show = true;
		$scope.addr_addresses_show = false;
		$scope.addr_addr = addr;

		$scope.addr_init_3layer_addr(addr.address.p.c, addr.address.c.c, addr.address.d.c);
	}

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
	}

	// 进入选择收货地址页
	$scope.addr_choose_address = function() {
		$scope.addr_addresses_show = true;
	};

	// 取消
	$scope.addr_cancel_address = function() {
		$scope.addr_address_show = false;
		if($scope.addr_handle_type == 'create') {
			$scope.addr_addresses_show = false;
		}
		if($scope.addr_handle_type == 'update') {
			$scope.addr_addresses_show = true;
		}
	}

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
			}

			setTimeout(function() {
				$scope.alert.on = false;
				$scope.$apply()
			}, 1500);

			return;
		}

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
		}

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
		}

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
		}

		// 修改
		if($scope.addr_addr._id) {

			params.address_id = $scope.addr_addr._id;

			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/user/" + $scope.user.id + "/modAddress"),
				async: true,
				data: params,
				dataType: 'json',
				success: function(data) {
					if(data.code == 0) {
						// 设置ID
						$scope.addr_addr._id = data.data.id;

						// 如果存在订单实例，则设置新加的收货地址
						if($scope.gorder) {
							$scope.gorder.address = $scope.addr_addr;
						}

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

						// 计算运费
						$scope.calculateDeliverPrice(function(data) {
							$scope.gorder.deliver_price = data.total || 0;
							$scope.recalculateOrder();
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
		}

		// 添加
		if(!$scope.addr_addr._id) {
			$.ajax({
				type: "post",
				url: TBMM.genApiUrl("/user/" + $scope.user.id + "/addAddress"),
				async: true,
				data: params,
				dataType: 'json',
				success: function(data) {
					if(data.code == 0) {
						// 设置ID
						$scope.addr_addr._id = data.data.id;

						// 如果存在订单实例，则设置新加的收货地址
						if($scope.gorder) {
							$scope.gorder.address = $scope.addr_addr;
						}

						$scope.addr_address_show = false;

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

						$scope.$apply();

						// 计算运费
						$scope.calculateDeliverPrice(function(data) {
							$scope.gorder.deliver_price = data.total || 0;
							$scope.recalculateOrder();
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
		}

	};

	// 选中收货地址
	$scope.addr_select_addr = function(address_id) {

		angular.forEach($scope.addr_user_addresses, function(data, index, array) {
			if(data._id === address_id) {
				$scope.gorder.address = data;
			}
		});

		$scope.addr_address_show = false;
		$scope.addr_addresses_show = false;

		// 计算运费
		$scope.calculateDeliverPrice(function(data) {
			$scope.gorder.deliver_price = data.total || 0;
			$scope.recalculateOrder();
			$scope.$apply();
		});
	};

	$scope.addr_get_user_addresses = function(callback) {

		$.ajax({
			type: "get",
			url: TBMM.genApiUrl("/user/" + $scope.user.id + "/addresses"),
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

	$scope.addr_set_default = function() {
		$scope.addr_addr.is_default = $scope.addr_addr.is_default ? 0 : 1;
	}

	// 有区域选中的初始化
	//$scope.addr_init_3layer_addr('110000', '110100', '110101');

	// 没有任何选中的初始化
	// $scope.addr_init_3layer_addr();

	// ------------------------- 收货地址代码结束 --------------------------------

	/*$scope.addr_show_hide=function(){
		$scope.addr_addresses_show=false;
		$scope.addr_address_show=true;
	};*/

	$scope.init();
	$window.onload = function() {
		$scope.g_loading = false;
	};
	//优惠券
	function cal_coupon() {
		//从未使用的优惠券中拿到符合这件商品的
		$scope.fuhe_condition = []; // 每次清空放进去符合条件的
		angular.forEach($scope.no_use_num, function(data) {
			//	data.condition.type 1 无条件  2 满价  3 满量
			if(data.condition.type == 1) {
				$scope.fuhe_condition.push(data);
			} else if(data.condition.type == 2) {
				if($scope.gorder.t_price > data.condition.num || $scope.gorder.t_price == data.condition.num) {
					$scope.fuhe_condition.push(data);

				};
			} else if(data.condition.type == 3) {
				if($scope.gorder.g_num > data.condition.num || $scope.gorder.g_num == data.condition.num) {
					$scope.fuhe_condition.push(data);
				};
			};
		});
	};
	$scope.choose_one_coupon = function() {
		if($scope.fuhe_condition.length == 0) {
			$scope.click_back = true;
		};
		$scope.coupon_mask = true;
		$scope.yes_or_no = true;
	};

	$scope.xuan_input = function(id, target, discount) {
		//	console.log($scope.fuhe_condition);
		//		$scope.coupon_mask = false;
		$scope.xuan_le = true;
		$scope.mei_xuan = false;
		$(target.target).find('input').prop('checked', true);
		$scope.gorder.coupon_id = id;
		//1  现金  2 折扣
		if(discount.type == 1) {
			$scope.gorder.coupon_price = discount.num;
		} else if(discount.type == 2) {
			$scope.gorder.coupon_price = $scope.gorder.t_price * ((100 - discount.num) / 100);
		};
		$scope.recalculateOrder();
	};
	$scope.xuan_zhong = function() {
		if($scope.gorder.coupon_id) {
			$scope.coupon_mask = false;
			$scope.yes_or_no = false;
		} else {
			alert('请选择一张优惠券');
		};
	};
	$scope.cancle_xuan_zhong = function() {
		$scope.coupon_mask = false;
		$scope.yes_or_no = false;
		if($scope.gorder.coupon_id) {
			$scope.xuan_le = false;
			$scope.mei_xuan = true;
			$(".coupon-mask input").prop('checked', false);
			$scope.gorder.coupon_price = undefined;
			$scope.gorder.coupon_id = undefined;
			$scope.recalculateOrder();
		};
	};
	$scope.no_back = function() {
		$scope.coupon_mask = false;
		$scope.click_back = false;
		$scope.yes_or_no = false;
	};
}]);