/**
 * indexDB数据库链接类
 * 数据插入语句 sql.insert().into("lile",{name:"lile",age:26}).start();
 * 数据查询语句 sql.select(["name","age"]).from("lile").where("id=1").start();
 * 数据删除语句 sql.delete().from("lile").where("id=1").start();
 * 数据修改语句 sql.update("lile").set({name:"lile1",age:18}).start();
 * 表结构介绍：
 *   *{tablename:"表名称",keyPath:"指定的主键（一般为id）",keyGenerator:"自动递增主键字段(一般为id)",autoIncrement:true(自动递增),forceUpdate:true(是否强制升级，表存在则会自动覆盖),table(表索引字段列表，都不能为空):{youtu_id:{unique:true(是否是唯一),indexname(索引名称):"youtu_id"},nickname:*{unique:false,indexname:"nickname"}}};//用户信息列表缓存表
 * 
 * 键类型	存储数据
 *不使用	任意值，但是没添加一条数据的时候需要指定键参数
 *keyPath	Javascript对象，对象必须有一属性作为键值
 *keyGenerator	任意值
 *都使用	Javascript对象，如果对象中有keyPath指定的属性则不生成新的键值，如果没有自动生成递增键值，填充keyPath指定属性
 */
var sql = (function(idb){
	var DB;
	idb.db = {dbName:"youtuwo",dbVersion:8};
	idb.table = {};
	idb.table["userlist"] = {tablename:"userlist",keyPath:"id",keyGenerator:"id",autoIncrement:true,forceUpdate:true,table:{youtu_id:{unique:true,indexname:"youtu_id"},nickname:{unique:false,indexname:"nickname"}}};//用户信息列表缓存表
	
	idb.table["chat"] = {tablename:"chat",keyPath:"id",keyGenerator:"id",autoIncrement:true,forceUpdate:true,table:{youtu_id:{unique:true,indexname:"youtu_id"},nickname:{unique:false,indexname:"nickname"}}};//用户信息列表缓存表
	/**
	 * 初始化数据库
	 * @param db 数据库对象{dbName:"test",dbVersion:1.0}
	 */
	var initDB = function(db){
		var indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		if(!db.dbName){console.error("dbName is error");return;}
		if(!db.dbVersion){console.error("dbVersion is error");return;}
//		if('webkitIndexedDB' in window){
//			window.IDBTransaction = window.webkitIDBTransaction;
//			window.IDBKeyRange = window.webkitIDBKeyRange;
//		}
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
		try{
			//open database
			return indexDB.open(db.dbName,db.dbVersion);
		}catch(e){
			console.error("数据库打开失败！您的设备不支持indexDB属性");
		}
		
	};
	/**
	 * 数据库链接类
	 * @param {JSON} db 数据库
	 * @param {JSON} table 表对象
	 * @param {Object} successcbk 回调
	 */
	idb.conn = function(db,table,successcbk){
		dbs = db?db:idb.db;//设置默认数据库
		var request = initDB(dbs);
		//版本不一致，执行升级操作
		request.onupgradeneeded = function(e){
			var db=e.target.result;
			createTables(db);
			console.log("version update success"+dbs.dbVersion);
		}
		
		//连接成功
		request.onsuccess = function(e){
			var db=e.target.result;
			successcbk(db,table);//回调
		}
		//open error
		request.onerror = function(e){
			console.error("open database error");
		}
		
		
		return this;
	}
	/**
	 * 创建表对象
	 * @param {Object} db
	 * @param {Object} table
	 * @param {Object} callback
	 */
	var createTables = function(db,table){
		if(!table){//创建所有表
			for(var k in idb.table){
				createTable(db,idb.table[k]);
			}
		}else{//创建单个表
			createTable(db,table);
		}
	}
	/**
	 * 创建单个表
	 */
	var createTable = function(db,table){
		if(!db.objectStoreNames.contains(table.tablename)||table.forceUpdate){
	        	var pei = {};
	        	if(table.keyPath){
	        		pei['keyPath']=table.keyPath;
	        	}else{
	        		pei['keyGenerator']=table.keyGenerator;
	        	}
	        	if(table.autoIncrement){
	        		pei['autoIncrement'] = true;
	        	}
	        	if(db.objectStoreNames.contains(table.tablename)){
	        		db.deleteObjectStore(table.tablename);//表存在则删除表
	        		console.log("table "+table.tablename+"exist,delete success");
	        	}
	            var store=db.createObjectStore(table.tablename,pei);
	            pei = {};//清空
	            //创建表和索引
	            for(var i in table.table){
	            	var temp = table.table[i];
            		pei["unique"] = temp.unique?true:false;
	            	store.createIndex(temp.indexname,i,pei); 
	            }
	            console.log("create table "+table.tablename+"success");
	        }else{
	        	console.log("table "+table.tablename+" is exist");
	        }
	}
	/**
	 * 获取到表事务对象 默认为readwrite
	 * @param {Object} db
	 * @param {String} tablename
	 * @param {Boolean} readonly
	 */
	var getStore = function(db,tablename,readonly){
//		var read = readonly?IDBTransaction.READ_ONLY:IDBTransaction.READ_WRITE;
		var read = readonly?"readonly":"readwrite";
		var trans = db.transaction(tablename, read);//通过事物开启对象
		trans.oncomplete = function(){
			console.log("trans complete");
		};
		trans.onerror = function(){
			console.error("trans error");
		}
	    return trans.objectStore(tablename);//获取到表对象
	}
	
	/**
	 * 增加数据
	 * @param {Object} db
	 * @param {JSON} table
	 * @param {JSON} data
	 * @param {JSON} callback
	 */
	idb.addData = function(db,table,data,callback){
		var store = getStore(db,table.tablename);//获取表对象
		if(!table||!data){console.error("data error");return;}
		var request =  store.put(data);//插入数据
		request.onsuccess = function(e){
			console.log("insert success");
			if(callback){
				callback({status:true});
			}
		}
		request.onerror = function(e){
			console.error("insert error");
			if(callback){
				callback({status:false});
			}
			
		}
	};
	/**
	 * 删除数据
	 */
	idb.delData = function(db,table,id,callback){
		var store = getStore(db,table.tablename);//获取表事务对象
		if(!store||!id){console.error("data error");return;}
		var request =  store.delete(parseInt(id));//删除数据
		request.onsuccess = function(e){
			if(callback){
				callback({status:true});
			}
			console.log("delete success");
		}
		request.onerror = function(e){
			if(callback){
				callback({status:false});
			}
			console.error("delete error");
		}
	};
	
	/**
	 * 根据ID查询数据
	 */
	idb.getDataByid = function(db,table,id,callback){
		var store = getStore(db,table.tablename,true);//获取表事务对象
		var request = store.get(parseInt(id));
		//查询成功
		request.onsuccess = function(e){
			console.log("查询成功");
			if(callback){
				if(callback){
					callback({status:true,detail:e.target.result});
				}
			}
		};
		//查询失败
		request.onerror = function(){
			callback({status:false});
			console.error("查询失败");
		};
		
	};
	/**
	 * 根据关键词索引搜索
	 */
	idb.getDataBySearch = function(db,table,keywords,callback){
		var store = getStore(db,table.tablename,true);//获取表事务对象
		var keyRange = IDBKeyRange.only(keywords);
		var rowData;
		store.index("nickname").openCursor(keyRange).onsuccess = function(e){
			var cursor = e.target.result;
			if(!cursor){
				if(callback){
					callback({status:true,detail:rowData});
				}
				return;
			}
			rowData = cursor.value;
			cursor.continue();
		}
		
	}
	/**
	 * 查询所有数据
	 */
	idb.getAll = function(db,table,option,callback){
		var store = getStore(db,table.tablename,true);//获取表事务对象
		//打开游标，遍历所有数据
		store.openCursor().onsuccess = function(event){
			var cursor = event.target.result;
			var key = cursor.key;  
	        var rowData = cursor.value;  
	        alert(rowData.name);  
	        cursor.continue(); 
		}
		store.openCursor().onerror = function(){
			if(callback){
				callback({status:false});
			}
		}
	}
	
	/**
	 * 修改数据
	 */
	idb.updateData = function(db,table,data,callback){
		idb.addData(db,table,data,callback);
	};
	return idb;
})(document);

