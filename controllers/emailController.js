const Message = require('../models/Message');
const config = require('../config/dbConn');

// Fonction pour enregistrer le message dans la base de données
async function saveMessageToDB(patientId, subject, content) {
  try {
    const message = new Message({
      patient: patientId,
      subject: subject,
      content: content
    });
    await message.save();
    console.log('Message saved to database successfully');
  } catch (error) {
    console.error('Error saving message to database:', error);
    throw error; // Re-lancer l'erreur pour gérer l'erreur à un niveau supérieur si nécessaire
  }
}

// Fonction pour envoyer un email au patient
async function sendEmailToPatient(patientEmail, subject, message, patientId, userRole) {
  try {
    // Vérifier si l'utilisateur est un médecin
    if (userRole !== 'doctor') {
      throw new Error('Unauthorized: Only doctor can send emails to patients.');
    }

    const mailOptions = {
      from: config.email.username,
      to: patientEmail,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent to patient successfully');
    // Enregistrer le message dans la base de données
    await saveMessageToDB(patientId, subject, message);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-lancer l'erreur pour gérer l'erreur à un niveau supérieur si nécessaire
  }
}

module.exports = { sendEmailToPatient };
