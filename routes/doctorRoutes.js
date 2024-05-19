const express = require('express');
const router = express.Router();
const { sendEmailToPatient } = require('../controllers/emailController');
const verifyJWT = require("../middleware/verifyJWT");

// Middleware pour vérifier le rôle de l'utilisateur
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: `Forbidden, only ${requiredRole}s can perform this action` });
    }
    next(); // Passer à la prochaine étape de la middleware stack
  };
};

// Route pour envoyer un email au patient
router.post('/send-email-to-patient', verifyJWT, checkRole('medecin'), async (req, res) => {
  try {
    const { patientEmail, subject, message, patientId } = req.body;
    await sendEmailToPatient(patientEmail, subject, message, patientId);
    res.status(200).json({ message: 'Email sent to patient successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to send email to patient' });
  }
});

// Route pour supprimer un patient (accessible uniquement aux medecins)
router.delete('/patients/:patientId', verifyJWT, checkRole('medecin'), async (req, res) => {
  try {
    const { patientId } = req.params;
    // Code pour supprimer le patient avec l'ID patientId
    res.status(200).json({ message: `Patient with ID ${patientId} deleted successfully` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
});

module.exports = router;
