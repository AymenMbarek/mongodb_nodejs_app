const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['doctor', 'familly', 'patient'],
      required: true,
    },
    cabinet_location: {
      type: String, // Requis seulement si le rôle est médecin
    },
    work_hours: {
      type: String, // Requis seulement si le rôle est médecin
    },
    specialty: {
      type: String, // Requis seulement si le rôle est médecin
    },
    patient_id: {
      type: String,
    },
    family_relation: {
      type: String, // Requis seulement si le rôle est famille
    },
    date_of_birth: {
      type: Date, // Requis seulement si le rôle est patient
    },
    address: {
      type: String, // Requis seulement si le rôle est patient
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

