// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

const videos = [
    {
        Name: 'SimplePractice: Telehealth Set Up and Best Practices',
        URL: 'https://www.youtube.com/embed\/oq_AfeToxZk',
    },
    {
        Name: 'What is Telehealth?',
        URL: 'https://www.youtube.com/embed\/NhP7VlgABCc',
    },
    {
        Name: 'Is Telemedicine The Future Of Health Care?',
        URL: 'https://www.youtube.com/embed\/PLp6U5mUMQQ',
    },
    {
        Name: 'Telehealth',
        URL: 'https://www.youtube.com/embed\/MYP7XxK26bM',
    },
];

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }

    const videoId = toUrlString(randomBytes(16));
    console.log('Received event (', videoId, '): ', event);

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const username = event.requestContext.authorizer.claims['cognito:username'];

    // The body field of the event in a proxy integration is a raw string.
    // In order to extract meaningful values, we need to first parse this string
    // into an object. A more robust implementation might inspect the Content-Type
    // header first and use a different parsing strategy based on that value.
    const requestBody = JSON.parse(event.body);

    const videoName = requestBody.Name;

    const video = findVideo(videoName);

    recordVideo(videoId, username, video).then(() => {
        // You can use the callback function to provide a return value from your Node.js
        // Lambda functions. The first parameter is used for failed invocations. The
        // second parameter specifies the result data of the invocation.

        // Because this Lambda function is called by an API Gateway proxy integration
        // the result object must use the following structure.
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                VideoId: videoId,
                Video: video,
                VideoName: video.Name,
                Eta: '30 seconds',
                User: username,
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);

        // If there is an error during processing, catch it and return
        // from the Lambda function successfully. Specify a 500 HTTP status
        // code and provide an error message in the body. This will provide a
        // more meaningful error response to the end client.
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

// This is where you would implement logic to find the optimal unicorn for
// this ride (possibly invoking another Lambda function as a microservice.)
// For simplicity, we'll just pick a unicorn at random.
function findVideo(videoName) {
    console.log('Finding video for ', videoName);
    return videos.find(f => f.Name === videoName);
}

function recordVideo(videoId, username, video) {
    return ddb.put({
        TableName: 'Videos',
        Item: {
            VideoId: videoId,
            User: username,
            Video: video,
            VideoName: video.Name,
            RequestTime: new Date().toISOString(),
        },
    }).promise();
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}