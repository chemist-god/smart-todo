// Simple test script to add funds to wallet
const fetch = require('node-fetch');

async function testDeposit() {
    try {
        const response = await fetch('http://localhost:3000/api/wallet/test-deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: 100 })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDeposit();

