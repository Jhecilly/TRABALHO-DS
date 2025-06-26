const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const MATERIALS_FILE = './materials.json';
const SUPPLIERS_FILE = './suppliers.json';

// Utilidades para ler e salvar arquivos
function readJSON(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Rotas de materiais
app.get('/api/materials', (req, res) => {
    res.json(readJSON(MATERIALS_FILE));
});
app.post('/api/materials', (req, res) => {
    const materials = readJSON(MATERIALS_FILE);
    const newMaterial = req.body;
    newMaterial.id = Number(Date.now()); // Garante que o id é Number
    newMaterial.quantity = 0;
    materials.push(newMaterial);
    writeJSON(MATERIALS_FILE, materials);
    res.json({ success: true });
});
app.put('/api/materials/:id', (req, res) => {
    const materials = readJSON(MATERIALS_FILE);
    const idx = materials.findIndex(m => m.id == req.params.id);
    if (idx !== -1) {
        materials[idx] = { ...materials[idx], ...req.body };
        writeJSON(MATERIALS_FILE, materials);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Material não encontrado' });
    }
});
// Adicionar rota DELETE para materiais
app.delete('/api/materials/:id', (req, res) => {
    let materials = readJSON(MATERIALS_FILE);
    const id = Number(req.params.id);
    // Adiciona log para depuração
    // console.log('Tentando excluir material com id:', id);
    const newMaterials = materials.filter(m => Number(m.id) !== id);
    if (newMaterials.length === materials.length) {
        return res.status(404).json({ error: 'Material não encontrado' });
    }
    writeJSON(MATERIALS_FILE, newMaterials);
    res.json({ success: true });
});
// Adicionar rota DELETE para resetar todos os materiais
app.delete('/api/materials', (req, res) => {
    writeJSON(MATERIALS_FILE, []);
    res.json({ success: true });
});

// Rotas de fornecedores
app.get('/api/suppliers', (req, res) => {
    res.json(readJSON(SUPPLIERS_FILE));
});
app.post('/api/suppliers', (req, res) => {
    const suppliers = readJSON(SUPPLIERS_FILE);
    const newSupplier = req.body;
    newSupplier.id = Date.now();
    suppliers.push(newSupplier);
    writeJSON(SUPPLIERS_FILE, suppliers);
    res.json({ success: true });
});
// Adicionar rota DELETE para fornecedores
app.delete('/api/suppliers/:id', (req, res) => {
    let suppliers = readJSON(SUPPLIERS_FILE);
    const id = Number(req.params.id);
    const newSuppliers = suppliers.filter(s => s.id !== id);
    if (newSuppliers.length === suppliers.length) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    writeJSON(SUPPLIERS_FILE, newSuppliers);
    res.json({ success: true });
});

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
