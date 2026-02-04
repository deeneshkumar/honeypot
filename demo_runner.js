const axios = require('axios');
const fs = require('fs');

async function runDemo() {
    let output = "";
    const log = (msg) => {
        console.log(msg);
        output += msg + "\n";
    };

    try {
        log("1. Starting a new Honeypot Session...");
        const startRes = await axios.post('http://127.0.0.1:3000/start-session', {
            scenario: 'upi_payment_request'
        });

        const { session_id, mock_scammer_endpoint } = startRes.data;
        // Ensure the returned endpoint is also using 127.0.0.1 if it was localhost
        const fixedEndpoint = mock_scammer_endpoint.replace('localhost', '127.0.0.1');

        log(`   Session Created: ${session_id}`);
        log(`   Mock Endpoint: ${fixedEndpoint}`);

        log("\n2. Triggering Mock Scammer...");
        await axios.post(fixedEndpoint, {});
        log("   Mock Scammer started. Waiting for conversation to complete (10s)...");

        await new Promise(r => setTimeout(r, 10000));

        log("\n3. Analyzing Session Results...");
        const analyzeRes = await axios.get(`http://127.0.0.1:3000/analyze?session_id=${session_id}`);

        log("\n--- JSON OUTPUT ---");
        const jsonStr = JSON.stringify(analyzeRes.data, null, 2);
        log(jsonStr);
        log("-------------------");

        fs.writeFileSync('demo_result.txt', output);
        fs.writeFileSync('data/session_example_1.json', jsonStr);

    } catch (err) {
        log("Error running demo: " + err.message);
        if (err.response) log(JSON.stringify(err.response.data));
        fs.writeFileSync('demo_result.txt', output);
        process.exit(1);
    }
}

runDemo();
