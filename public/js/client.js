/* global io */
/* global $ */

var serverUrl;
var nickname;

var socket = io.connect(serverUrl);

socket.on('user_msg', function (data) {
  addMessage('<b>' + data.nickname + '</b> : ' + data.msg);
});

socket.on('not_logged', function (data) {
  window.location.replace('/login');
});

socket.on('update_users_list', function (users) {
  updateUsersList(users);
});

function updateUsersList(users) {
  var aUsers = Object.keys(users).map(function (key) {
    return users[key];
  });
  $('#users').text(aUsers.join(','));
}

function setNickname(nick) { // eslint-disable-line no-unused-vars
  nickname = nick;
  $('#nickname').text(nick);
  socket.emit('new_user', function (users) {
    updateUsersList(users);
  });
}

function setServerUrl(url) { // eslint-disable-line no-unused-vars
  serverUrl = url;
}

function addMessage(msg) {
  $('#chat').append('<li>' + msg + '</li>');
  scrollToLastMessage();
}

function scrollToLastMessage() {
  var $chat = $('#chat');
  $chat.animate({ scrollTop: $chat.height() }, 200);
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

$(function () {
  scrollToLastMessage();
});
