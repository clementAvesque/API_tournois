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

app.post(`/${process.env.KEY}/creation_joueur`, async (req, res) => {
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
})

app.post(`/${process.env.KEY}/creation_tournois`, async (req, res) => {
  const { date, name } = req.body;
  console.log("Date reçue:", date);
  const timestamp = new Date(date).toISOString();
  console.log("Timestamp converti:", timestamp);

  if (!date) {
    return res.status(400).json({ response: "Missing fields: date est obligatoire" });
  }

  try {
    let insertData = { lancement: timestamp };
    if (name) {
      insertData.name = name;
    }

    const { data, error } = await supabase
      .from('tournois')
      .insert([insertData]);

    if (error) {
      console.error(error);
      return res.status(500).json({ response: "Erreur lors de l'insertion en base" });
    }

    return res.status(201).json({ response: "success", data });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Erreur serveur" });
  }
});

app.post(`/${process.env.KEY}/subscribe`, async (req, res) => {
  const { tournamentId, IdJoueur } = req.body;

  if (!tournamentId || !IdJoueur) {
    return res.status(201).json({ response: "Missing fields: tournamentId et IdJoueur sont obligatoires" });
  }

  try {

    const existingSubscription = await supabase
      .from('user_tournament')
      .select('*')
      .eq('tournois', tournamentId)
      .eq('joueur', IdJoueur)
      .single();

    if (existingSubscription.data) {
      return res.status(201).json({ response: "Le joueur est déjà inscrit à ce tournoi." });
    }

    const { data, error } = await supabase
      .from('user_tournament')
      .insert([{ tournois: tournamentId, joueur: IdJoueur }]);


    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(201).json({ response: "Error", details: error.message });
      console.log(error)
    }

    return res.status(201).json({ response: "success", data });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})
