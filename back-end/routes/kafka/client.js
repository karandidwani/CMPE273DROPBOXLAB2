var rpc = new (require('./kafkarpc'))();

//make request to kafka
function make_request(queue_name, msg_payload, callback){
    console.log('in client.js make_request');
    console.log("message payload received: "+msg_payload.username);
	rpc.makeRequest(queue_name, msg_payload, function(err, response){
		if(err)
			console.error(err);
		else{
			console.log("response from rpc.makerequest"+response);
			callback(null, response);
		}
	});
}

exports.make_request = make_request;
