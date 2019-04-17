'use strict';

const AWS= require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
	region:'ap-southeast-2'
});

const tableName = 'feedback';
//done
module.exports.writeFeedback = async (event, context, callback) => {
	if (event.body !== null && event.body !== undefined) {
		console.log(event);
    	let body = JSON.parse(event.body);
		var params = {
			Item:{
				// userid: body.userid,
				time: Date.now(),
				name: body.name,
				email: body.email,
				feedback: body.feedback,
			},

			TableName: tableName
		}
		return await docClient.put(params,function(err,data){
			if(err){
				callback(err,null);
			}else{
				const response = {
					"statusCode": 200,
					"headers":{
						"Access-Control-Allow-Origin":"*"
					},
					"body":"success"
				}
				callback(null,response);
			}
		}).promise();
	}else{
		console.log('error')
	}
};
