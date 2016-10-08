/**
 * Lee APPFrame 工具类 V3.0  BY:Alen
 * Lee App框架 V3.0是一个基于MUI底层实现的一套底层JS框架，解决了市面上同类技术标准不统一，开发不规范，开发出来的产品性能
 * 和体验差的问题。实现了功能标准化、业务抽象化。使开发人员可以更加专注的去实现页面效果，而不用太过于去考虑底层的实现。
 * v1.1 功能点：封装了网络请求，封装了业务打开逻辑，封装了数据存储、封装了图像缓存、I18N。
 * v2.0 功能点：重写页面传值以及子页面打开方法，使之更稳定。新增广播函数，可以向所有页面发送广播消息。新增页面显示、隐藏、加载完成、关闭四大事件。可通过广播监听这四个事件。
 * v3.0 功能点：重新架构整个底层，使之更稳定并解决在Android5.0以上页面遮挡的问题。解决在页面加载时因为其他因素导致的等待框无法被自动关闭的BU
 * G,新增加在IOS下默认使用WKWebview，使之可以兼容indexDB,将缓存存储方式修改为indexDB
 **/
(function($,ow) {
	var openw=null,waiting=null,animation_in="pop-in";
	ow.defaultHeader = "_www/app/template-header.html"; 
    /**
     *创建共享页面 模版
     * @param {Json} options 参数
     * id中名称注意：
     * quickOpen 不使用父子模版方打开,立即打开页面，暂时只支持独立页面方式（现加载模式）
     * alone 使用无头尾方式打开（预加载模式）
     * needhead 使用有头无尾方式打开（预加载模式）
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
     * needhead 使用有头无尾方式打开（预加载模式）
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
     * needhead 使用有头无尾方式打开（预加载模式）
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
  	/*******************************************新加************************************************************/
  	/**
	 * 网络状态判断封装
	 */
	ow.getNetWorkState = function(callback){
		var network = true;
		if($.os.plus){
			$.plusReady(function () {
				if(plus.networkinfo.getCurrentType()==plus.networkinfo.CONNECTION_NONE){
					network = false;
				}
				callback(network);//执行回调
			});
		}
		
	}
	
	/**
	 * 网络请求封装
	 * @param {Object} option 操作配置
	 * @param {Object} DataArr 发送的数据
	 * @param {Object} successCallback 成功回调
	 * @param {Object} errorCallback 失败回调
	 */
	ow.sendData = function(option,DataArr,successCallback,errorCallback){
		if(app.dataStorage("token")){
			DataArr.token = app.dataStorage("token"); 
			app.printLog("token 存在，发送token");
		}
		console.log(config["server_Path"]+option["url"]);
		ow.getNetWorkState(function(state){
			if(state){
				$.ajax({
					type:option["type"],
					url:config["server_Path"]+option["url"],
					async:true,
					data:DataArr,
					dataType:"json",
					timeout:300000,//超时时间30秒
					success:function(data){
						console.log(JSON.stringify(data));
						if(data){
							if(!option.nologin){//如果需要验证登录
								
								if(data.message=="未登录"){//没有登录
									autologin.exitLogin();
									app.openWindow_noheader("login.html");
									return;
								}
							}
							
						}
						successCallback(data); 
					},
					error:function(xhr,type,errorThrown){
						app.printLog(type);
//						mui.toast("网络链接超时");
						errorCallback(xhr,type,errorThrown);
						if(type=="parsererror"){
							app.printLog("=======服务器返回数据格式错误=====");
							app.printLog(xhr);
						}
						if(type=="timeout"){
							mui.toast("亲，您的网络状况不佳哦！");
							app.printLog("=======网络连接超时=====");
						}
						if(type=="error"){
							app.printLog("=======服务器连接错误=====");
						}
						if(type=="null"){
							mui.toast("亲，您的网络状况不佳哦！");
							app.printLog("=======无返回值=====");
						}
						if(type=="abort"){
							mui.toast("亲，您的网络状况不佳哦！");
							app.printLog("======网络异常结束======");
						}
					}
				});
			}else{
				$.toast("当前网络不给力，请稍后再试");
			}
		});//判断网络状态
	}
	/**
	 * 发送get网络请求
	 * @param {Object} url 接口地址
	 * @param {Object} option 参数
	 * @param {Object} scbk 成功回调
	 * @param {Object} ecbk 失败回调
	 */
	ow.sendGetData = function(url,option,scbk,ecbk){
		ow.sendData({   
			type:"get", 
			url:config['api_Path']+url
			},option,function(data){
				app.closeWaiting(waiting);
				if(data.flag==1){
					console.error("请求成功");
					if(scbk){
						scbk(data.data);
					}
				}else{
					if(ecbk){
						ecbk(data);
					}
					console.error(JSON.stringify(data));  
				}
			},function(data,type,errorThrown){
				console.error(JSON.stringify(data)); 
				app.closeWaiting(waiting);
		});
	}
	
	/**
	 * 发送post网络请求
	 * @param {Object} url 接口地址
	 * @param {Object} option 参数
	 * @param {Object} scbk 成功回调
	 * @param {Object} ecbk 失败回调
	 */
	ow.sendPostData = function(url,option,scbk,ecbk){
//		var waiting = app.showWaiting();
		ow.sendData({   
			type:"post", 
			url:config['api_Path']+url
			},option,function(data){
//				app.closeWaiting(waiting);
				console.log(JSON.stringify(data));
				if(data.flag==1){
					console.log("请求成功");
					if(scbk){
						scbk(data.data);
					}
				}else{
					if(ecbk){
						ecbk(data);
					}
					console.log(data.messages);  
				}
			},function(data,type,errorThrown){
//				app.closeWaiting(waiting);
				console.log(JSON.stringify(data)); 
		});
	}
	/**
	 * 软键盘确定按钮点击
	 * @param {Object} cbk
	 */
	ow.okButtonClick = function(cbk){
		window.onkeydown = function(event){
			var e = event || window.event || arguments.callee.caller.arguments[0];
			cbk(e.keyCode);
		}
	}
  	/**
	 * 图片选择类
	 * @param {Boolean} su_cb 成功回调
	 * @param {Boolean} err_cb 失败回调
	 * @param {Boolean} op 操作类型 true 从相册中选择，false 拍照
	 * @param {Boolean} multiple true 多选 false 单选
	 */
	ow.choiceImg = function(su_cb,err_cb,op,multiple){
		op = op?op:false;
		multiple = multiple?multiple:false;
		if(op){	
			plus.gallery.pick(function(path){
				su_cb(path);//成功回调
			},function(e){
				err_cb(e);//失败回调
			},{filter:"image",multiple:multiple});
		}else{
			var camera = plus.camera.getCamera();//获得摄像头对象
			camera.captureImage(function(path){//摄像头拍照
				su_cb(plus.io.convertLocalFileSystemURL(path));
			},function(e){
				err_cb(e);
			}); 
		}
	}
	/**
	 * 将base64字符串存储为图片
	 * @param {Object} data base64字符串
	 * @param {Object} path 图片存储路径
	 * @param {Object} scbk 成功回调
	 */
	ow.saveBase64ToImg = function(data,path,scbk){
		var bitmap = new plus.nativeObj.Bitmap("resover");
		bitmap.loadBase64Data(data,function(){
			bitmap.save(path,{overwrite:true},function(event){
				scbk(event);//成功回调
			},function(e){
				mui.toast("图片存储失败");
			});
		},function(){
			mui.toast("图片转换失败");
		});
	}
	/**
	 *  头像压缩处理函数(可用于压缩其他图片)
	 * @param {Object} path
	 * @param {Object} scbk
	 */
	ow.compressHeadImage = function(path,scbk){
		var spath = "_doc/"+ow.getImgName(path);//图片存储路径
		ow._compressImage(path,spath,headimgwidth,function(){
			scbk(spath);
		},function(e){
			mui.toast("图片转换失败");
		});
	}
	/**
	 * 图片压缩函数
	 * @param {String} path 图片路径
	 * @param {Object} savePath 图片存储路径
	 * @param {Object} width 图片宽度
	 * @param {Object} scbk 成功回调
	 * @param {Object} ecbk 失败回调
	 */
	ow._compressImage = function(path,savePath,width,scbk,ecbk){
		plus.zip.compressImage({
			src:path,
			dst:savePath,
			width:width,
			overwrite:true
		},function(){//成功回调函数
			scbk();
		},function(e){//失败回调函数
			ecbk(e);
		});
	}
	/**
	 *图片延迟加载 
	 */
	var lazyload = null;
	ow.lazyLoadImage = function(){
		var url = plus.io.convertLocalFileSystemURL('_www/images/default.jpg');
		lazyload = mui(document).imageLazyload({
			placeholder: url,//默认图片
			autoDestroy:true,//加载完成自动销毁
//			force:true,//强制全部加载
			diff:1000//据顶部距离
		});
	}
	//销毁lazyload对象，防止在没有加载完成时，重新调用无效
	ow.destroyLazyload = function(lazyObj){
		if(lazyload||lazyObj){
			if(lazyObj){
				lazyload = lazyObj;
			}
			app.printLog("lazyload对象存在，销毁之");
			lazyload.destroy();//销毁lazyload对象
		}
	}
	
	/**
	 *文件下载函数 
	 * @param {String} path 网络路径
	 * @param {String} savePath 存储本地路径
	 * @param {Object} cbk 回调函数
	 */
	ow.downFile = function(path,savePath,cbk,statechangeCbk,ecbk){
		var absolute_image_path = plus.io.convertLocalFileSystemURL(savePath);//将本地URL转换成平台绝对路径
		var temp_img = new Image();
		temp_img.src = absolute_image_path;
		temp_img.onload = function(){
			console.log("文件存在，直接返回路径");
			cbk(savePath);
		}
		temp_img.onerror = function(){//文件不存在则下载
			console.log("文件不存在，开始下载");
			if(savePath){
				var op = {filename:savePath};
			}else{
				var op = {};
			}
			var down = plus.downloader.createDownload(path,op,function(download,status){
				if(status==200){
					if(cbk){
						var nativepath = plus.io.convertLocalFileSystemURL(download.filename);
						console.log("文件下载完成:"+nativepath);
						cbk(nativepath);
					}
				}else{
					if(ecbk){
						ecbk();
					}
					console.log("网络文件不存在或者操作失败");
				}
			});
			var fileSize,fileDownSize;
			down.addEventListener("statechanged",function(download, status){
				fileSize = Math.ceil((download.totalSize/1048576)*10)/10;//文件总大小
				fileDownSize = Math.ceil((download.downloadedSize/1048576)*10)/10;//已下载大小
				if(statechangeCbk&&download.state==3){
					statechangeCbk(fileSize,fileDownSize);
				}
			},false);//监听任务状态变化
			down.start();
		}
		
	}
	/**
	 * 获得图片名称
	 * @param {Object} path
	 */
	ow.getImgName = function(path){
		app.printLog(path);
		var spath = path.split("/");
		return spath[spath.length-1];
	}
	//压缩并裁剪网络图片
	ow.zipNetImg = function(path,w,h){
		if(path.indexOf(".com")>0){//如果是完整url地址
			var tmpArr = path.split(".com");
			path = tmpArr[1];
		}
		var netpath = config["img_path"]+"?width="+w+"&height="+h+"&imagepath="+path;
		return netpath;
	}
	//缓存压缩并裁剪网络图片 次函数须配合cache.js使用
	ow.CachezipImg = function(path,w,h,cbk){
		var filePath = ow.zipNetImg(path,w,h); //拼接网络地址
//		cbk(filePath);//todo暂时此处不做缓存，对延迟加载有影响
		cache.CacheFile(filePath,cbk); 
	}
	/**
	 * 页面长按事件 longtap事件默认是关闭的，请注意在创建webview时是否开启
	 * @param {Json} option 长按配置
	 * {menus:{},longTouchImg:true,touchDomClass:"touchdom name",pop:true,cbk:function(type){}}
	 * app.longTouch({longTouchImg:true,pop:true,menus:[{title:"复制到剪贴板",opType:"copy"},{title:"保存",opType:"save"}],cbk:longtouchs});//长按事件监听
	 */
	ow.longTouch = function(option){
		if(!option||!option.cbk){
			console.error("参数错误");
			return false;
		}
		var menus = option.menus?option.menus:{};
		var touchDom,viewDom,tdom;
		var longtouchevent = option.touchDomEvent?option.touchDomEvent:ow.LONGTOUCHEVENT;
		var longtouchitem = option.touchDomClass?option.touchDomClass:ow.LONGTOUCHITEM;
		//根据类型传递创建并生成dom
//		if(option.longTouchImg){//如果是长按图片
		touchDom = "."+longtouchitem;
//		}else{
//			touchDom = option.touchDomClass?"."+option.touchDomClass:"."+ow.LONGTOUCHITEM_OTHER;
//		}
		//先取消监听，否则可能导致事件多次执行
		mui("."+longtouchevent).off("longtap",touchDom);
		//长按监听
		mui("."+longtouchevent).on("longtap",touchDom,function(event){
			console.log("长按监听");
			var thisDom = this;
			if(option.pop){//如果是气泡弹窗
				ow.miniPopver(menus,this,function(type){
					option.cbk(type,thisDom);
				});
			}else{//如果是原生选择器
				ow.nativeActionSheet("",menus,function(type){
					option.cbk(type,thisDom);
				});
			}
		});
		//按住屏幕监听
//		mui("."+ow.LONGTOUCHEVENT).on("hold",touchDom,function(event){
//		});
//		//离开屏幕监听
//		mui("."+ow.LONGTOUCHEVENT).on("release",touchDom,function(event){
//		});
	}
	/**
	 * 将缓存中图片或视频保存到本地相册 
	 * @param {String} path
	 */
	ow.saveToAlbum = function(path,cbk){
		//如果不是本地绝对路径
		if(path.indexOf("file://")<0){
			if(path.indexOf("http://")<0){
				path = "file://"+plus.io.convertLocalFileSystemURL(path);
				console.log(path);
				plus.gallery.save(path,function(){
					cbk(true);
				},function(e){
					cbk(e);
				});
			}else{//网络图片
				ow.downFile(path,"",function(path){
					ow.saveToAlbum(path,cbk);
				});
				return;
			}
		}
	}
	//剪贴板 （用于实现内容复制到剪贴板）
    ow.clipBoard = function(value){
    	try{
    		if(!mui.os.ios){//安卓下复制到剪贴板
	    		var Context = plus.android.importClass("android.content.Context");
	    		var main = plus.android.runtimeMainActivity();
	    		var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
	    		plus.android.invoke(clip,"setText",value);
	    	}else{
	    		var UIPasteboard = plus.ios.importClass("UIPasteboard");
	    		var generalPasteboard = UIPasteboard.generalPasteboard();
	    		generalPasteboard.setValueforPasteboardType(value, "public.utf8-plain-text");
	    		var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
	    	}
	    	return true;
    	}catch(e){
    		return false;
    	}
//  	key = key?key:"cache";
//  	if(value!==null){
//  		if(typeof value!="string"){
//  			value = JSON.stringify(value);
//  		}
//  		window.clipboardData.setData(key,value);
//  		return true;
//  	}else{
//  		return window.clipboardData.getData(key);
//  	}
    }
    
    /**
     * 仿微信迷你气泡弹窗
     * @param {Object} menus
     * @param {Object} thisDom
     * @param {Object} cbk
     */
    ow.miniPopver = function(menus,thisDom,cbk){
    	if(mui(".app-longtouchDom")[0]){//如果节点存在
    		//关闭弹窗事件监听
    		mui(".app-longtouchDom").off("tap","li");
			document.getElementsByTagName("body")[0].removeChild(mui(".app-longtouchDom")[0]);//删除节点
		}
		//新建节点
		viewDom = document.createElement("div");
		viewDom.setAttribute("class","app-longtouchDom");
		var tdom = "";
		mui.each(menus,function(index,menu){
			tdom+='<li class="mui-table-view-cell" opt="'+menu.opType+'"><a href="#">'+menu.title+'</a></li>';
		});
		viewDom.innerHTML = '<div id="popover" class="mui-popover"><ul class="mui-table-view">'+tdom+'</ul></div>';
		document.getElementsByTagName("body")[0].appendChild(viewDom);
		console.log(mui(".app-longtouchDom")[0].innerHTML);
		//迷你弹窗点击监听
		mui(".app-longtouchDom").on("tap","li",function(event){
			cbk(this.getAttribute("opt"));//执行回调
		});
		mui('.mui-popover').popover('toggle',thisDom);//显示弹窗
    }
    
	/**
	 * 原生选择菜单控件
	 * @param {String} title 控件标题
	 * @param {Json} menus {title:"1111",opType:"22222"}菜单样式
	 * @param {Obj} cbk 回调函数
	 */
	ow.nativeActionSheet = function(title,menus,cbk){
		plus.nativeUI.actionSheet({title:title,cancel:"取消",buttons:menus},function(e){
			mui.each(menus,function(index,menu){
				if(index==e.index-1){
					cbk(menu.opType);//执行回调
					return;
				}
			});
		});
	}
	
	
	
	/**
	 * 图片裁剪函数
	 * @param {Object} src 图片路径
	 * @param {Object} dst 存储路径
	 * @param {Object} option 设置参数
	 * @param {Object} su_cb 成功回调
	 * @param {Object} err_cb 失败回调
	 */
	ow.clipImage = function(src,dst,option,su_cb,err_cb){
		//todo
	}
	/**
	 * 图片上传函数
	 * @param {String} url 服务器地址
	 * @param {Array} imgArr 图片地址 数组形式
	 * @param {Json} data   上传到服务器的其他值
	 * @param {Object} cbk 回调函数 stat 服务器请求状态 200为成功  pathArr 上传成功后本地图片地址
	 */
	ow.uploadImage = function(url,imgArr,data,cbk){
		var urls = config["server_Path"]+url;
		var pathArr = new Array();
		app.openWaiting();//显示等待框
//		console.log(JSON.stringify(imgArr));
		if(imgArr.length>0){
			var upload = plus.uploader.createUpload(urls,{ method:"POST",blocksize:204800,priority:100 },function(up,stat){
//				console.log(JSON.stringify(up.responseText));
				cbk(stat,pathArr,JSON.parse(up.responseText));
				app.closeWaiting();//关闭等待框
			});
			var b = 0;
			for (var i = 0; i < imgArr.length; i++) {
				app.printLog(app.getUrlName(imgArr[i]));
				//图片压缩函数
				ow.compressHeadImage(imgArr[i],function(path){
					b++;
					console.log("添加上传文件"+path);
					var localpath = "file://"+plus.io.convertLocalFileSystemURL(path);
					pathArr.push(localpath);
					console.log(localpath);
					upload.addFile(localpath,{key:app.getUrlName(path)});
					if(b==imgArr.length){//图片压缩完成之后启动上传
						app.printLog("开始上传");
						if(data){
							upload.addData("orderid",data.orderid);
						}
						upload.addData("token",app.dataStorage("token"));
						upload.start();
					}
				});
			}
		}else{
			return;
		}
	}
	//按钮倒计时函数 手机验证,判断60s之后再发送验证码
    ow.timeDown = function() {
    	var vercode=document.getElementById("ver-button");
        if (countdown == 0) {
            vercode.removeAttribute("disabled");
            vercode.value = "获取验证码";
            countdown = pedown;//恢复成初始时间
            return clearTimeout();//清除定时，没有的话会导致后面每次减一越来越快
        }
		else {
			vercode.value = "重新发送(" +countdown+ ")";
          	vercode.setAttribute("disabled", true);
            countdown--;
        }
        setTimeout(function() {
                ow.timeDown();
            }, 1000);//定时每秒减一
    }
    
    //获取用户位置坐标 successcallback 成功回调 ecbk 失败回调
    ow.getUserPosition = function(successcallback,ecbk){
    	plus.geolocation.getCurrentPosition(function(request){//获取成功
    		successcallback(request);
    	},function(request){//获取失败
    		ecbk();
    		mui.toast(request.message);
    	},{provider:'baidu'}); 
    }
    
    //获取时间函数
    ow.getDates=function(times){
    	var data = new Array();
    	times = ""+times;
    	if(times.length<13){  
    		var curr_time = new Date(times*1000);
    	}else{
    		var curr_time = new Date(times);
    	}
		data.push(curr_time.getFullYear());
		data.push(curr_time.getMonth()+1);
		data.push(curr_time.getDate());
		data.push(curr_time.getHours());
		data.push(curr_time.getMinutes());
		data.push(curr_time.getSeconds());
		return data; 
    }
    //去掉前后空格
//  ow.StrWhiteBlock=function(opt){
//  	return $.trim(opt);
//  }

    //分享模块 shareType 分享类型 为空则调用系统本地分享界面 success 成功回调 error 失败回调
    ow.share=function(message,success,errors,shareType){
    	plus.share.getServices(function(s){//获取分享列表
			if(typeof(shareType)=="undefined"||shareType==""){//调用系统本地分享界面
				var shareButton=[{title:"微信收藏",value:"WXSceneFavorite"},{title:"微信好友",value:"WXSceneSession"},{title:"微信朋友圈",value:"WXSceneTimeline"},{title:"QQ",value:"qq"},{title:"新浪微博",value:"sinaweibo"},{title:"腾讯微博",value:"tencentweibo"}];
				plus.nativeUI.actionSheet({title:"分享到",cancel:"取消",buttons:shareButton},function(a){
					shareType = shareButton[a.index-1].value; 
					shareSend(message,s,shareType,success,errors);
				});
			}else{
				shareSend(message,s,shareType,success,errors);
			}
			
    	},function(e){
    		mui.toast("获取分享服务失败"+e.message);
    	});

    }
    //发送分享请求
    shareSend = function(message,s,shareType,success,errors){
    	var sinaweibo =""; 
		var tencentweibo ="";
		var qq = "";
		var weixin ="";
		var share ="";
		for (var i in  s) {//拿对象
			if(s[i].id=="sinaweibo"){
				sinaweibo = s[i];
			}else if(s[i].id=="tencentweibo"){
				tencentweibo = s[i];
			}else if(s[i].id=="qq"){
				qq = s[i];
			}else if(s[i].id=="weixin"){
				weixin = s[i];
			}
		}
    	switch (shareType){
			case "weixin":
				share = weixin;
			break;
			case "qq":
				share = qq;
			break;
			case "sinaweibo":
				share = sinaweibo;
			break;
			case "tencentweibo":
				share = tencentweibo;
			break;
			default:
				share =weixin;
			break;
			
		}
    	if(!share){
    		mui.toast("无效的分享操作");
    	}
    	if(share.authenticated){
    		shareSendMessage(message,share,shareType,success,errors);
    	}else{
    		share.authorize(function(){
    			shareSendMessage(message,share,shareType,success,errors);
    		},function(e){
    			mui.toast("授权认证失败："+e.code+ "-"+e.message);
    		});
    	}
		
    }
    //分享信息发送
    shareSendMessage = function(message,share,shareType,success,errors){
    message.extra = {scene:shareType};
	share.send(message,function(){
				success();
			},function(e){
				console.log(JSON.stringify(e));
	  			errors();
			}); 
    }
    
    /**********************************推送******************************************/
    //获取推送客户端ID 在推送时使用 获取后存到全局变量中，存在则直接读取，不存在则重新获取
    ow.getPushClientid = function(){
    	var info = "";
    	if(!app.dataStorage("clientInfo")){
    		info = plus.push.getClientInfo();
    		app.dataStorage("clientInfo",JSON.stringify(info));//存储
    	}else{
    		info = JSON.parse(app.dataStorage("clientInfo"));
    	}
    	return info;
    }
	//前后台切换事件监听
	resumeEvent = function(){
		//程序被切换到后台
		document.addEventListener("pause",function(){
			ow.messageAttention = true;
		});
		//程序被切换到前台
		document.addEventListener("resume",function(){
			ow.messageAttention = false;
		});
	}
    ow.run = true;
    //push广播监听 通知中心 {title:"消息标题",content:"消息内容",payload:{type:"消息类型",value:"消息值"}}
    ow.receiveEvent = function(){
		app.printLog("开始监听");
		// 监听点击消息事件
		plus.push.addEventListener( "click", function( msg ) {
			if(ow.run){//过滤重复消息，防止事件重复执行
				ow.run = false;
				// 处理其它数据
				setTimeout(function(){
					setTrue();
				},50);
				
				console.log(JSON.stringify(msg));
				// 判断是从本地创建还是离线推送的消息
				switch(msg.payload) {
					case "LocalMSG":
						app.printLog( "点击本地创建消息启动：" );
					break;
					default:
						Broadcastrun(msg.payload,"click");
					break;
				}
				
				
			}else{
				app.printLog("=======过滤重复消息=======");
			}
		}, false );
		// 监听在线消息事件
		plus.push.addEventListener( "receive", function( msg ) {
			if(ow.run){//过滤重复消息，防止事件重复执行
				ow.run = false;
				// 处理其它数据
				setTimeout(function(){
					setTrue();
				},50);
				app.printLog("==============");
				if ( msg.aps ) {  // Apple APNS message
					app.printLog( "接收到在线APNS消息：" );
				} else {
					app.printLog( "接收到在线透传消息：" );
					app.printLog(msg);
					Broadcastrun(msg.content);
				}
			
			}else{
				app.printLog("=======过滤重复消息=======");
				setTimeout(function(){
					setTrue();
				},50);
			}
		}, false );
    	
    }
    function setTrue(){
		console.log("开启====");
		ow.run = true;
	}
    //广播消息处理 通知中心
    Broadcastrun = function(data,click){
		app.printLog("开始广播处理");
//  	app.printLog(data);
    	if(click == "click"){//如果是本地点击启动消息
    		data = JSON.parse(data);
    		switch (data.type){
	    		case "chat":
//	    			chat(data);
					//在此处将打开对应消息界面 todo
					ow.nativeOpenCahtPage(data);
//					var temp = ow.getWebObjByName("chat");
	    			break;
	    		default:
	    			ow.nativeOpenNotifyPage(data);
	    			break;
	    	}
    	}else{
    		data = JSON.parse(data);
    		data = data.payload
    		switch (data.type){
	    		case "chat"://在线聊天事件
	    			chat(data);
	    			break;
    			case "time"://同步计时事件
    				console.log(data.time_status);
    				break;
	    		default://通知
	    			notifiCations(data);
	    			break;
	    	}
    		//此处将消息存到数据库
    		ow.saveNotifyCation(data);
    	}
    	
    	
    }
//  在线聊天消息处理
    chat = function(data){
    	//取得聊天界面的webview对象，取得该页面属性是显示还是隐藏，显示就直接调用该页面方法来展示聊天信息，否则将聊天信息显示到通知栏
    	var temp = ow.getWebObjByName("chat");
    	var tuisong = false;
    	if(temp){
    		tuisong = temp.content.isVisible();
    	}else{
    		tuisong = false;
    	}
    	if(!tuisong){//页面不存在或被关闭，显示通知到通知栏
    		var message = {title:"优兔",content:data.description,from_youtuid:data.from_youtu_id,to_youtuid:data.to_youtu_id,msgcontent:data.content,type:"chat"};
    		ow.createNativeMessage(message);//创建本地消息
    	}else{//直接显示到页面中
    		temp.content.evalJS("getMessage('"+data.from_youtu_id+"','"+data.content+"')");
    	}
    	
    }
    /**
     * 通知
     * @param {Object} data
     */
    notifiCations = function(data){
    	//取得通知界面的webview对象，取得该页面属性是显示还是隐藏，显示就直接调用该页面方法来展示通知信息，否则将通知信息显示到通知栏
    	var temp = ow.getWebObjByName("messages");
    	var tuisong = false;
    	if(temp){
    		tuisong = temp.content.isVisible();
    	}else{
    		tuisong = false;
    	}
    	if(!tuisong){//页面不存在或被关闭，显示通知到通知栏
    		var message = {title:"优兔",content:data.description,from_youtuid:data.from_youtu_id,to_youtuid:data.to_youtu_id,msgcontent:data.content,type:data.type};
    		ow.createNativeMessage(message);//创建本地消息
    	}else{//直接显示到页面中
    		temp.content.evalJS("getMessage()");
    	}
    }
    /**
     *创建本地消息 
     * @param {Object} message
     */
    ow.createNativeMessage = function(message){
    	if(mui.os.android){
    		plus.push.createMessage(message.content,message,{title:message.title,cover:true});
    	}else{
    		plus.push.createMessage(message.content,"",{title:message.title,cover:true});
    	}
    }
    /**
     *存储通知到数据库 todo
     */
    ow.saveNotifyCation = function(data){
    	db.openDB(db.dbname);//打开数据库
    	switch (data.type){
    		case "chat":
    			var type = 2;
    			break;
    		case "tuiguang":
    			var type = 1;
    			break;
    		default:
    			var type = 0;
    			break;
    	}
    	var message = db.getTable(db.table_message);//得到消息表
    	var chatid = ow.getChatid(data.from_youtu_id,data.to_youtu_id);
    	var notifyObj = db.insertValue(message,{title:data.title,content:data.content,orderid:data.orderid,chatid:chatid,from_youtuid:data.from_youtu_id,type:data.type});//插入一条数据到消息表
		var msgid = notifyObj.id;
		var notify =  db.getTable(db.table_notifyCation);//得到通知表
    	var notifyObj = db.insertValue(notify,{type:type,isread:0,msg_id:msgid});//插入一条数据到通知表
    	
    }
    /**
     *存储发送的聊天记录 
     * @param {Object} msg
     */
    ow.saveChatLog = function(msg){
    	db.openDB(db.dbname);//打开数据库
    	var message = db.getTable(db.table_message);//得到消息表
//  	var chatid = ow.getChatid(msg.from_youtu_id,msg.to_youtu_id);//得到会话ID
    	//插入聊天记录
    	var msgObj = db.insertValue(message,{title:"",content:msg.content,chatid:msg.chatid,from_youtuid:msg.to_youtu_id,sendstat:msg.sendstat});
   		console.log(JSON.stringify(msgObj));
    }
    /**
     *获取当前时间戳 
     */
    ow.getTimeStamp = function(){
    	return new Date().getTime();
    }
    /**
     * 获取会话ID 
     * @param {Object} from_youtuid
     * @param {Object} to_youtuid
     */
    ow.getChatid = function(from_youtuid,to_youtuid){
    	if(!from_youtuid||!to_youtuid) return false;
    	if(parseInt(from_youtuid)<parseInt(to_youtuid)){
    		return "chat_"+from_youtuid+to_youtuid;
    	}else{
    		return "chat_"+to_youtuid+from_youtuid;
    	}
    }
    /**
     *本地打开聊天界面 
     * @param {Object} data
     */
    ow.nativeOpenCahtPage = function(data){
    	app.printLog(data);
    	var temp = ow.getWebObjByName("chat");//取得聊天消息界面对象
    	if(temp){
    		mui.fire(temp.content,"getOption",{ext:{youtu_id:data.from_youtuid}});//传值到子页面
    		temp.header.show();//显示webview
    		temp.content.show();//显示webview
    	}else{
    		app.locationHref("_www/cn.youtu.v1/content/chat.html","",{youtu_id:data.from_youtuid},true,true,true,{bottom:"0px"});
    	}
    }
    
    /**
     *本地打开通知界面 
     * @param {Object} data
     */
    ow.nativeOpenNotifyPage = function(data){
    	app.printLog(data);
    	var temp = ow.getWebObjByName("messages");//取得聊天消息界面对象
    	if(temp){
    		mui.fire(temp.content,"getOption",{ext:""});//传值到子页面
    		temp.header.show();//显示webview
    		temp.content.show();//显示webview
    	}else{
    		app.locationHref("_www/cn.youtu.v1/content/messages.html","",{},true,true,true,{bottom:"0px"});
    	}
    }
    
    /******************************通用函数******************************************/
  	
    //判断用户等级
    ow.getGrade =function(grade){
    	switch (grade){
    		case 1:
    			return "user-v1";
    			break;
    		case 2:
    			return "user-v2";
    			break;
    		case 3:
    			return "user-v3";
    			break;
    		case 4:
    			return "user-v4";
    			break;
    		case 5:
    			return "user-v5";
    			break;
    		case 6:
    			return "user-v6";
    			break;
    		case 7:
    			return "user-v7";
    			break;
    		case 8:
    			return "user-v8";
    			break;
    		case 9:
    			return "user-v9";
    			break;
    		case 10:
    			return "user-v10";
    			break;
    		case 11:
    			return "user-v11";
    			break;
    		case 12:
    			return "user-v12";
    			break;
    		default:
    			return "user-v1";
    			break;
    	}
    	
    }
    
     //判断用户热度
     ow.getHot=function(hot){
     	switch (hot){
     		case 0:
     			return "hot-1";
     			break;
     		case 1:
     			return "hot-2";
     			break;
     		case 2:
     			return "hot-3";
     			break;
     		default:
     			return "hot-default";
     			break; 
     	}
     	
     }
     //判断用户热度
     ow.getSearchGroup=function(group){
     	switch (group){
     		case "摄影":
     			return 3;
     			break;
     		case "实景":
     			return 4;
     			break;
     		case "化妆":
     			return 5;
     			break;
     		default:
     			return;
     			break; 
     	}
     	
     }
     ow.getType=function(type){
     	switch (type){
     		case "0":
     			return "分享得红包 ";
     			break;
     		case "1":
     			return "交易成功得红包 ";
     			break;
     		case "2":
     			return "关注得红包";
     			break;
     		default:
     			return;
     			break; 
     	}
     	
     }
     
     
     //判断报价单位
     ow.getDanwei=function(unit_value){
     	unit_value=parseInt(unit_value);
     	switch (unit_value){
			case 0:
				return "件";
				break;
			case 1:
				return "套";
				break;
			case 2:
				return "小时";
				break;
			case 3:
				return "天";
				break;
			case 4:
			return "全包价";
				break;
			case 5:
			return "月";
				break;
			case 6:
			return "单妆";
				break;
			case 7:
			return "棚拍";
				break;
			case 8:
			return "基地";
				break;
			case 9:
			return "外景";
				break;
			case 10:
			return "半天";
				break;
			case 11:
			return "全天";
				break;
		}
     }
     //人气
     ow.getNavType=function(nav_type){
     	switch (nav_type){
			case "订单最高":
				return 1;
				break;
			case "人气最高":
				return 2;
				break;
			case "时间最新":
				return 3;
				break;
			case "价格最低":
				return 4;
				break;
			case "拼单":
				return 5;
				break;
			case "评价最高":
				return 6;
				break;
			default:
				return 1;
				break;
		}
     }
     
     ow.getDan=function(danwei){
     	switch (danwei){
			case "件":
				return 0;
				break;
			case "套":
				return 1;
				break;
			case "小时":
				return 2;
				break;
			case "天":
				return 3;
				break;
			case "全包价":
				return 4;
				break;
			case "月":
				return 5;
				break;
			case "单妆":
				return 6;
				break;
			case "棚拍":
				return 7;
				break;
			case "基地":
				return 8;
				break;
			case "外景":
				return 9;
				break;
			case "半天":
				return 10;
				break;
			case "全天":
				return 11;
				break;
		}
     }
     
     /*判断红包类型*/
    ow.getHongbaoType=function(gettype){
    	switch (gettype){
    		case 0:
    			return "分享得红包 ";
    			break;
    		case 1:
    			return "交易成功得红包  ";
    			break;
    		case 2:
    			return "关注得红包 ";
    			break;
    	}
    }
     /*判断红包状态*/
    ow.getHongbaoStatus=function(gettype){
    	switch (gettype){
    		case "0":
    			return "未使用";
    			break;
    		case "1":
    			return "已使用";
    			break;
    		case "2":
    			return "已过期";
    			break;
    		default:
    			console.log("没有匹配到数据");
    			break;
    	}
    }
     /*判断点赞状态*/
    ow.getDianzanStatus=function(gettype){
    	switch (gettype){
    		case 0:
    			return "点赞成功 ";
    			break;
    		case 1:
    			return "取消点赞";
    			break;
    	}  
    }
    
    //获取用户类型 1:商家 2:模特 3:摄影 4:基地 5:化妆
    ow.getUserType = function(){
    	var usertype =parseInt(ow.dataStorage("user_type"));
    	return usertype;
    }  
    //判断订单单位
    ow.getOrderDanwei = function(danwei){
    	var danweis="";
    	switch (danwei){
    		case "0":
    			danweis="件";
    			break;
    		case "1":
    			danweis="套";
    			break;
    		case "2":
    			danweis="小时";
    			break;
    		case "3":
    			danweis="天";
    			break;
    		default :
    			danweis="件数";
    			break;
    	}
    	return danweis;
    	
    }
  	
	return ow;
}(mui,app));	
