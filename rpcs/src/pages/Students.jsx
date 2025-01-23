import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Students.css';
import '../styles/common.css';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '25px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #fff4bd, #fdf7d2)',
  color: theme.palette.text.primary,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  },
}));

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

const StudentsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState({ name: '', age: '', level: '', notes: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const studentsList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setStudents(studentsList);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleCardClick = (student) => {
    setStudentDetails(student);
    setViewDialogOpen(true);
  };

  const handleEditClick = (student) => {
    setStudentDetails({ ...student });
    setEditingStudent(student.id);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setStudentDetails({ name: '', age: '', level: '', notes: '' });
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const saveStudent = async () => {
    try {
      if (editingStudent) {
        await updateDoc(doc(db, 'students', editingStudent), studentDetails);
      } else {
        await addDoc(collection(db, 'students'), studentDetails);
      }
      const updatedStudents = await getDocs(collection(db, 'students'));
      setStudents(updatedStudents.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      handleDialogClose();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      setStudents((prevStudents) => prevStudents.filter((student) => student.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="students-page">
      <Navbar />
      <Container className="students-container">
        <header className="students-header">
          <Typography variant="h3" className="students-title">
            Manage Your Students
          </Typography>
        </header>
        <StyledButton onClick={() => setEditDialogOpen(true)} variant="contained" className="action-btn">
          Add New Student
        </StyledButton>
        <section className="students-list">
          <Typography variant="h5" className="list-title">
            Students List
          </Typography>
          {students.length === 0 ? (
            <Typography variant="body1" className="no-students-message">
              No students available. Add new students to get started!
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {students.map((student) => (
                <Grid item xs={12} sm={6} md={4} key={student.id}>
                  <Paper className="student-card" onClick={() => handleCardClick(student)}>
                    <Typography variant="h6" className="student-name">
                      {student.name}
                    </Typography>
                    <Typography variant="body2">Age: {student.age || 'N/A'}</Typography>
                    <Typography variant="body2" className="student-notes">
                      Notes: {student.notes || 'No notes available'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </section>
      </Container>

      {/* View Student Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm" PaperProps={{ sx: { background: 'linear-gradient(135deg, #ffd1dc, #f8cdd8)', borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' } }}>
        <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Student Details</DialogTitle>
        <DialogContent>
          <Typography>Name: {studentDetails.name}</Typography>
          <Typography>Age: {studentDetails.age}</Typography>
          <Typography>Level: {studentDetails.level || 'N/A'}</Typography>
          <Typography>Notes: {studentDetails.notes || 'N/A'}</Typography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => handleEditClick(studentDetails)}>Edit</StyledButton>
          <StyledButton onClick={() => deleteStudent(studentDetails.id)} color="error">
            Delete
          </StyledButton>
          <StyledButton onClick={handleDialogClose} color="secondary">
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Student Dialog */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm" PaperProps={{ sx: { background: 'linear-gradient(135deg, #b5e6eb, #d7f4f5)', borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' } }}>
        <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <StyledTextField
            label="Name"
            name="name"
            value={studentDetails.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <StyledTextField
            label="Age"
            name="age"
            value={studentDetails.age}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <StyledTextField
            label="Level"
            name="level"
            value={studentDetails.level}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <StyledTextField
            label="Notes"
            name="notes"
            value={studentDetails.notes}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleDialogClose} color="secondary">
            Cancel
          </StyledButton>
          <StyledButton onClick={saveStudent} variant="contained">
            Save
          </StyledButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentsPage;
