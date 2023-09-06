/* webServer.js
   Created by Jonathan Hill 2023/08/26

   This is an implementation of the web server portion of the Maxwell House / Sun Life Take Home Exercise.
   It uses the http module to create a web server at http://localhost on the default port 80.
   The directory structure for the source code is /v1, which contains httpGetStatus.js to process the http request.
   The specific endpoint will be passed into the httpGetStatus() function, so the same function can process all three
   endpoints.
 */
const http = require('http');

/*
   Function getUserStatusUrl

   This function parses the url sent to the server and returns the path to the directory that will process the
   request, if it exists.

   @param   userUrl       the URL to parse
   @return                the path in the URL, excluding the text after the last "/"
 */
getUserStatusUrl = function (userUrl) {
    let ret = './';
    if (userUrl.indexOf('/') === -1) {
        // There is no path in the URL
        return ret;
    }
    ret += userUrl.substring(0, userUrl.lastIndexOf('/'));
    return ret;
}


http.createServer(function (req, res) {
    console.log(req.url);
    try {
        /* In a valid URL, userStatusUrl will be ./[PATH]/httpGetStatus, where [PATH] is parsed from req.url.
           userStatusOption will be the endpoint for the path.

           For example: /v1/google-status
                            userStatusUrl = './v1/httpGetStatus'
                            userStatusOption = 'google-status'
                        /v2/americas/business-unit-5/verizon-status
                            userStatusUrl = './v2/americas/business-unit-5/httpGetStatus'
                            userStatusOption = 'verizon-status'

           If the URL is not valid, it will throw an exception which will return an error status, or pass an undefined
           endpoint to httpGetStatus() which will return an error status.
         */
        let userStatusUrl = getUserStatusUrl(req.url) + '/httpGetStatus';
        let splitUrl = req.url.split('/');
        let userStatusOption = splitUrl[splitUrl.length - 1];
        const userStatusRequest = require(userStatusUrl);
        userStatusRequest.httpGetStatus(userStatusOption, res);
    }
    catch (exc) {
        console.log('In createServer - Exception = ' + exc);
        let response = {};
        // This try-catch is just in case the url is not a valid string that can be processed.
        try {
            response['url'] = req.url;
        }
        catch (urlExc) {
            console.log('In createServer - Exception in URL = ' + urlExc)
            response['url'] = 'INVALID URL';
        }
        response['statusCode'] = 400;
        response['duration'] = 0;
        response['date'] = Math.floor(Date.now() / 1000);
        res.write(JSON.stringify(response));
        res.end();
    }
}).listen(80);
