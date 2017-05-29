//parse nanoseconds for tradeList object
var parseNano = function(nano) {
  var hour = Math.floor(nano / 3600000000000);
  var temp = nano % 3600000000000;
  var minute = Math.floor(temp / 60000000000);
  var temp2 = temp % 60000000000;
  var second = Math.floor(temp2 / 1000000000);
  var mil = temp2 % 1000000000;
  hour = hour.toString()
  minute = minute.toString()
  second = second.toString();
  mil = mil.toString().slice(0, 3)
  return parseTime(`${hour}:${minute}:${second}.${mil}`)
}
