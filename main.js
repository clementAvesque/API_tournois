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
  const { date, name ,size } = req.body;
  console.log("Date reçue:", date);

  if (!date) {
    return res.status(400).json({ response: "Missing fields: date est obligatoire" });
  }

  const timestamp = new Date(date).toISOString();

  try {
    // Préparation des données à insérer
    let insertData = {
      lancement: timestamp,
      name: name || "Tournoi Hebdomadaire",
      size: size || 32
    };

    // Insertion dans Supabase
    const { data: inserted, error: insertError } = await supabase
      .from("tournois")
      .insert([insertData])
      .select();

    if (insertError || !inserted || !inserted[0]) {
      console.error("Erreur d'insertion:", insertError);
      return res.status(500).json({ response: "Erreur lors de l'insertion en base" });
    }

    console.log("Tournoi inséré:", inserted[0]);

    return res.status(201).json({ response: "success", data: inserted[0] });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Erreur serveur" });
  }
});

app.post(`/${process.env.KEY}/subscribe`, async (req, res) => {
  const { tournamentId, discordId } = req.body;

  if (!tournamentId || !discordId) {
    return res.status(201).json({ response: "Missing fields: tournamentId et discordId sont obligatoires" });
  }

  try {

    const existingSubscription = await supabase
      .from('user_tournament')
      .select('*')
      .eq('tournois', tournamentId)
      .eq('joueur', discordId)
      .maybeSingle();

    if (existingSubscription.data) {
      return res.status(201).json({ response: "Le joueur est déjà inscrit à ce tournoi." });
    }

    const { data, error } = await supabase
      .from('user_tournament')
      .insert([{ tournois: tournamentId, joueur: discordId }]);


    return res.status(201).json({ response: "success" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});

app.post(`/${process.env.KEY}/unsubscribe`, async (req, res) => {
  const { tournamentId, discordId } = req.body;

  if (!tournamentId || !discordId) {
    return res.status(400).json({ response: "Missing fields: tournamentId et discordId sont obligatoires" });
  }

  try {
    const { data, error } = await supabase
      .from('user_tournament')
      .delete()
      .eq('tournois', tournamentId)
      .eq('joueur', discordId);

    return res.status(200).json({ response: "success" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});

app.post(`/${process.env.KEY}/list_player`, async (req, res) => {
  const { tournamentId } = req.body;

  if (!tournamentId) {
    return res.status(400).json({ response: "Missing fields: tournamentId est obligatoire" });
  }

  try {
    const { data, error } = await supabase
      .from('user_tournament')
      .select('joueur')
      .eq('tournois', tournamentId);

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ response: "Error", details: error.message });
    }

    return res.status(200).json({ response: "success", data });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});

app.post(`/${process.env.KEY}/list_tournament`, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournois')
      .select('*')
      .eq('end', false);

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ response: "Error", details: error.message });
    }

    const playerIds = data.map(p => p.joueur);

    return res.status(200).json({ response: "success", data: playerIds });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});

app.post(`/${process.env.KEY}/end_tournament`, async (req, res) => {
  const { tournamentId } = req.body;

  if (!tournamentId) {
    return res.status(400).json({ response: "Missing fields: tournamentId est obligatoire" });
  }

  try {
    const { data, error } = await supabase
      .from('tournois')
      .update({ end: true })
      .eq('id', tournamentId);

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ response: "Error", details: error.message });
    }

    return res.status(200).json({ response: "success" });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
  //fait moi une commande curl complete avec l'id de tournois qui est 69 qui me permet de lancer ce end point
  //curl -X POST http://localhost:3000/${process.env.KEY}/end_tournament -d '{"tournamentId": 69}'
});

app.post(`/${process.env.KEY}/data_tournament`, async (req, res) => {
  const { tournamentId } = req.body;

  if (!tournamentId) {
    return res.status(400).json({ response: "Missing fields: tournamentId est obligatoire" });
  }

  try {
    const { data, error } = await supabase
      .from('tournois')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ response: "Error", details: error.message });
    }

    return res.status(200).json({ response: "success", data });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return res.status(500).json({ response: "Server error" });
  }
});


app.listen(port, () => {
  console.log(`🚀 Serveur API en écoute sur http://localhost:${port}`)
})
