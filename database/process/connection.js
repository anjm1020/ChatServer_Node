const mongoose = require('mongoose');
module.exports = ()=>{
	const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
	console.log('connect !');
});
const url = process.env.MONGO_URI;
const connectionParams = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
};
mongoose.connect(url,connectionParams);
}