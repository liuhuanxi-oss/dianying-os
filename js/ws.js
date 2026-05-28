// ====== WebSocket实时数据推送模块 ======
var wsScreen=null;
var wsAlert=null;
var wsReconnectTimer=null;
var wsAlertReconnectTimer=null;
var wsScreenData=null; // 最新大屏数据缓存
var wsScreenCallbacks=[]; // 数据更新回调列表
var wsAlertCallbacks=[]; // 预警回调列表

// 连接大屏WebSocket
function wsConnect(){
 if(wsScreen&&wsScreen.readyState===WebSocket.OPEN)return;
 var proto=location.protocol==='https:'?'wss':'ws';
 var host=location.hostname||'localhost';
 var url=proto+'://'+host+':8081/ws/screen';
 try{
  wsScreen=new WebSocket(url);
  wsScreen.onopen=function(){
   console.log('[WS] 大屏WebSocket已连接');
   if(wsReconnectTimer){clearTimeout(wsReconnectTimer);wsReconnectTimer=null}
  };
  wsScreen.onmessage=function(e){
   try{
    var msg=JSON.parse(e.data);
    if(msg.type==='screen_tick'){
     wsScreenData=msg.data;
     wsScreenCallbacks.forEach(function(cb){try{cb(msg.data)}catch(e){}});
    }
   }catch(ex){}
  };
  wsScreen.onclose=function(){
   console.log('[WS] 大屏WebSocket断开，3秒后重连');
   wsReconnectTimer=setTimeout(wsConnect,3000);
  };
  wsScreen.onerror=function(){wsScreen.close()}
 }catch(e){wsReconnectTimer=setTimeout(wsConnect,5000)}
}

// 连接预警WebSocket（评价+投诉）
function wsAlertConnect(){
 if(wsAlert&&wsAlert.readyState===WebSocket.OPEN)return;
 var proto=location.protocol==='https:'?'wss':'ws';
 var host=location.hostname||'localhost';
 var url=proto+'://'+host+':8081/ws/reviews/alert';
 try{
  wsAlert=new WebSocket(url);
  wsAlert.onopen=function(){
   console.log('[WS] 预警WebSocket已连接');
   if(wsAlertReconnectTimer){clearTimeout(wsAlertReconnectTimer);wsAlertReconnectTimer=null}
  };
  wsAlert.onmessage=function(e){
   try{
    var msg=JSON.parse(e.data);
    if(msg.type==='review_alert'||msg.type==='complaint_alert'){
     wsAlertCallbacks.forEach(function(cb){try{cb(msg)}catch(e){}});
     if(msg.data&&msg.data.alert_level==='critical'){
      ta(msg.type==='review_alert'?'紧急差评预警: '+msg.data.content:'紧急投诉预警: '+msg.data.content,'er');
     }
    }
   }catch(ex){}
  };
  wsAlert.onclose=function(){
   wsAlertReconnectTimer=setTimeout(wsAlertConnect,5000);
  };
  wsAlert.onerror=function(){wsAlert.close()}
 }catch(e){wsAlertReconnectTimer=setTimeout(wsAlertConnect,5000)}
}

// 注册数据更新回调
function onScreenData(cb){wsScreenCallbacks.push(cb)}
function onAlert(cb){wsAlertCallbacks.push(cb)}

// 获取最新大屏数据
function getLatestScreenData(){return wsScreenData}

// 初始化WebSocket
function wsInit(){
 wsConnect();
 wsAlertConnect();
}

// 断开WebSocket
function wsDisconnect(){
 if(wsScreen){wsScreen.close();wsScreen=null}
 if(wsAlert){wsAlert.close();wsAlert=null}
 if(wsReconnectTimer){clearTimeout(wsReconnectTimer)}
 if(wsAlertReconnectTimer){clearTimeout(wsAlertReconnectTimer)}
}
