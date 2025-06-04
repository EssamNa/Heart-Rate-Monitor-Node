if(process.env.SERVER_TYPE === "test") {
  exports.database_name = "test";
}
else {
  exports.database_name = "production";

}

const password = encodeURIComponent(process.env.MONGO_ATLAS_SECRET);
exports.mongo_credentials = `mongodb+srv://contactmeessam:${password}@cluster0.rok6xvn.mongodb.net/${exports.database_name}?authSource=admin&retryWrites=true&w=majority`;


exports.wsUrl = 'ws://aide-twwwss-be02d4b95847.herokuapp.com/ws';
exports.wsDebugUrl = 'ws://aide-twwwss-be02d4b95847.herokuapp.com/ws?debug=true';