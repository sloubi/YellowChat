/* global io */
/* global $ */

var nickname;

var socket = io.connect('http://localhost:3000');

socket.on('user_msg', function (data) {
  addMessage('<b>' + data.nickname + '</b> : ' + data.msg);
});

socket.on('not_logged', function (data) {
  window.location.replace('/login');
});

function setNickname(nick) { // eslint-disable-line no-unused-vars
  nickname = nick;
  $('#nickname').text(nick);
}

function addMessage(msg) {
  $('#chat').append('<li>' + msg + '</li>');
}

$('#sendform').submit(function (e) {
  e.preventDefault();

  var $message = $('#message');

  if ($message.val() !== '') {
    socket.emit('new_msg', $message.val());
    addMessage('<b>' + nickname + '</b> : ' + $message.val());
  }

  $message.val('').focus();
});
