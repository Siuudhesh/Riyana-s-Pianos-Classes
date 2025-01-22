// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { FaUserGraduate, FaCalendarAlt, FaChartLine, FaPlusCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/common.css';
import '../styles/transitions.css';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <Container className="dashboard-container">
        <header className="dashboard-header">
          <Typography variant="h3" className="dashboard-title">
            Welcome, Teacher Ri! 
          </Typography>
          <Typography variant="subtitle1" className="dashboard-subtitle">
            Manage your students and classes with ease.
          </Typography>
        </header>

        <Grid container spacing={4} className="dashboard-stats">
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="stats-card">
              <Typography variant="h4" className="stats-number">
                12
              </Typography>
              <Typography variant="subtitle1" className="stats-label">
                Active Students
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="stats-card">
              <Typography variant="h4" className="stats-number">
                8
              </Typography>
              <Typography variant="subtitle1" className="stats-label">
                Scheduled Classes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="stats-card">
              <Typography variant="h4" className="stats-number">
                95%
              </Typography>
              <Typography variant="subtitle1" className="stats-label">
                Attendance Rate
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <section className="dashboard-actions">
          <Typography variant="h5" className="actions-title">
            Quick Actions
          </Typography>
          <Grid container spacing={4} className="actions-container">
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="action-card manage-students" onClick={() => navigate('/students')}>
                <FaUserGraduate className="action-icon" />
                <Typography variant="h6" className="action-title">
                  Manage Students
                </Typography>
                <Typography variant="body2" className="action-description">
                  View and organize student information effortlessly.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="action-card view-schedule">
                <FaCalendarAlt className="action-icon" />
                <Typography variant="h6" className="action-title">
                  View Schedule
                </Typography>
                <Typography variant="body2" className="action-description">
                  Check your upcoming classes and events.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="action-card analyze-progress">
                <FaChartLine className="action-icon" />
                <Typography variant="h6" className="action-title">
                  Analyze Progress
                </Typography>
                <Typography variant="body2" className="action-description">
                  Track student performance and improvement trends.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper className="action-card add-class">
                <FaPlusCircle className="action-icon" />
                <Typography variant="h6" className="action-title">
                  Add a New Class
                </Typography>
                <Typography variant="body2" className="action-description">
                  Schedule and create a new class for your students.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </section>

        <footer className="dashboard-footer">
          <Typography variant="caption" className="footer-text">
            🎵 Riyana's Piano Classes - Empowering young musicians with love ❤️
          </Typography>
        </footer>
      </Container>
    </div>
  );
};

export default Dashboard;