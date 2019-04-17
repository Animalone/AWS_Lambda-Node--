'use strict';

const AWS= require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
	region:'ap-southeast-2'
});

const tableName = 'notebook';
//done
module.exports.writeData = async (event, context, callback) => {
	if (event.body !== null && event.body !== undefined) {
    	let body = JSON.parse(event.body);
		var params = {
			Item:{
				userid: body.userid,
				noteid: body.noteid,
				title: body.title,
				text: body.text,
				notebookId: body.notebookId,
				lastModifiedOn: body.lastModifiedOn
			},

			TableName: tableName
		}
		return await docClient.put(params).promise();
	}else{
		console.log('error')
	}
};
//done
module.exports.readById = async (event, context, callback) => {
		var pathVar = event.pathParameters;
		let params = {
			TableName:tableName,
			Key:{
				"userid":pathVar.userid,
				"noteid":pathVar.noteid
			}
		};
		const data = await docClient.get(params,function(err,data){
			if(err){
				callback(err,null);
			}else{
				const response = {
					statusCode: 200,
					body:JSON.stringify(data)
				}
				callback(null,response);
			}
		}).promise();
};

//done
module.exports.readByNotebook = async (event, context, callback) => {
		var pathVar = event.pathParameters;
		let params = {
			TableName:tableName,
			ProjectionExpression:"#userid, #noteid, #title, #text, #notebookId, #lastModifiedOn",
			FilterExpression:"#notebookId = :notebookId and #userid = :userid",
			ExpressionAttributeNames:{
		        "#notebookId": "notebookId",
		        "#noteid": "noteid",
		        "#text": "text",
		        "#title": "title",
		        "#noteid": "noteid",
		        "#userid": "userid",
		        "#lastModifiedOn": "lastModifiedOn"
		    },
		    ExpressionAttributeValues: {
		        ":notebookId": pathVar.notebookId,
		        ":userid": pathVar.userid
		    }
		};
		const data = await docClient.scan(params,function(err,data){
			if(err){
				callback(err,null);
			}else{
				const response = {
					statusCode: 200,
					body:JSON.stringify(data)
				}
				callback(null,response);
			}
		}).promise();
};

//done
module.exports.deleteByNotebook = async (event, context, callback) => {
		var pathVar = event.pathParameters;
		let params = {
			TableName:tableName,
			ProjectionExpression:"#notebookId,#noteid,#userid",
			FilterExpression:"#notebookId = :notebookId and #userid = :userid",
			ExpressionAttributeNames:{
		        "#notebookId": "notebookId",
		        "#noteid": "noteid",
		        "#userid": "userid"
		    },
		    ExpressionAttributeValues: {
		        ":notebookId": pathVar.notebookId,
		        ":userid": pathVar.userid
		    }
		};

		const data = await docClient.scan(params, function(err,data){
			if(err){
				callback(err,null);
				}
			}).promise();

		var index;
		let length = data.Items.length;
		for (index =  0; index < length; index++){
			var param = {
				TableName:tableName,
				Key:{
					"userid": data.Items[index].userid,
					"noteid": data.Items[index].noteid
				}
			};
			const result = await docClient.delete(param, function(err,data){
				if(err){
					callback(err,null);
					}
				}).promise();
		}
		const response = {
			statusCode: 200,
			body:"delete successfully"
		}
		callback(null,response);
};

//done
module.exports.deleteData = async (event, context, callback) => {
		var pathVar = event.pathParameters;
		var params = {
			TableName:tableName,
			Key:{
				userid: pathVar.userid,
				noteid: pathVar.noteid
			}
		};
		const data = await docClient.delete(params,function(err,data){
			if(err){
				callback(err,null);
			}else{
				const response = {
					statusCode: 200,
					body:"delete successfully"
				}
				callback(null,response);
			}
		}).promise();
};

//done
module.exports.updateData = async (event, context, callback) => {
		let body = JSON.parse(event.body);
		var updateAttribute = [];
		var updateExpressionTerm = {};
		var expressionAttributeTerm = {};
		if (body.text){
			updateAttribute.push("#text= :text,");
			updateExpressionTerm[":text"] = body.text;
			expressionAttributeTerm["#text"] = "text";
		}
		if (body.title){
			updateAttribute.push("#title= :title,");
			updateExpressionTerm[":title"] = body.title;
			expressionAttributeTerm["#title"] = "title";
		}
		console.log(updateAttribute, updateExpressionTerm, expressionAttributeTerm)
		updateExpressionTerm[":lastModifiedOn"] = Date.now();
		expressionAttributeTerm["#lastModifiedOn"] = "lastModifiedOn";

		var params = {
			TableName:tableName,
			Key:{
				userid: body.userid,
				noteid: body.noteid
			},
			UpdateExpression:"set "+ updateAttribute.join(" ")+"#lastModifiedOn= :lastModifiedOn",
			ExpressionAttributeValues:updateExpressionTerm,
			ExpressionAttributeNames:expressionAttributeTerm,
        	ReturnValues:"UPDATED_NEW"
    	};
		const data = await docClient.update(params,function(err,data){
			if(err){
				callback(err,null);
			}else{
				const response = {
					statusCode: 200,
					body:"update successfully"
				}
				callback(null,response);
			}
		}).promise();
};