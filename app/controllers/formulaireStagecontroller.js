const FormulaireStage = require('../models/formulaireStageModel');


exports.createFormulaireStage = async (req, res) => {
  try {
    const nouveauFormulaireStage = new FormulaireStage(req.body);
    const formulaireStageEnregistre = await nouveauFormulaireStage.save();
    res.json(formulaireStageEnregistre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du formulaire de stage' });
  }
};
// Fonction pour modifier un formulaire de stage
exports.updateFormulaireStage = async (req, res) => {
  try {
    const { nom, prenom, Matricule, dateNaissance, email, description } = req.body;
    const formulaireToUpdate = await FormulaireStage.findById(req.params.id);

    if (!formulaireToUpdate) {
      return res.status(404).json({ message: 'Formulaire de stage non trouvé' });
    }

    formulaireToUpdate.nom = nom;
    formulaireToUpdate.prenom = prenom;
    formulaireToUpdate.Matricule = Matricule;
    formulaireToUpdate.dateNaissance = dateNaissance;
    formulaireToUpdate.email = email;
    formulaireToUpdate.description = description;

    const updatedFormulaireStage = await formulaireToUpdate.save();
    res.json(updatedFormulaireStage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
