const fs = require('fs');
var tadaApiCall = require('../../tbApiService');

async function createAgents() {

    const url = 'https://api.tadabase.io/api/v1/data-tables/698rd2QZwd/records';
    const response = await tadaApiCall('GET', url, "");
    const agents = response.data.items;

    agents.forEach((agent) => {
        fs.writeFile(`helpers/ai/agents/db/${agent.id}.json`, JSON.stringify(agent, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing file', error: err });
            }
            return 'JSON data stored successfully';
        });
    });

}

async function readAgent(agent) {
    fs.readFile(`helpers/ai/agents/db/${agent}.json`, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file', error: err });
        }
        return JSON.parse(data);
    });
}

module.exports = {
    createAgents,
    readAgent
};