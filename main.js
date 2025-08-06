require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.DATABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
console.log("Hello, Node.js !");

async function testConnection() {
  const { error } = await supabase.from('*').select('*').limit(1)
  if (!error) {
    console.error("tu t'es bien connecté a supabase")
  }
}
app.use(express.json())

app.post('/creation_joueur', async (req, res) => {
  const { discordId, userId } = req.body

  if (!discordId || !userId) {
    return res.json({ error: 'Discord ID and User ID are required' })
  }
  else{
    const { data, error } = await supabase
      .from('joueurs')
      .insert([{ discord_id: discordId, user_id: userId }])
  }

})

app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})