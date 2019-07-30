//MODIFY THIS FOR YOUR ENVIRONMENT
const isProduction = false;
const seed = "Your private key";//process.env.PRIVATE_KEY; //private key/seed (keep private / store in .env file for production)
const uniqueAppId = "1acd"; //process.env.appID; //your app id assigned by Kin - you can use 1acd for testing
const maxKinSendable = 50; //just for your security - set max Kin you allow from your server to your app
const port = process.env.PORT;//if using Heroku: 5000 for localhost and automatic- Else set for your use
//END MODIFY THIS FOR YOUR ENVIRONMENT

const KinWrapper = require('kin-node-callback');
const kin = new KinWrapper(seed, isProduction, uniqueAppId);//initialize
const http = require('http');
const qs = require('querystring');
const utf8 = require('utf8');

//create a server object:
const server = http.createServer();
server.on('request', async (req, res) => {
    var body = '';
    const getReq = qs.parse(req.url.split('?')[1]);
    req.on('data', function (data) { body += data; });
    req.on('end', async function () {
        try {
            body = JSON.parse(body);
        } catch (e) {
            //string may come differently
            body = decodeURIComponent(body);
            body = body.replace(/[&]/g, '","');
            body = body.replace(/[=]/g, '":"');
            body = '{"' + body + '"}';
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = '';
            }
        }
        handleRequest(getReq, body, res);
    });
    req.on('error', (err) => {
        respond(res, errorResponse(err));
    });

});
server.listen(port);



//handle http requests from the client
async function handleRequest(get, post, res) {
    var response = standardResponse;
    if (typeof get.fund !== 'undefined') {
        //fund a newly created account
        if (post.amount < maxKinSendable)
            response = await fundAccount(post.address, post.memo, post.amount, res);
    } else if (typeof get.request !== 'undefined') {
        //send a payment to an account
        if (post.amount < maxKinSendable)
            response = await sendPayment(post.address, post.id, post.memo, post.amount, res);
    } else if (typeof get.whitelist !== 'undefined') {
        //Whitelist a transaction
        response = await whitelistTransaction(post, res);
    } else {
        //empty request
        response = errorResponse('no get vars');
        respond(res, response);
    }
}

function bin2String(array) {
    return String.fromCharCode.apply(String, array);
}

//Whitelists transactions so fees are zero
function whitelistTransaction(data, res) {
    var response = standardResponse();
    clientTransaction = JSON.stringify(data);
    try {
        response.text = kin.account.whitelistTransaction(clientTransaction);
    } catch (err) {
        response = errorResponse(err);
    }
    respond(res, response);
}


//fund newly created account
async function fundAccount(address, memo, amount, res) {
    var response = standardResponse();
    amount = Math.min(amount, maxKinSendable); // set max we are willing to send - consider adding other security features
    var minimumFee = 100; //you won't be charged if whitelisted by Kin
    await kin.getMinimumFee((err, fee) => { minimumFee = err ? 100 : fee; });
    await kin.createAccount(address, amount, memo, (err, transactionId) => {
        if (!err) {
            response.text = transactionId;
        } else {
            response = errorResponse(err);
        }
        respond(res, response);
    });
}


//send a payment
async function sendPayment(address, id, memo, amount, res) {
    //you can use the id to record / authorise details of each user (not implemented here)
    var response = standardResponse();
    amount = Math.min(amount, maxKinSendable); //set max we are willing to send - consider adding other security features
    var minimumFee; //you won't be charged if whitelisted by Kin
    await kin.getMinimumFee((err, fee) => { minimumFee = err ? 100 : fee; });
    await kin.sendKin(address, amount, memo, (err, transactionId) => {
        if (!err) {
            response.text = transactionId;
        } else {
            response = errorResponse(err);
        }
        respond(res, response);
    });
}



//just a helper function
function standardResponse() {
    var response = {};
    response.code = 200;
    response.header = "{ 'Content-Type': 'text/html' }";
    response.text = "OK";
    return (response);
}

//just a helper function
function errorResponse(err) {
    var response = {};
    response.header = "{ 'Content-Type': 'text/html' }";
    response.text = "{ 'error': '" + err + "' }";
    response.code = 500;
    return (response);
}

//just a helper function
function respond(res, response) {
    res.writeHead(response.code, response.header);
    res.write(response.text);
    res.end();
}
