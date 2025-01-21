import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Button, TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../styles/Students.css';
import '../styles/common.css';
import '../styles/transitions.css';

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
});

const StyledButton = styled(Button)({
  borderRadius: '25px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, var(--primary-pink), var(--accent-purple))',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
  },
});

const StudentsPage = () => {
  const { isAuthenticated } = useAuth(); // Fetch isAuthenticated from AuthContext
  const navigate = useNavigate();       // Initialize navigate for redirection

  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch students on component mount
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

  // Add a new student
  const addStudent = async () => {
    if (studentName.trim()) {
      try {
        await addDoc(collection(db, 'students'), { name: studentName });
        setStudentName('');
        const updatedStudents = await getDocs(collection(db, 'students'));
        setStudents(updatedStudents.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error adding student:', error);
      }
    }
  };

  // Edit an existing student
  const editStudent = async () => {
    if (studentName.trim() && studentId) {
      try {
        await updateDoc(doc(db, 'students', studentId), { name: studentName });
        setStudentName('');
        setStudentId(null);
        const updatedStudents = await getDocs(collection(db, 'students'));
        setStudents(updatedStudents.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error updating student:', error);
      }
    }
  };

  // Delete a student
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
      <div className="logout-container">
      <LogoutButton />
      </div>
      <Container className="students-container">
        <header className="students-header">
          <Typography variant="h3" className="students-title">
            Manage Your Students
          </Typography>
        </header>

        <section className="students-actions">
          <Typography variant="h5" className="actions-title">
            {studentId ? 'Edit Student' : 'Add New Student'}
          </Typography>

          <StyledTextField
            label="Student Name"
            variant="outlined"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            fullWidth
            className="student-input"
          />

          <Box className="action-buttons">
            <StyledButton
              variant="contained"
              onClick={studentId ? editStudent : addStudent}
              className="action-btn"
            >
              {studentId ? 'Update Student' : 'Add Student'}
            </StyledButton>
          </Box>
        </section>

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
                  <Paper className="student-card">
                    <Typography variant="h6" className="student-name">
                      {student.name}
                    </Typography>
                    <Box className="student-actions">
                      <StyledButton
                        variant="outlined"
                        onClick={() => {
                          setStudentId(student.id);
                          setStudentName(student.name);
                        }}
                        className="action-btn"
                      >
                        Edit
                      </StyledButton>
                      <StyledButton
                        variant="outlined"
                        color="error"
                        onClick={() => deleteStudent(student.id)}
                        className="action-btn"
                      >
                        Delete
                      </StyledButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </section>
      </Container>
    </div>
  );
};

export default StudentsPage;
