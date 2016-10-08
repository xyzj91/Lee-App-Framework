# Lee-App-Framework
###Lee FrameWork APP框架 SDK文档   ###
#### &copy Alen            2016.08.10####

##### 一、框架介绍 #####
  Lee App框架 V3.0是一个基于MUI底层实现的一套底层JS框架，解决了市面上同类技术标准不统一，开发不规范，开发出来的产品性能和体验差的问题。实现了功能标准化、业务抽象化。使开发人员可以更加专注的去实现页面效果，而不用太过于去考虑底层的实现。

##### 二、版本更新记录 #####
  v1.1 功能点：封装了网络请求，封装了业务打开逻辑，封装了数据存储、封装了图像缓存、I18N。
    
  v2.0 功能点：重写页面传值以及子页面打开方法，使之更稳定。新增广播函数，可以向所有页面发送广播消息。新增页面显示、隐藏、加载完成、关闭四大事件。可通过广播监听这四个事件。  
  
  v3.0 功能点：重新架构整个底层，使之更稳定并解决在Android5.0以上页面遮挡的问题。解决在页面加载时因为其他因素导致的等待框无法被自动关闭的BUG,新增加在IOS下默认使用WKWebview，使之可以兼容indexDB,将缓存存储方式修改为indexDB

##### 三、SDK #####
######1.文件结构######
  ┗app      所有页面存放目录  
  ┗css     css样式存放目录  
  ┗fonts 	字体图标存放目录  
  ┗images	图片存放目录 	  
  ┗js 		JS脚本存放目录  
  .....┗app.js  lee框架核心文件  
  .....┗app.utils.js  lee框架核心文件  
  .....┗config.js  APP服务器路径配置和语言配置文件  
  .....┗mui.min.js  mui官方框架  
  ┗index.html  启动页  
  ┗mainfest.json APP清单配置文件
****
######2.文件命名规则######
  1. 若文件名中包含 **-quickOpen** 则页面将会使用单页(单页：即不使用父子模式的无头尾页面)打开（现载模式）  
  2. 若文件名中包含 **-alone** 则页面将会使用单页打开（预载模式）  
  3. 若文件名中包含 **-needhead** 则页面将会使用有头无尾（父子模版）方式打开（预加载模式） 
  4. 默认则页面将会使用有头有尾（父子模版）方式打开（预加载模式）  
  
****
######3.函数介绍######

1.页面初始化函数  
  在每个页面中都需要引入框架文件，引入顺序为：**mui.min.js、config.js、app.js、app.utils.js**
 引入文件完成后，使用如下代码初始化页面，框架会自动去初始化mui和plus：  
>		app.init({
				initCbk:function(){
					},
				lastpostCbk:function(){
					},
				eventCbk:function(){
					},
				broadCbk:function(){
					},
				dataRequestCbk:function(){
					},			
			});
**initCbk**：初始化完成回调(整个页面的生命周期中只会执行一次)  __（必须）__  
**lastpostCbk**：参数传递回调（参数过来时会调起该方法，页面生命周期中会调用多次） __（必须）__   
**eventCbk**：页面三大事件回调，三大事件分别是（显示，隐藏，关闭）  
**broadCbk**：广播回调事件，当页面中收到自定义发送的广播消息时会调起该事件  
**dataRequestCbk**：下一个页面传递参数到上一个页面，上一个页面中的回调事件

2.页面打开函数  
本框架采用全新的页面打开和管理方式，使事件传递和父子页面展示更容易实现，特别是在预加载模式下，采用webview复用原则，减少了webview的频繁创建和销毁，极大的节省了性能！是APP在低端机下更加流畅的运行  

**createTemplate** 创建共享页面 模版(预加载)  	
>		var option = app.getOptions();
		option.id = "template1-alone";
		app.createTemplate(option);  
		
**openWindowforTemplate** 使用共享模式打开页面(预加载)  	
>		var option = app.getOptions();
		option.id = "content3-alone";
		option.headerurl = "_www/app/template-header.html"; 
		option.url = "_www/app/content3-alone.html";
		option.title = "测试";
		app.openWindowforTemplate(option);		  
> **id中名称注意：   
   quickOpen** 不使用父子模版方打开,立即打开页面，暂时只支持独立页面方式（现加载模式）  
    **alone** 使用无头尾方式打开（预加载模式）  
     **needhead** 使用有头无尾方式打开（预加载模式）  
     默认使用有头有尾方式打开(预加载模式)	  
  
**locationHref** 打开页面（现载或者预载都可以）  
>		var option = app.getOptions();
		option.id = "content3-alone";
		option.headerurl = "_www/app/template-header.html"; 
		option.url = "_www/app/content3-alone.html";
		option.title = "测试";
		app.locationHref(option);      	  

3.发送值到上一个页面  
本框架采用广播消息的模式将消息传递到上一个页面或者指定页面中  
**returnToLastPage(id,exp)**  
>id 页面ID 每个页面打开时都会有传递一个lastpageid  传指定ID可将值传到指定的页面中，若不传ID则默认取上一个页面的ID  
exp  参数 json类型    
>		
		app.returnToLastPage("",{color:"#dedede",test:"demo"});  
上一个页面则可以通过	dataRequestCbk 这个回调函数取到传递过来的参数  
>
		app.init({
				initCbk:function(){
					},
				lastpostCbk:function(){
					},
				dataRequestCbk:function(data){//上一个页面传值回调
					app.printLog(data,true);
					console.log("上一个页面接收到响应值");
                }, 	
			});			

**app.sendBroadToChild(exp);**		
发送广播到子页面中，该函数不仅可以应用到传递参数到子页面，而且可以应用到触发子页面中的事件  
>		app.sendBroadToChild({test:"demo",type:"sendchild"});  
子页面中如下处理：  

>		app.init({
				initCbk:function(){
				},
				lastpostCbk:function(){
				},
				 dataRequestCbk:function(data){
				 	app.printLog(data,true);
                },   
			});				  
  
**app.sendBroadToParent(exp)**    
发送广播到父页面中，作用类似sendBroadToChild  
在此不再赘述
  
  					
