import express from 'express';
import cors from 'cors';
import { Graph } from './graph';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const graph = new Graph();

app.post('/api/variables', (req, res) => {
    const { name, value, hasDefault } = req.body;
    graph.addVariableToGraph(name, value, hasDefault);
    res.json({ message: 'Variable added successfully' });
});

app.delete('/api/variables/:name', (req, res) => {
    const { name } = req.params;
    graph.removeVariableFromGraph(name);
    res.json({ message: 'Variable removed successfully' });
});

app.get('/api/variables', (req, res) => {
    const variables = graph.getVariables();
    res.json(variables);
});

app.put('/api/variables/:name', (req, res) => {
    const { name } = req.params;
    const { value } = req.body;
    graph.updateVariableInGraph(name, value);
    res.json({ message: 'Variable updated successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});