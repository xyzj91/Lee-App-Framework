//语言配置文件
language = {
	zh:{
		PHONE_TYPE_ERROR:"手机号码格式错误！",
		MESSAGE_SEND_SUCCESS:"亲，短信发送成功，请注意查收！",
		NETWORK_REQUEST_ERROR:"亲,网络请求失败了！",
		APP_NAME:"优兔-",
		SHARE_MODEL_TITLE:"的模卡-拼拍用【优兔】",
		SHARE_MODELSCHEDULE_TITLE:"的档期信息",
		SHARE_MODEL:"模特",
		SHARE_YOUTU:"的模卡信息资料,优兔中国最专业的电商模特服务机构。",
		SHARE_YOUTU_SCHEDULE:"的档期信息资料,优兔中国最专业的电商模特服务机构。",
		PASWORD_SIX:"密码长度不能小于6位",
		LOGIN_SUCCESS:"登录成功",
		INFORMATION_FAIL:"数据写入失败",
		REG_SUCCESS:"注册成功",
		REG_FAIL:"注册失败",
	},
	en:{
		
	}
};
/**
 * 兼容 AMD 模块
 **/
if (typeof define === 'function' && define.amd) {
	define('language', [], function() {
		return language;
	});
}
/**
 *兼容CMD 模块 
 */
if (typeof define === 'function' && define.cmd) {
	define('language', [], function() {
		return language;
	});
}