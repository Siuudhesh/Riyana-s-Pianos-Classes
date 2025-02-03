import React, { useState, useEffect } from "react";
import moment from "moment";
import { db } from "../firebase/config";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { ExpandMore, Edit, Delete, CheckCircle } from "@mui/icons-material"; 
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import "../styles/Schedule.css";

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

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editClassId, setEditClassId] = useState(null);

  const [newClass, setNewClass] = useState({
    student: "",
    topic: "",
    date: moment().format("YYYY-MM-DD"),
    time: "",
    duration: "",
    location: "Home", 
    notes: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [selectedDate]);

  const fetchClasses = async () => {
    const classesRef = collection(db, "classes");
    const q = query(classesRef);
    const querySnapshot = await getDocs(q);
  
    const fetchedClasses = querySnapshot.docs.map((doc) => {
      const classData = doc.data();
      const studentId = classData.studentId || ''; 
      return {
        id: doc.id,
        ...classData,
        studentId,  
      };
    }).sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date));
  
    setClasses(fetchedClasses);
  };

  const fetchStudents = async () => {
    const studentsRef = collection(db, "students");
    const querySnapshot = await getDocs(studentsRef);
    setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!newClass.student || !newClass.topic || !newClass.date || !newClass.time || !newClass.duration || !newClass.location) return;
  
    try {
      if (editClassId) {
        await updateDoc(doc(db, "classes", editClassId), newClass);
      } else {
        await addDoc(collection(db, "classes"), newClass);
      }
      fetchClasses();
      setShowModal(false);
      setEditClassId(null);
      setNewClass({ student: "", topic: "", date: moment().format("YYYY-MM-DD"), time: "", duration: "", location: "Home", notes: "" });
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  const deleteClass = async (classId) => {
    try {
      await deleteDoc(doc(db, "classes", classId));
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const markClassDone = async (classItem) => {
    try {
      const selectedStudent = students.find(student => student.name === classItem.student);
      if (!selectedStudent) {
        console.error("Student not found");
        return;
      }
  
      const studentRef = doc(db, "students", selectedStudent.id); 
      const studentSnapshot = await getDoc(studentRef);
  
      if (!studentSnapshot.exists()) {
        console.log("Student not found");
        return;
      }
  
      const studentData = studentSnapshot.data();
  
      const attendanceCount = studentData.attendanceCount ? Number(studentData.attendanceCount) : 0;
      const updatedAttendanceCount = attendanceCount + 1;
  
      const updatedAttendance = [...studentData.attendance || [], moment().format("YYYY-MM-DD")];
      await updateDoc(studentRef, {
        attendance: updatedAttendance,
        attendanceCount: updatedAttendanceCount,
      });
  
      await deleteDoc(doc(db, "classes", classItem.id));
      fetchClasses();
    } catch (error) {
      console.error("Error marking class as done:", error);
    }
  };

  return (
    <div className="schedule-page">
      <Navbar />
      <h1>Schedule</h1>
      <Button variant="contained" onClick={() => setShowModal(true)} className="add-btn">Add Class</Button>
      <div className="schedule-list">
        {classes.map((classItem) => (
          <Accordion key={classItem.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" className="student-name">{classItem.student} - {classItem.topic}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Date: {moment(classItem.date).format("MMMM D, YYYY")}</Typography>
              <Typography>Time: {classItem.time}</Typography>
              <Typography>Duration: {classItem.duration} hours</Typography>
              <Typography>Location: {classItem.location}</Typography>
              {classItem.notes && <Typography>Notes: {classItem.notes}</Typography>}
              <div className="button-group">
                <Button className="edit-btn" onClick={() => {
                  setShowModal(true);
                  setEditClassId(classItem.id);
                  setNewClass(classItem);
                }}><Edit /> Edit</Button>
                <Button className="delete-btn" onClick={() => deleteClass(classItem.id)}><Delete /> Delete</Button>
                <Button className="done-btn" onClick={() => markClassDone(classItem)}><CheckCircle /> Class Done</Button>
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>

      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>{editClassId ? "Edit Class" : "Add Class"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Student</InputLabel>
            <Select value={newClass.student} onChange={(e) => setNewClass({ ...newClass, student: e.target.value })}>
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
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
          <StyledTextField
            type="date"
            fullWidth
            value={newClass.date}
            onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
          <StyledTextField
            type="time"
            fullWidth
            value={newClass.time}
            onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
          <StyledTextField
            label="Duration (hours)"
            type="number"
            fullWidth
            value={newClass.duration}
            onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
          <StyledTextField
            label="Location"
            fullWidth
            value={newClass.location}
            onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
          <StyledTextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={newClass.notes}
            onChange={(e) => setNewClass({ ...newClass, notes: e.target.value })}
            sx={{ mb: 2 }}  // Adding margin-bottom for spacing
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleClassSubmit}>{editClassId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
