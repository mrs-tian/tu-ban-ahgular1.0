


(function(TBMM){
	
	TBMM.wxSign = function(){
		
		/*TBMM.isLogin(true, function(isLogin) {
			console.log(isLogin);
			window.location.href = HOST+"/login/login.html"
		});*/
		
		
		// 微信浏览器
		if(TBMM.isWeiXin()){ // TODO 临时测试

	    	var user = JSON.parse(localStorage.getItem("user")); 
	    	
	    	var code = $.query.get('code'); //  TODO 获取url上参数
	    	var sid = $.query.get('sid'); //
	    	
	    	// 保存店铺信息，用于微信跳转回登陆后绑定店铺，生命周期为当前窗口
	    	if (sid) {
	    		sessionStorage.setItem("bound_sid", sid)
	    	}
	    	
	    	TBMM.isLogin(true, function(isLogin) {
	    		
	    		// 没登录
	    		if (!isLogin) {
	    		
		    		// 没有参数的链接地址
		    		var uri = location.href.split('?')[0]; //window.location.protocol+location.host+location.pathname;
		    		//console.log(uri)
		    		
		    		// 微信code值不为空
		    		if (code) {
		    			// 通过code获取用户信息
		    			
		    			$.ajax({
							type: "get",
							url: HOST_API + "/weixin/getWxUserByAccessCode",
							dataType: 'json',
							data: {
								"code": code,
								"sid": sessionStorage.getItem("bound_sid") || 0
							},
							success: function(data) {
								// 成功，没有会新建
								if (data.code == 0) {
	
									if (data.data.user) {
										
										TBMM.clear(); // 清除TBMM内缓存数据，注意一定要放在最前面
										//alert(JSON.stringify(data.data.user));
										//alert(data.data.SESSIONID);
										// 一天的过期时间
										//data.data.user.expires = new Date().getTime() + 86400*1000;
										data.data.user.SESSIONID = data.data.SESSIONID;
										//alert(JSON.stringify(data.data.user));
										localStorage.setItem("user", JSON.stringify(data.data.user));
										$.cookie('SESSIONID', data.data.SESSIONID, {expires: 1, path: "/"}); // 注意path设置
									}
									
								} 
								// 通过code获取用户失败
								else if (data.code == -5) {
									// 获取用户失败很有可能code失效或者用户分享出去链接后带有code参数，需要删除code重新到参数
					    			$.query.REMOVE('code');
					    			console.log(uri+$.query.toString());
					    			window.location.href = uri+$.query.toString();
					    			return;
								}
							},
							error: function(e) {
								console.log("请求获取微信用户接口出现了错误", e);
							}
						});
		
		    			
		    			
		    			
		    		} else {
		    			
		    			console.log("发起跳转");
		    			
		    			// 跳转到获取code链接
		    			
		    			var redirect_url = HOST_WX + '/wx/common_redirect?url='+uri+$.query.toString();
		                var state = sid || 0;
						console.log(redirect_url);
						
		                var wx_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+TBMM.conf.WX_PUB_APPID+"&redirect_uri="+redirect_url+"&response_type=code&scope=snsapi_userinfo&state="+state+"#wechat_redirect"
		                console.log(wx_url)
		               	window.location.href = wx_url;
		               	return;
		                
		    		}
		    	} 
		    	// 用户已登录
		    	else {
	
		    		console.log("用户已登录，", user.openid);
		    		
		    		if (sid && user['role_id'] == 100 && user['parent_1'] <= 1 && user['parent_1'] != parseInt(sid) && parseInt(sid) > 1) {
		    			$.ajax({
							type: "get",
							url: HOST_API + "/user/"+user.id+"/setParent",
							async: true,
							dataType: 'json', //给的字符串，写这句话 可以不用parse转换成对象；这句话自带转成对象
							data: {
								'sid': sid,
							},
							success: function(data) {
								console.log(data);
							},
							error: function(e) {
								console.log("绑定店铺失败", e);
							}
						});
		    		}
		    		
		    		// 绑定关系
		    		
		    	}
	    	});
	    	
	    	//////////////////////////////////////////////////////////////////////////////////////
	    	// 用户未登录
	    	/*if (!user || !user.SESSIONID || $.cookie('SESSIONID') != user.SESSIONID) {
	    		
	    		// 没有参数的链接地址
	    		var uri = location.href.split('?')[0]; //window.location.protocol+location.host+location.pathname;
	    		//console.log(uri)
	    		
	    		console.log($.query.toString());
	    		
	    		// 微信code值不为空
	    		if (code) {
	    			// 通过code获取用户信息
	    			
	    			$.ajax({
						type: "get",
						url: HOST_API + "/weixin/getWxUserByAccessCode",
						dataType: 'json',
						data: {
							"code": code,
							"sid": sessionStorage.getItem("bound_sid") || 0
						},
						success: function(data) {
							// 成功，没有会新建
							if (data.code == 0) {

								if (data.data.user) {
									
									TBMM.clear(); // 清除TBMM内缓存数据，注意一定要放在最前面
									//alert(JSON.stringify(data.data.user));
									//alert(data.data.SESSIONID);
									// 一天的过期时间
									//data.data.user.expires = new Date().getTime() + 86400*1000;
									data.data.user.SESSIONID = data.data.SESSIONID;
									//alert(JSON.stringify(data.data.user));
									localStorage.setItem("user", JSON.stringify(data.data.user));
									$.cookie('SESSIONID', data.data.SESSIONID, {expires: 1, path: "/"}); // 注意path设置
								}
								
							} 
							// 通过code获取用户失败
							else if (data.code == -5) {
								// 获取用户失败很有可能code失效或者用户分享出去链接后带有code参数，需要删除code重新到参数
				    			$.query.REMOVE('code');
				    			console.log(uri+$.query.toString());
				    			window.location.href = uri+$.query.toString();
				    			return;
							}
						},
						error: function(e) {
							console.log("请求获取微信用户接口出现了错误", e);
						}
					});
	
	    			
	    			
	    			
	    		} else {
	    			
	    			console.log("发起跳转");
	    			
	    			// 跳转到获取code链接
	    			
	    			var redirect_url = HOST_WX + '/wx/common_redirect?url='+uri+$.query.toString();
	                var state = sid || 0;
					console.log(redirect_url);
					
	                var wx_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+TBMM.conf.WX_PUB_APPID+"&redirect_uri="+redirect_url+"&response_type=code&scope=snsapi_userinfo&state="+state+"#wechat_redirect"
	                console.log(wx_url)
	               	window.location.href = wx_url;
	               	return;
	                
	    		}
	    	} 
	    	// 用户已登录
	    	else {

	    		console.log("用户已登录，", user.openid);
	    		
	    		if (sid && user['role_id'] == 100 && user['parent_1'] <= 1 && user['parent_1'] != parseInt(sid) && parseInt(sid) > 1) {
	    			$.ajax({
						type: "get",
						url: HOST_API + "/user/"+user.id+"/setParent",
						async: true,
						dataType: 'json', //给的字符串，写这句话 可以不用parse转换成对象；这句话自带转成对象
						data: {
							'sid': sid,
						},
						success: function(data) {
							console.log(data);
						},
						error: function(e) {
							console.log("绑定店铺失败", e);
						}
					});
	    		}
	    		
	    		// 绑定关系
	    		
	    	}*/
	    	
	    	////////////////////////////////////////////////////////////////
	    }
	}

	
	// 初始化
	TBMM.wxSign();
	
	
})(TBMM);
