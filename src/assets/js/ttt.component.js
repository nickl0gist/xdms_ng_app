let flag = false;
setInterval(function() {
  flag = !flag;
  $(".i_s").css("color", flag ? "red" : "#030bc4");
  $(".i_s").css("color", flag ? "#030bc4" : "red");
}, 1000);
