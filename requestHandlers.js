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
  
  //パラメータの処理
  if(req.method=='POST') {
    var body='';
    req.on('data', function (data) {
      body +=data;
    });
    req.on('end',function(){             
      var POST =  qs.parse(body);
      console.log(POST);
      //要件を伺うメッセージ
      if(POST.Digits == "1") {
        twiRes.say('ロボジーのお問い合わせですね。ご用件をどうぞ。', opt)
        .record({timeout:10,
                 finishOnKey:'#',
                 action:'./runMyProcess'});
        return twiRes.toString();
      } else if(POST.Digits == "2") {
        twiRes.say('ロボジーご注文ですね。ご注文をどうぞ。', opt).redirect('./runMyProess')
            .record({timeout:10,
                 finishOnKey:'#',
                 action:'./runMyProcess'});
        return twiRes.toString();
      } else {
        twiRes.say('恐れ入りますが、１か２をおしてください。', {voice: 'man', language: 'ja-jp'}).redirect('./start');
        return twiRes.toString();
      }

    });
  }

  return twiRes.toString();
}

/**
 * runMyProess
 * 一旦電話を切ってから、問い合わせ内容をコールバックする
 * RunMyProcessに処理を移譲
 */
function runMyProess(req) {
  console.log("Request handler 'redirect' was called.");

  //パラメータの処理
  var param = analyzeParams(req);

  //var voiceUrl = 'http://hogehoge';//For test
  var voiceUrl =param.RecordingUrl;
  
  //For response
  var twiRes = twilio.TwimlResponse();
  var opt = {
    voice: 'woman',
    language: 'ja-jp'
  }
  
 
   //受付ました
   twiRes.say('承りました。お電話を切って少々おまちください。', opt);
  
  //RunMyProcessへ
  run(voiceUrl, param.From);
  
  return twiRes.toString();
}


//////////////////////////////////////////////////////////////////////////////
////////////////////////Private methods///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/**
 * requestパラメタ処理
 */
function analyzeParams(req){
  
  if(req.method=='POST') {
  var body='';
  req.on('data', function (data) {
    body +=data;
  });
  req.on('end',function(){              
    var POST =  qs.parse(body);
    console.log(POST);
    return POST;
  });
  }
  else if(req.method=='GET') {
     var url_parts = url.parse(req.url,true);
     console.log(url_parts.query);
     return url_parts.query;
  }

}

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

/*
 $.ajax({
 type : "POST",
 url : process_url,
 data : xml_input_params,
 cache : false,
 async : false,
 dataType : "json",
 beforeSend : function (xhr) {
 xhr.setRequestHeader('Authorization', auth);
 xhr.setRequestHeader('Content-Type', 'application/xml+atom');
 },
 success : parse_result,
 error : popup_ko
 });
 */
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
exports.runMyProess = runMyProess;
