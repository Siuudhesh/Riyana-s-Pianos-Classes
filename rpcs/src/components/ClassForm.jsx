// src/components/ClassForm.jsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import { db } from "../firebase/config";  // Import your Firebase config
import { collection, addDoc, updateDoc, doc, getDocs } from "firebase/firestore";  // Import getDocs
import moment from "moment";

// Styled TextField like in StudentsPage
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const ClassForm = ({ open, onClose, editClassData = null, onClassSaved }) => {
  const [newClass, setNewClass] = useState({
    student: "",
    topic: "",
    date: moment().format("YYYY-MM-DD"),
    time: "",
    duration: "",
    location: "Home", 
    notes: "",
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, "students");  // Refer to your Firestore collection
        const snapshot = await getDocs(studentsRef);  // Fetch the documents
        setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));  // Map data to state
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();

    if (editClassData) {
      setNewClass(editClassData);  // Set data if editing
    }
  }, [editClassData]);

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!newClass.student || !newClass.topic || !newClass.date || !newClass.time || !newClass.duration || !newClass.location) return;

    try {
      if (editClassData) {
        await updateDoc(doc(db, "classes", editClassData.id), newClass);  // Update class if editing
      } else {
        await addDoc(collection(db, "classes"), newClass);  // Add new class
      }

      onClassSaved();  // Notify parent component
      onClose();  // Close dialog
      setNewClass({ student: "", topic: "", date: moment().format("YYYY-MM-DD"), time: "", duration: "", location: "Home", notes: "" });  // Reset form
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editClassData ? "Edit Class" : "Add Class"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Student</InputLabel>
          <Select
            value={newClass.student}
            onChange={(e) => setNewClass({ ...newClass, student: e.target.value })}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.name}>{student.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <StyledTextField
          label="Topic"
          fullWidth
          value={newClass.topic}
          onChange={(e) => setNewClass({ ...newClass, topic: e.target.value })}
          sx={{ mb: 2 }}
        />
        <StyledTextField
          type="date"
          fullWidth
          value={newClass.date}
          onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
          sx={{ mb: 2 }}
        />
        <StyledTextField
          type="time"
          fullWidth
          value={newClass.time}
          onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
          sx={{ mb: 2 }}
        />
        <StyledTextField
          label="Duration (hours)"
          type="number"
          fullWidth
          value={newClass.duration}
          onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
          sx={{ mb: 2 }}
        />
        <StyledTextField
          label="Location"
          fullWidth
          value={newClass.location}
          onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
          sx={{ mb: 2 }}
        />
        <StyledTextField
          label="Notes"
          fullWidth
          multiline
          rows={3}
          value={newClass.notes}
          onChange={(e) => setNewClass({ ...newClass, notes: e.target.value })}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleClassSubmit}>{editClassData ? "Update" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassForm;
