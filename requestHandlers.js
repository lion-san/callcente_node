function start() {
  console.log("Request handler 'start' was called.");
  trigger_process();
  return "Hello Start";
}

function upload() {
  console.log("Request handler 'upload' was called.");
  return "Hello Upload";
}

function processStart(){
  trigger_process();
}

function trigger_process(process_url, input_params) {

var rmp_login = "yokoi.shinya@jp.fujitsu.com";
var rmp_password = "yokoi123";
var auth='Basic '+base64encode(rmp_login+':'+rmp_password);

var xml_input_params = "<?xml version='1.0' encoding='UTF-8'?><feed xmlns='http://www.w3.org/2005/Atom'                             xml:base='https://live.runmyprocess.jp/'><entry><category term='initial' /><content type='xml'>" + JSON.stringify(input_params) + "</content></entry></feed>";

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
}

//For sucess
function parse_result(data, textStatus, jqXHR) {
 console.log(data.feed.id); // will popup the process instance id
}

//For error
function popup_ko(jqXHR, textStatus, errorThrown) {
 console.log(textStatus + " : " + errorThrown);
}

exports.start = start;
exports.upload = upload;

