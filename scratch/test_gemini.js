const API_KEY = "AIzaSyBKGrkmhYYLIwCC3vRIdZLeQ2j0vMypen4";
const MODELS_TO_TRY = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro-preview-05-06",
  "gemini-2.5-flash-preview-05-20",
];

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say hello in one word." }] }]
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`✅ ${model} WORKS: "${text?.trim().substring(0, 50)}"`);
      return true;
    } else {
      const msg = data?.error?.message;
      const code = resp.status;
      if (code === 429) {
        console.log(`⚠️  ${model} QUOTA EXCEEDED (429): ${msg?.substring(0, 80)}`);
      } else {
        console.log(`❌ ${model} NOT FOUND (${code})`);
      }
    }
  } catch (e) {
    console.log(`💥 ${model} EXCEPTION: ${e.message}`);
  }
  return false;
}

(async () => {
  for (const model of MODELS_TO_TRY) {
    const ok = await testModel(model);
    if (ok) {
      console.log(`\n🎯 USE THIS MODEL: ${model}`);
      break;
    }
  }
})();
