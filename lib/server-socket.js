const socket = require('socket.io');

var map = new Map();

module.exports = (server, app) => {
	var io = socket(server);

	function logoutSocketsIO(sessionID) { // ????? 이거 안돌아가면 안되는거 아닌가
		let connections = io.sockets.connected;
		console.log(io.sockets);
		for (let c in connections) {
			let socketSessionID = connections[c].conn.request.sessionID;
			if (sessionID === socketSessionID) {
				console.log('catch');
				connections[c].disconnect();
			}
		}
	}

	function userlistTag(user) {
		var res={};
		var lists = '';
		var users = [];
		for (let curr of map.values()) {
			var temp = {};
			temp.id = curr.uid;
			temp.name = curr.nickname;
			if(curr.uid==user) continue;
			lists += `
<li class="person" id=${curr.uid} onClick="listClick(this)">
<span class="nickname" id=${curr.nickname}>${curr.nickname}</span>
<span class="time">${curr.time}</span>
<br>
<span class="preview">${curr.preview}</span>
</li>`;
			users.push(temp);
		}
		res.list = lists;
		res.user = users;
		return res;
	}
	
	app.post('/shake-userinfo',(req,res)=>{
		let user = req.body.user;
		var data = userlistTag(user.uid);
		res.send({lists:data.list, userlist:data.user});
	});
	
	app.post('/pass-userinfo',(req,res)=>{
		let user = req.body.user;
		map.set(user.uid,user);
		io.emit('update-userlist');
		res.send({});
	});
	
	app.get('/logout/destroy_socket/:uid', (req, res) => {
		logoutSocketsIO(req.sessionID);
		io.emit('check-deleted-user',req.params.uid);
		map.delete(req.params.uid);
		req.logout();
		io.emit('update-userlist');
		res.redirect('/');
	});
	
	io.on('connection', (socket) => {
		io.to(socket.id).emit('init');
		console.log(map);
		//EVENT LISTENER
		socket.on('disconnect', () => {
			console.log('disconnect');
		});
		
		socket.on('submitMsg', (data) => {
			let sid = map.get(data.receiver).sid;
			//var sid = map.get(data.receiver).sid;
			io.to(sid).emit('newMsg', data);
		});
	});
};