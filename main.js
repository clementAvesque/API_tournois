require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.DATABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Hello, Node.js !")

app.use(express.json())

app.post('/creation_joueur', async (req, res) => {
  const { discordId } = req.body

  if (!discordId) {
    return res.status(400).json({ error: "Discord ID est requis." })
  } else {

    await supabase
      .from('joueurs')
      .insert([{ discord_id: discordId }])  // pas besoin de user_id ici

    if (error) {
      console.error("Erreur insertion :", error)
      return res.json({ message: "Erreur lors de la création du joueur." })
    }

    return res.json({ message: "Joueur créé avec succès.", data })
  }
})
app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})