(function(idb){
	var sqlRunning = {};
	/**
	 * 查询
	 * @param {Json} tmp 返回的字段
	 */
	idb.select = function(tmp){
		sqlRunning['type_k']="select";
		sqlRunning['type_v']=tmp;
		return idb;
	}
	/**
	 * 更新数据
	 * @param {String} tmp 表名
	 */
	idb.update = function(tmp){
		sqlRunning['type_k']="update";
		sqlRunning['type_v']=tmp;
		return idb;
	}
	/**
	 * 删除数据
	 */
	idb.delete = function(){
		sqlRunning['type_k']="delete";
		return idb;
	}
	/**
	 * 插入数据
	 */
	idb.insert = function(){
		sqlRunning['type_k']="insert";
		return idb;
	}
	/**
	 * 设置数据
	 * @param {Json} tmp 数据
	 */
	idb.set = function(tmp){
		if(typeof(tmp)=="string"){
			console.error("type only json");
			return;
		}
		sqlRunning['data'] = tmp;
		return idb;
	}
	/**
	 * 查询条数
	 * @param {String} tmp 返回字段别名
	 */
	idb.count = function(tmp){
		if(typeof(tmp)!="string"){
			console.error("type only String");
			return;
		}
		sqlRunning['count']=tmp?tmp:"num";
		return idb;
	}
	/**
	 * 暂时仅仅只能单表查询
	 * @param {String} tmp 表名
	 */
	idb.from = function(tmp){
		if(typeof(tmp)!="string"){
			console.error("type only String");
			return;
		}
		sqlRunning['tablename'] = tmp;
		return idb;
	}
	/**
	 * 表插入
	 * @param {String} tmp 表名
	 * @param {Json} data 数据对象
	 */
	idb.into = function(tmp,data){
		if(typeof(tmp)!="string"){
			console.error("type only String");
			return;
		}
		if(typeof(data)!="object"){
			console.error("data is only json");
			return;
		}
		sqlRunning['tablename'] = tmp;
		sqlRunning['data'] = data;
		return idb;
	}
	idb.field = function(tmp){
		
		return idb;
	}
	/**
	 * 暂时仅支持单条件查询
	 * @param {Object} tmp
	 */
	idb.where = function(tmp){
		if(typeof(tmp)!="string"){
			console.error("type only String");
			return;
		}
		var arr = tmp.split("=");
		sqlRunning['where']={
			k:arr[0].trim(),
			v:arr[1].trim()
		};
		return idb;
	}
//	idb.group = function(){
//		
//		return idb;
//	}
	/**
	 * 排序
	 * @param {Boolean} isDesc 默认为正序排列
	 */
	idb.orderByDesc = function(isDesc){
		if(typeof(isDesc)!="boolean"){
			console.error("type only Boolean");
			return;
		}
		sqlRunning['orderby']=isDesc===true?true:false;
		return idb;
	}
	/**
	 * 数据界定
	 * @param {int} start 起始
	 * @param {int} length 长度
	 */
	idb.limit = function(start,length){
		if(!start||!length){
			console.error("limit error");
			return;
		}
		sqlRunning["limit"]={
			star:start,
			length:length
		};
		return idb;
	}
	
	idb.start = function(cbk){
		var running = sqlRunning.type_k;//操作类型
		var tablename = sqlRunning.tablename;//表名
		var dbobj = idb.db;//数据库对象
		var callback;
		var table=idb.table[tablename];//获取表对象
		if(typeof(table)=="undefined"){
			console.error("table ‘"+tablename+"’ is not define");
			return;
		}
		switch (running){
			case "insert":
				callback = function(db,tables){
					idb.addData(db,tables,sqlRunning.data,cbk);
				}
				break;
			case "select":
				break;
			case "update":
				break;
			case "delete":
				break;	
			default:
				console.error("type error!!!!!");
				break;
		}
		
		idb.conn(dbobj,table,callback);
		return idb;
	}
	
})(sql);
