/**
 * Lee APPFrame 工具类 V3.0  BY:Alen
 * Lee App框架 V3.0是一个基于MUI底层实现的一套底层JS框架，解决了市面上同类技术标准不统一，开发不规范，开发出来的产品性能
 * 和体验差的问题。实现了功能标准化、业务抽象化。使开发人员可以更加专注的去实现页面效果，而不用太过于去考虑底层的实现。
 * v1.1 功能点：封装了网络请求，封装了业务打开逻辑，封装了数据存储、封装了图像缓存、I18N。
 * v2.0 功能点：重写页面传值以及子页面打开方法，使之更稳定。新增广播函数，可以向所有页面发送广播消息。新增页面显示、隐藏、加载完成、关闭四大事件。可通过广播监听这四个事件。
 * v3.0 功能点：重新架构整个底层，使之更稳定并解决在Android5.0以上页面遮挡的问题。解决在页面加载时因为其他因素导致的等待框无法被自动关闭的BU
 * G,新增加在IOS下默认使用WKWebview，使之可以兼容indexDB,将缓存存储方式修改为indexDB
 **/
var utils = (function(ow) {
	var openw=null,waiting=null,animation_in="pop-in";
	ow.defaultHeader = "_www/app/template-header.html"; 
    /**
     *创建共享页面 模版
     * @param {Json} options 参数
     * id中名称注意：
     * quickOpen 不使用父子模版方打开,立即打开页面，暂时只支持独立页面方式（现加载模式）
     * alone 使用无头尾方式打开（预加载模式）
     * need-header 使用有头无尾方式打开（预加载模式）
     * 默认使用有头有尾方式打开(预加载模式)
     */
    ow.createTemplate = function(options){
    	if(!options.id){console.error("please set options.id");return;}
    	if(options.headerpanel){//设置头部URL地址
    		options.headerurl = options.headerurl?options.headerurl:ow.defaultHeader;
    	}
    	ow._getWebObj(options);
		console.log("共享页"+options.id+"被初始化");
    }
    /*使用模版打开页面，前提是已经使用createTemplate创建了模版对象
   	 * @param {Json} options 参数
     * id中名称注意：
     * quickOpen 不使用父子模版方打开,立即打开页面，暂时只支持独立页面方式（现加载模式）
     * alone 使用无头尾方式打开（预加载模式）
     * need-header 使用有头无尾方式打开（预加载模式）
     * 默认使用有头有尾方式打开(预加载模式)
     */
    ow.openWindowforTemplate = function(options){
    	if(!options.id){console.error("please set options.id");return;}
    	if(!options.url){console.error("please set options.url");return;}
    	console.log("使用共享模版->"+options.id+"打开页面->"+options.url);
    	ow._locationHref(options);
    }
    
    /**
     * 页面跳转函数
     * @param {JSON} options 配置文件
     * id中名称注意：
     * quickOpen 不使用父子模版方打开,立即打开页面，暂时只支持独立页面方式（现加载模式）
     * alone 使用无头尾方式打开（预加载模式）
     * need-header 使用有头无尾方式打开（预加载模式）
     * 默认使用有头有尾方式打开(预加载模式)
     */
    ow.locationHref = function(options){
    	if(!options.url){console.error("please set options.url");return;}
    	if(options.headerpanel){//设置头部URL地址
    		options.headerurl = options.headerurl?options.headerurl:ow.defaultHeader;
    	}
    	ow._locationHref(options);
    }
    
    /**
     * 发送值到上一个页面  上一个页面可通过dataRequestCbk回调函数获得传递过来的参数
     * @param {String} id 页面ID 每个页面打开时都会有传递一个lastpageid
     * @param {Json} exp  参数 jsonString类型
     */
    ow.returnToLastPage = function(id,exp){
    	if(!exp){console.error("参数有误");return;}
    	id = id?id:ow.lastpageid;
    	var webview = plus.webview.getWebviewById(id);
    	//传递过来的参数
    	if(typeof(exp)=="string"){
    		exp = JSON.parse(exp);
    	}
    	if(webview){
    		//调用广播发送函数向指定页面发送广播
    		ow.sendBroadCastByWebview(webview,ow.REQUESTDATA,exp);
    		console.log("发送广播到->"+id+"成功");
    	}else{
    		console.error('参数接收页面不存在->'+id);
    	}
    }
    
    /**
     * 发送消息到子页面 子页面可通过dataRequestCbk回调函数获得传递过来的参数
     * @param {String} id
     * @param {JSON} exp
     */
    ow.sendBroadToChild = function(exp){
    	if(!exp.type){console.error("please set type");return;}
    	var id = ow.ws.id.replace("header","content");//获得子页面ID
    	ow.returnToLastPage(id,exp);
    }
    /**
     * 发送消息到父页面 父页面可通过dataRequestCbk回调函数获得传递过来的参数
     * @param {String} id
     * @param {JSON} exp
     */
    ow.sendBroadToParent = function(exp){
    	if(!exp.type){console.error("please set type");return;}
    	var id = ow.ws.parent();
    	ow.returnToLastPage(id,exp);
    }
    
/**********************************至此页面传递方面完成*********************************************/ 

    /**
     *打开等待框 
     */
    ow.openWaiting = ow.showWaiting = function(title){
    	var title = title?title:"";
    	waiting = plus.nativeUI.showWaiting(title);
		return waiting;
    }
    //设置等待框标题
    ow.waitingTitle = function(waiting,title){
    	title = title?title:"";
    	waiting.setTitle(title);
    }
    
    /**
     *关闭等待框 
     */
    ow.closeWaiting = function(wait){
    	if(wait){
    		wait.close();
    	}else{
    		if(waiting){
    			waiting.close();
    		}
    	}
		waiting=null;
    }
    /**
     *关闭并返回上一页面 
     */
    ow.back=function(detail){
    	plus.webview.close(ow.ws);
    	if(typeof(detail)!='undefined'&&detail!=""){
    		detail.close();//父页面关闭时关闭子页面
    	}
    }
    
    /**
     * 双击退出函数(一般只在首页加载该功能)
     */
    ow.twoClickExit = function(){
    	plus.key.addEventListener('backbutton',function(){
    		backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
    	});
	};
	/**
	 * 获取设备详细信息 
	 */
	ow.getPhoneInfo =function(){
		var phone = new Array();
		phone['uuid'] = plus.device.uuid;//设备唯一标识
		phone['model'] = plus.device.model;//获取设备型号
		phone['dvendor'] = plus.device.vendor;//设备生产厂商
		phone['osname'] =  _getOsType(plus.os.name);//系统名称
		phone['osvendor'] = plus.os.vendor;//系统厂商
		phone['oslang'] = plus.os.language;//系统语言
		phone['osversion'] = plus.os.version;//系统版本
		phone['appversion'] = plus.runtime.version;//当前程序版本
		return phone;
	}
    
   
    /**
     *设置桌面图标数字角标 
     * @param {Int} num
     */
    ow.setIconNum = function(num){
    	if(num){
    		plus.runtime.setBadgeNumber(num);
    	}else{
    		plus.runtime.setBadgeNumber(0);
    	}
    }
    
    _getOsType = function(osname){
    	switch (osname){
    		case 'Android':
    			return 1;
    			break;
    		case 'iOS':
    			return 2;
    			break;
    		default:
    		return 3;
    			break;
    	}
    }
    /**
     *获取页面载入动画效果 
     */
  	ow.getAnimation = function(){
  		return animation_in;
  	}
  	/**
  	 *打印日志到控制台函数 
  	 * @param {Object} data
  	 * @param {boolean} isalert 弹出
  	 */
  	ow.printLog = function(data,isalert){
		if(typeof(data)!="string"){
			data = JSON.stringify(data);
		}
  		if(!isalert){
  			console.log(data);
  		}else{
  			alert(data);
  		}
  	}
  	//显示确认面板options{content：xxx,title:xxx}
  	ow.showConfirmPenal = function(options,scbk,ecbk){
  		plus.nativeUI.confirm(options.content,function(e){
  			if(e.index==0){
  				if(ecbk){
  					ecbk();
  				}
  			}else{
  				if(scbk){
  					scbk();
  				}
  			}
  		},options.title,["取消","确认"]);
  	}
	return ow;
})(app);	
/**
 * 兼容 AMD 模块
 **/
if (typeof define === 'function' && define.amd) {
	define('utils', ["mui","app"], function() {
		return utils;
	});
}
/**
 *兼容CMD 模块 
 */
if (typeof define === 'function' && define.cmd) {
	define('utils', ["mui","app"], function() {
		return utils;
	});
}