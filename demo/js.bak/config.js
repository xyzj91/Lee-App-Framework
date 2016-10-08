//全局配置文件
config = {
	server_Path:"http://www2.youtuwo.com/",
	api_Path:"/index.php/API/",
	home_Path:"/index.php/Home/",
	chat_server:"chat.youtuwo.com",
	img_path:"http://www2.youtuwo.com/index.php/API/Album/thumb",
};  

/**
 * 兼容 AMD 模块
 **/
if (typeof define === 'function' && define.amd) {
	define('config', [], function() {
		return config;
	});
}
/**
 *兼容CMD 模块 
 */
if (typeof define === 'function' && define.cmd) {
	define('config', [], function() {
		return config;
	});
}
