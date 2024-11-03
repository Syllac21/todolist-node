const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware pour parser le JSON
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint pour obtenir les tâches
app.get('/api/tasks', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des tâches' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint pour ajouter une tâche
app.post('/api/tasks', (req, res) => {
  const newTask = req.body;

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des tâches' });
    }
    const tasks = JSON.parse(data);
    tasks.push(newTask);

    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'écriture des tâches' });
      }
      res.status(201).json(newTask);
    });
  });
});

// Endpoint pour supprimer une tâche
app.delete('/api/tasks/:id', (req, res) => {
  console.log('ok');
  const taskId = parseInt(req.params.id, 10);
  if(isNaN(taskId)){
    return res.status(400).json({ error: 'ID invalide'});
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des tâches' });
    }
    let tasks = JSON.parse(data);
    const initialLength = tasks.length;

    tasks = tasks.filter(task => task.id !== taskId);

    if(tasks.length === initialLength){
      return res.status(404).json({ error: 'Tâche non-trouvée' });
    }

    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'écriture des tâches' });
      }
      res.status(204).send();
    });
  });
});

// Endpoint pour modifier une tâche
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const { title, description, deadline } = req.body;

  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la lecture des tâches' });
    }

    let tasks = JSON.parse(data);
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Mise à jour des champs
    tasks[taskIndex] = { ...tasks[taskIndex], title, description, deadline };

    fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'écriture des tâches' });
      }
      res.status(200).json(tasks[taskIndex]);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});