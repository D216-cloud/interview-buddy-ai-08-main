const API_KEY = "AIzaSyBKGrkmhYYLIwCC3vRIdZLeQ2j0vMypen4";

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      const flashModels = data.models.filter(m => m.name.toLowerCase().includes("flash"));
      console.log("Flash models found:", flashModels.map(m => m.name));
      const proModels = data.models.filter(m => m.name.toLowerCase().includes("pro"));
      console.log("Pro models found:", proModels.map(m => m.name));
    } else {
      console.log("No models found.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
