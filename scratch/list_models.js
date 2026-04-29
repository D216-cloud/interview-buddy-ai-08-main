const API_KEY = "AIzaSyBKGrkmhYYLIwCC3vRIdZLeQ2j0vMypen4";

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    console.log(`Listing models: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("No models found or error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
