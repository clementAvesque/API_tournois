require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.DATABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Hello, Node.js !")

app.use(express.json())

app.post('/creation_joueur', async (req, res) => {
  const { discordId } = req.body;

  if (!discordId) {
    return res.status(400).json({ response: "Missing discordId" });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id_discord: discordId }]);

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ response: "Error", details: error.message });
    }

    return res.status(201).json({ response: "success", data });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
})  // <-- Fermeture du app.post ici

app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})
