const { fork } = require("child_process");




console.log("dirnmae", __dirname)
// check .anything-llm/collector/index.js exists
console.log("collector", require("fs").existsSync("./anything-llm/collector/index.js"))


const collectorChild = fork("./anything-llm/collector/index.js");


collectorChild.on('message', (message) => {
    console.log('Message from collectorChild:', message);
    });

collectorChild.on('error', (error) => {
    console.error('Error in collectorChild:', error);
    });

const serverChild = fork("./anything-llm/server/index.js")

serverChild.on('message', (message) => {
    console.log('Message from serverChild:', message);
    });

serverChild.on('error', (error) => {
    console.error('Error in serverChild:', error);
    });


