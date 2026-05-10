const fetch = require('node-fetch');

async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        company: "Test Corp",
        budget: "₹50k+",
        problem: "Need automation."
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch(e) {
    console.log("Fetch failed:", e.message);
  }
}

testApi();
