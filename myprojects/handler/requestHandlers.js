//var $ = require('jquery');
//読み込み
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var Base64 = require("./base64");
var twilio = require('twilio');
var  url = require('url'),
     http = require('http'),
     qs = require('querystring');



/**
 * start
 * Twilioから最初に呼び出させるメソッド
 */
function start(req) {
  console.log("Request handler 'start' was called.");

  var twiRes = twilio.TwimlResponse();
  var opt = {
    voice: 'woman',
    language: 'ja-jp'
  }

  twiRes.say('お電話ありがとうございます。こちらはロボジーお客様サポートセンターです。', opt)
  .gather({
      action:'http://callcenter-node.azurewebsites.net/request',
      finishOnKey:'#',
      timeout:10,
      numDigits:1
    }, function() {
      this.say('ロボジーのお問い合わせの場合は１を', opt)
          .say('ロボジー注文の場合は２を', opt)
          .say('入力が完了したら、シャープをおしてください', opt);
  });
    
  return twiRes.toString();
}

/**
 * request
 * ダイヤルボタンを押した後の処理
 * 
 */
function request(req) {
  console.log("Request handler 'request' was called.");

  //For response
  var twiRes = twilio.TwimlResponse();
  var opt = {
    voice: 'woman',
    language: 'ja-jp'
  };
  
  //Push number?
  var push = "0";
  
  //パラメータの処理
  console.log(req.body);
  push = req.body.Digits;
  
  console.log("---------------------------------");
  console.log("push = " +push);
  
    //要件を伺うメッセージ
  if(push == "1") {
    twiRes.say('ロボジーのお問い合わせですね。ご用件をどうぞ。最後にシャープを押してください。', opt)
    .record({timeout:10,
             finishOnKey:'#',
             action:'./runMyProcess'});
  } else if(push == "2") {
    twiRes.say('ロボジーご注文ですね。ご注文をどうぞ。最後にシャープを押してください。', opt)
    .record({timeout:10,
             finishOnKey:'#',
             action:'./runMyProcess'});
  } else {
    twiRes.say('恐れ入りますが、１か２をおしてください。', {voice: 'man', language: 'ja-jp'}).redirect('./start');
  }

  return twiRes.toString();
}

/**
 * runMyProcess
 * 一旦電話を切ってから、問い合わせ内容をコールバックする
 * runMyProcessに処理を移譲
 */
function runMyProcess(req) {
  console.log("Request handler 'redirect' was called.");

  //var voiceUrl = 'http://hogehoge';//For test
  var voiceUrl =req.body.RecordingUrl;
  
  //For response
  var twiRes = twilio.TwimlResponse();
  var opt = {
    voice: 'woman',
    language: 'ja-jp'
  }
  
 
   //受付ました
   twiRes.say('承りました。お電話を切って少々おまちください。', opt);
  
  //RunMyProcessへ
  run(voiceUrl, req.body.From);
  
  return twiRes.toString();
}


/**
 * callBackToCustomer
 * callback用
 * RunMyProcessから呼出し
 */
function callBackToCustomer(req) {
  console.log("Request handler 'callBackToCustomer' was called.");
  
  //Getで取得(微妙だが)
  var callno = req.query.phoneno;
  console.log("Call from:"+callno);
  
  var msg = req.query.msg;
  console.log("Callback msg:"+msg);
  
  var voice = req.query.voice;
  
  var client = twilio(
    'AC61e6d70fd202e5c5776168bc1b6165b6',
    '7e2833938114457766013c26310446bc');
  client.makeCall({
    from: '+81-50-3131-8520',    /* input your twilio number */
    to: callno,      /* input validated number, if trial */
    url: 'http://callcenter-node.azurewebsites.net/callbackmsg?msg='+encodeURIComponent(msg)+'&voice='+voice+'.mp3'
  }, function(error, data) {
    console.log('makeCall error:' + error);
  });
  
  return "電話をかけました！";
}

/**
 * callBackMsg
 */
 function callBackMsg(req){
  console.log("Request handler 'callBackMsg' was called.");
  
  //RunMyProcessへのメッセージ取得処理
  var msg = req.query.msg;
  console.log("Reply msg:"+msg);
  
  var voice = req.query.voice;
  
   //For response
  var twiRes = twilio.TwimlResponse();
  var opt = {
    voice: 'man',
    language: 'ja-jp'};
  
 
   //コールバックしました
   twiRes.say(msg, opt).play(voice);
  
  return twiRes.toString();
 }

//////////////////////////////////////////////////////////////////////////////
////////////////////////Private methods///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/**
 * RunMyProcessのキック
 */
function trigger_process(process_url, input_params) {

//[課題]生でみえちゃう（環境変数から取得したい）
var rmp_login = "yokoi.shinya@jp.fujitsu.com";
var rmp_password = "yokoi123";
var auth='Basic '+Base64.base64encode(rmp_login+':'+rmp_password);

var xml_input_params = "<?xml version='1.0' encoding='UTF-8'?><feed xmlns='http://www.w3.org/2005/Atom'                             xml:base='https://live.runmyprocess.jp/'><entry><category term='initial' /><content type='xml'>" + JSON.stringify(input_params) + "</content></entry></feed>";

var xhr = new XMLHttpRequest();

xhr.open('POST', process_url, false);//同期処理

//ヘッダの設定
xhr.setRequestHeader('Authorization', auth);
xhr.setRequestHeader('Content-Type', 'application/xml+atom');

//callback関数の設定
//同期処理なので、statusで処理を後続処理判断する

//送信データ
xhr.send(xml_input_params);

  //ステータス
  if (xhr.status == 200) {
    success();
  }else{
    error();
  }
}

//For sucess
function parse_result(data, textStatus, jqXHR) {
 console.log(data.feed.id); // will popup the process instance id
}
function success(){
  console.log("success");
}

//For error
function popup_ko(jqXHR, textStatus, errorThrown) {
 console.log(textStatus + " : " + errorThrown);
}
function error(){
  console.log("error");
}

//For process
function run(voiceUrl, phoneno){
  trigger_process("https://live.runmyprocess.jp/live/113921369218575832/process/83786?P_mode=TEST&P_version=1", {
    "phoneno" : phoneno,//Call from(Stab data)
    "url" : voiceUrl//録音データの場所
  });
}

exports.start = start;
exports.request = request;
exports.runMyProcess = runMyProcess;
exports.callBackToCustomer = callBackToCustomer;
exports.callBackMsg = callBackMsg;