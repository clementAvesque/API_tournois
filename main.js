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
  try {
    const { discordId } = req.body

    if (!discordId) {
      return res.status(201).json({ response: "Missing" })
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ discord_id: discordId }])

    if (error) {
      return res.status(201).json({ response: "Error" })
    }

    return res.status(201).json({ response: "succes", data })
  } catch (error) {
    return res.status(201).json({ response: "Error" })
  }
})

app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})
