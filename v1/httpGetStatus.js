/* httpGetStatus.js
   Created by Jonathan Hill 2023/08/27
 */
const https = require('https');
const baseUrl = 'https://www.'
let targetUrl;
// In the all-status endpoint, responseJson will hold the result of the first callback until the second response is ready.
let responseJson = null;

/*
   Function makeHttpsCall

   This function makes the actual https call and processes the response.

   @param   targetUrl       the URL to get status (ex. https://www.google.com)
   @param   multipleCalls   boolean, true if this is all-status, false otherwise
 */
makeHttpsCall = function (targetUrl, res, multipleCalls) {
    const timeStampStart = Date.now();
    https.get(targetUrl, (resp) => {
        let data = '';
        // Accumulate the chunks of data being returned.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The entire result has been returned.
        resp.on('end', () => {
            const timeStampEnd = Date.now();
            // Build the response message
            let response = {};
            response['url'] = targetUrl;
            response['statusCode'] = resp.statusCode;
            response['duration'] = timeStampEnd - timeStampStart;
            response['date'] = Math.floor(timeStampEnd / 1000);
            // If this is all-status, check to see if this is the first of the two calls to finish
            if (multipleCalls) {
                // If this is the first call to finish, save the response but do not return the data yet
                if (responseJson === null) {
                    responseJson = response;
                }
                else {
                    // If this is the second call to finish, add this response to the previous response and return the data
                    responseJson = "[" + JSON.stringify(responseJson) + ", " + JSON.stringify(response) + "]"
                    res.write(responseJson);
                    responseJson = null;
                    res.end();
                }
            }
            else {
                // This is not all-status.  Return the response
                res.write(JSON.stringify(response));
                responseJson = null;
                res.end();
            }
            console.log("resp status good = " + resp.statusCode);
        });
    }).on("error", (err) => {
        // If the https call causes an error, process the error and return the data
        console.log('In makeHttpsCall - Error: ' + err)
        const timeStampEnd = Date.now();
        let response = {};
        // This try-catch is just in case the url is not a valid string that can be processed.
        try {
            response['url'] = targetUrl;
        }
        catch (urlExc) {
            console.log('In makeHttpsCall - Exception in URL = ' + urlExc)
            response['url'] = 'INVALID URL';
        }
        response['statusCode'] = 400;
        response['duration'] = timeStampEnd - timeStampStart;
        response['date'] = Math.floor(timeStampEnd / 1000);
        res.write(JSON.stringify(response));
        res.end();
        console.log("resp status  bad = " + response.statusCode);
    });
}


/*
   Function httpGetStatus

   This function determines which call(s) to make, or if the URL is invalid it returns an error statusCode.

   @param   option       the endpoint to process
 */
exports.httpGetStatus = function (option, res) {
    switch (option) {
        case 'amazon-status':
            targetUrl = baseUrl + 'amazon.com';
//            responseJson = makeHttpsCall.makeHttpsCall(targetUrl, res);
            makeHttpsCall(targetUrl, res, false);
            break;
        case 'google-status':
            targetUrl = baseUrl + 'google.com';
            makeHttpsCall(targetUrl, res, false);
            break;
        case 'all-status':
            targetUrl = baseUrl + 'google.com';
            makeHttpsCall(targetUrl, res, true);
            targetUrl = baseUrl + 'amazon.com';
            makeHttpsCall(targetUrl, res, true);
            break;
        default:
            let response = {};
            response['url'] = 'http://localhost/v1/' + option;
            response['statusCode'] = 404;
            response['duration'] = 0;
            response['date'] = Math.floor(Date.now() / 1000);
            res.write(JSON.stringify(response));
            res.end();
    }
}