const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/file.controller');
const auth = require('../middlewares/auth');
const path = require("path");
const fs = require("fs");
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/send', auth, upload.single('pdf'), fileController.sendFile);
router.get('/my-files', auth, fileController.listFilesForPatient);
router.get('/sent/:doctorId', auth, fileController.listFilesSentByDoctor);
router.get("/download/:id", auth, async (req, res) => {
  const MedicalFile = require("../models/MedicalFile");
  const file = MedicalFile.findAll({ where: { id: parseInt(req.params.id) } })[0];

  if (!file) {
    return res.status(404).json({ message: "Arquivo não encontrado" });
  }

  if (req.user.role === "paciente" && file.patientId !== req.user.id) {
    return res.status(403).json({ message: "Você não tem permissão para baixar este arquivo" });
  }
  if (req.user.role === "medico" && file.doctorId !== req.user.id) {
    return res.status(403).json({ message: "Você não tem permissão para baixar este arquivo" });
  }

  if (!fs.existsSync(file.path)) {
    return res.status(404).json({ message: "Arquivo físico não encontrado" });
  }

  res.download(file.path, file.filename);
});

router.get("/all", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Somente admin pode ver todos os arquivos" });
  }
  const MedicalFile = require("../models/MedicalFile");
  const files = MedicalFile.getAll();
  res.json(files);
});

router.delete("/remove/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Somente admin pode remover arquivos" });
  }
  const MedicalFile = require("../models/MedicalFile");
  const id = parseInt(req.params.id, 10);
  const files = MedicalFile.getAll();
  const index = files.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Arquivo não encontrado" });
  }
  files.splice(index, 1);
  return res.json({ message: "Arquivo removido com sucesso" });
});
module.exports = router;

