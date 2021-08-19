var socket = io();

function btnOnclick(){
	var dataset = {};
	dataset.receiver = $('.temp-receive').html();
	dataset.user = $('p.uid').html(); 
	dataset.msg = $(`#${dataset.receiver}.chatbox .msg`).val();
	$(`#${dataset.receiver}.chatbox .msg`).val('');
	socket.emit('submitMsg', dataset);
	newMsg(dataset);
	saveLogData(dataset);
	//SAVE LOG
}
function exitOnclick(it){
	var uid = $(it).attr('id');
	$(`#${uid}.chatbox`).css('display','none');
	$('.no-match').css('display','block');
	$('.temp-receive').html('no-match');
}
function checkLogData(dataset){
	console.log('checkLogData');
	$.ajax({
		url:'/log/check-logdb',
		type:'POST',
		data:{
			partnerList : dataset.partnerList
		},
		success:function(res){
			let logs = res.logs;
			for(let i=0;i<logs.length;i++){
				for(let j=0;j<logs[i].bubbles.length;j++){
					let data={};
					data.msg = logs[i].bubbles[j].text;
					data.isMine = logs[i].bubbles[j].isMine;
					data.partner = logs[i].partner;
					loadMsg(data);
				}
			}
		}
	})
}
function saveLogData(dataset){
	var log = {
		user_id:String,
		partner_id:String,
		msg:{
			isMine:Boolean,
			text:String
		}
	};
	log.msg.text = dataset.msg;
	log.msg.isMine = dataset.user == $('p.uid').html();
	if(log.msg.isMine){
		log.user_id=dataset.user;
		log.partner_id=dataset.receiver;
	}else{
		log.user_id=dataset.receiver;
		log.partner_id=dataset.user;
	}
	$.ajax({
		url: '/log/save-talkLog',
		type: 'POST',
		data: {
			log : log
		},
		success: function (res) {
		},
	})
}
function loadMsg(data) {
	var label = data.msg;
	var newMsg = '';
	var targetLog = $(`#${data.partner}.chatbox .chatLog`);
	console.log(targetLog);
	if (data.isMine){
		newMsg = '<li class="self-msg"><p class="msg-label">' + label + '</p></li>';
	}
	else{
		newMsg = '<li class="another-msg"><p class="msg-label">' + label + '</p></li>';
	}
	targetLog.append(newMsg);
	targetLog.scrollTop($('.chatLog')[0].scrollHeight);
}

function newMsg(data) {
	var targetLog;
	var label = data.msg;
	console.log(data.msg);
	var newMsg = '';
	if (data.user == $('p.uid').html()){
		newMsg = '<li class="self-msg"><p class="msg-label">' + label + '</p></li>';
		targetLog = $(`#${data.receiver}.chatbox .chatLog`);
	}
	else{
		newMsg = '<li class="another-msg"><p class="msg-label">' + label + '</p></li>';
		targetLog = $(`#${data.user}.chatbox .middle .chatLog`);
	}
	//SAVE TO DB
	
	//PATCH TO CHATLOG
	targetLog.append(newMsg);
	targetLog.scrollTop($('.chatLog')[0].scrollHeight);
}
function listClick(it){
	var before = $('.temp-receive').html();
	var onload;
	if(before=='no-match') onload = $('.no-match');
	else onload = $(`#${before}.chatbox`);
  onload.css('display','none');
	
	var newReceiver = $(it).attr('id');
	$('.temp-receive').html(newReceiver);
	$(`#${newReceiver}.chatbox`).css('display','block');
}
function makeChatBox(user) {
	return `
<div class="chatbox" id=${user.id}>
                <div class="top-bar">
                    <div class="avatar">
                        <p>${user.name[0]}</p>
                    </div>
                    <div class="partner">
	<span class="partner-name">${user.name}</span><span class="partner-id">@${user.id}</span>
                    </div>
                    <a href="/auth/logout">logout</a>
                    <button class="exit" id=${user.id} onclick='exitOnclick(this)'>✘</button>
                </div>
                <div class="middle">
                    <ul class="chatLog"></ul>
                </div>
                <div class="bottom-bar">
                    <div class="chat">
                        <input class="msg" type="text" placeholder="Type a message..."/>
                        <button class="submit" onclick="btnOnclick()">✈️</button>
                    </div>
                </div>
            </div>
`;
}
function handshake() {
	$.ajax({
		url: '/shake-userinfo',
		type: 'POST',
		data: {
			user: {
				nickname: $('p#name').html(),
				preview: 'preview',
				time: '00:00',
				uid: $('p.uid').html(),
			},
		},
		success: function (res) {
			if (res) {
				var root = $('ul.people');
				root.children().remove();
				root.append(res.lists);
				var chats='';
				var newInput = [];
				for(let i=0;i<res.userlist.length;i++){
					if($(`#${res.userlist[i].id}.chatbox`).length==0){
						chats+=makeChatBox(res.userlist[i]);
						newInput.push(res.userlist[i].id);
					}
				}
				$('.container').append(chats);
				
				for(let i=0;i<newInput.length;i++){
					$(`#${newInput[i]}.chatbox input`).keydown(key=>{
						if(key.keyCode==13)
							btnOnclick();
					})
				}
				//MAKE CHATLOG DB
				//PIVOT MUST TO BE USER
				checkLogData({partnerList : res.userlist});
				
			}
		},
	});
}
function passing() {
	$.ajax({
		url: '/pass-userinfo',
		type: 'POST',
		data: {
			user: {
				nickname: $('p#name').html(),
				preview: 'preview',
				time: '00:00',
				sid: socket.id,
				uid: $('p.uid').html(),
			},
		},
		success: function (res) {},
	});
}
function checkDeleted(deleted){
	if($(`#${deleted}.chatbox`).length!=0){
		$(`#${deleted}.chatbox`).remove();
		$('.temp-receive').html('no-match');
		$('.no-match').css('display','block');
	}
}

$(document).ready(() => {
	//SET SOCKET EVENT
	socket.on('init', () => {
		console.log('pass :' + $('p#name').html());
		passing();
	});

	socket.on('update-userlist', () => {
		console.log('update :' + $('p#name').html());
		handshake();
	});
	
	socket.on('check-deleted-user',deleted=>{
		checkDeleted(deleted);
	})

	socket.on('newMsg', (data) => {
		newMsg(data);
		saveLogData(data);
	});
});