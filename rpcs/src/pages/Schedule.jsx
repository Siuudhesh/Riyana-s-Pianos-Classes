import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { db } from "../firebase/config";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails, Typography, Snackbar, CircularProgress } from "@mui/material";
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
    topic: "Theory", 
    date: moment().format("YYYY-MM-DD"),
    time: "",
    duration: "",
    location: "Home", 
    notes: "",
  });
  const [loading, setLoading] = useState(false);  // Loading state
  const [buttonStyle, setButtonStyle] = useState(null); 
  const [snackbarOpen, setSnackbarOpen] = useState(false); 
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);  // Delete confirmation dialog state
  const [classToDelete, setClassToDelete] = useState(null); // Store class ID to be deleted

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [selectedDate]);

  const fetchClasses = async () => {
    setLoading(true);  // Start loading
    try {
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
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const fetchStudents = async () => {
    setLoading(true);  // Start loading
    try {
      const studentsRef = collection(db, "students");
      const querySnapshot = await getDocs(studentsRef);
      setStudents(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!newClass.student || !newClass.topic || !newClass.date || !newClass.time || !newClass.duration || !newClass.location) {
      setSnackbarOpen(true); // Show error snackbar
      return;
    }

    setLoading(true);  // Start loading

    try {
      if (editClassId) {
        await updateDoc(doc(db, "classes", editClassId), newClass);
      } else {
        await addDoc(collection(db, "classes"), newClass);
      }
      fetchClasses();
      setShowModal(false);
      setEditClassId(null);
      setNewClass({
        student: "",
        topic: "Theory",
        date: moment().format("YYYY-MM-DD"),
        time: "",
        duration: "",
        location: "Home",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving class:", error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const deleteClass = async () => {
    setLoading(true);  // Start loading
    try {
      await deleteDoc(doc(db, "classes", classToDelete));
      fetchClasses();
      setDeleteConfirmationOpen(false);  // Close the delete confirmation dialog
      setClassToDelete(null);  // Reset class to be deleted
    } catch (error) {
      console.error("Error deleting class:", error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const markClassDone = async (classItem) => {
    setLoading(true);  // Start loading
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
      setButtonStyle('dark');
      setSnackbarOpen(true); // Open the popup
    } catch (error) {
      console.error("Error marking class as done:", error);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const upcomingClass = useMemo(() => {
    return classes.find((classItem) => moment(classItem.date + ' ' + classItem.time).isAfter(moment()));
  }, [classes]);

  return (
    <div className="schedule-page">
      <Navbar />
      <h1>Schedule</h1>
      <Button variant="contained" onClick={() => setShowModal(true)} className="add-btn">Add Class</Button>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <div className="schedule-list">
          {classes.map((classItem) => {
            const classMoment = moment(classItem.date + ' ' + classItem.time);
            const isUpcoming = upcomingClass && classMoment.isSame(upcomingClass.date + ' ' + upcomingClass.time);
            const isMissed = classMoment.isBefore(moment()) && !classItem.attendance; 

            return (
              <Accordion key={classItem.id}>
                <AccordionSummary expandIcon={null}>
                  <Typography variant="h6" className="student-namee">
                    {classItem.student} - {classItem.topic}
                    {isUpcoming && <span className="upcoming-label">Upcoming</span>}
                    {isMissed && <span className="missed-label">Missed</span>}
                  </Typography>
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
                    <Button className="delete-btn" onClick={() => {
                      setDeleteConfirmationOpen(true);  // Show delete confirmation dialog
                      setClassToDelete(classItem.id);  // Store the class ID to delete
                    }}><Delete /> Delete</Button>
                    <Button 
                      className="done-btn" 
                      onClick={() => markClassDone(classItem)} 
                      style={{ backgroundColor: buttonStyle === 'dark' ? '#333' : '' }}  
                    >
                      <CheckCircle /> Class Done
                    </Button>
                  </div>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      )}

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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Topic</InputLabel>
            <Select value={newClass.topic} onChange={(e) => setNewClass({ ...newClass, topic: e.target.value })}>
              <MenuItem value="Theory">Theory</MenuItem>
              <MenuItem value="Piano">Piano</MenuItem>
            </Select>
          </FormControl>
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
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleClassSubmit}>{editClassId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this class?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationOpen(false)}>Cancel</Button>
          <Button onClick={deleteClass} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for attendance message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Attendance marked!"
      />
    </div>
  );
};

export default SchedulePage;
