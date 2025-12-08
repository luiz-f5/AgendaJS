let medicalFiles = [];
let nextId = 1;

class MedicalFile {
  static create({ filename, path, doctorId, patientId }) {
    const file = {
      id: nextId++,
      filename,
      path,
      doctorId,
      patientId: Number(patientId),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    medicalFiles.push(file);
    return file;
  }

  static findAll({ where = {} } = {}) {
    return medicalFiles.filter(file => {
      return Object.entries(where).every(([key, value]) => file[key] === value);
    });
  }

  static getAll() {
    return medicalFiles;
  }
}

module.exports = MedicalFile;
