var login = angular.module('login', []);
login.controller('login-controller', ['$scope', '$window', function($scope, $window) {
	$scope.HOST = HOST;
	$scope.HOST_API = HOST_API;
	$scope.HOST_IMAGE = HOST_IMAGE;
	$scope.link = function(url) {
		$window.location.href = HOST + url;
	};

	$scope.footer_active = 'profile';

	$(document).ready(function() {
		if($('#user-name').val() == '' || $('#password').val() == '') {
			document.getElementById("deng-lu").disabled = true;
		} else {
			document.getElementById("deng-lu").disabled = false;
			$('#deng-lu').css('background', '#F53737');
		};
		$scope.user_name = '';
		$scope.pass_word = '';
		$scope.change_user_info = function() {
			if($scope.user_name.length != 0 && $scope.pass_word.length != 0) {
				document.getElementById("deng-lu").disabled = false;
				$('#deng-lu').css('background', '#f53737');
			} else {
				document.getElementById("deng-lu").disabled = true;
				$('#deng-lu').css('background', '#b2b2b2');
			};
		};

		$('#deng-lu').click(function() {

			//			if($('#user-name').val() == '' || $('#password').val() == '') {
			//				$scope.alert = {
			//					on: true,
			//					icon: 'warning',
			//					buttonStyle: 'none', // 'single', 'double', 'none'
			//					message: '用户名或者密码不能为空'
			//				};
			//				$scope.$apply();
			//				setTimeout(function() {
			//					$scope.alert.on = false;
			//					$scope.$apply()
			//				}, 1500);
			//
			//			} 
			//	else {
			$.ajax({
				type: "post",
				url: HOST_API + "/user/login",
				async: true,
				data: {
					"username": $('#user-name').val(),
					"password": $('#password').val()
				},
				dataType: 'json',
				success: function(data) {

					if(data.code === 0) {
						if(data.data.user) {

							TBMM.clear(); // 清除TBMM内缓存数据，注意一定要放在最前面

							//data.data.user.expires = new Date().getTime() + 86400*1000;
							data.data.user.SESSIONID = data.data.SESSIONID;
							localStorage.setItem("user", JSON.stringify(data.data.user));
							$.cookie('SESSIONID', data.data.SESSIONID, {
								expires: 1,
								path: "/"
							});
							//console.log(localStorage.getItem("user"));
							//console.log($.cookie('SESSIONID'));

							var fromUrl = $.query.get("fromUrl");
							window.location.href = fromUrl || document.referrer || HOST + '/index.html';

						}
					} else {
						$('#user-name').css('border', '1px solid #f53737');
						$('#user-name').focus();
						$('#password').css('border', '1px solid #f53737');
						TBMM.ajaxHandle(data);
					};

				},
				error: function() {
					alert("用户信息数据获取失败");
				}
			});
			//	};

		});

	});
}]);