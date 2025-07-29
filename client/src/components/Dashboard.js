// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDashboardSummary } from '../store/slices/dashboardSlice';
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   CircularProgress,
//   Alert
// } from '@mui/material';
// import {
//   AccessTime,
//   Today,
//   ViewWeek,
//   History
// } from '@mui/icons-material';
// import moment from 'moment';

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { summary, loading, error } = useSelector((state) => state.dashboard);

//   useEffect(() => {
//     dispatch(fetchDashboardSummary());
//   }, [dispatch]);

//   const formatDuration = (minutes) => {
//     if (!minutes) return '0:00';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}:${mins.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Alert severity="error" sx={{ mb: 2 }}>
//         {error}
//       </Alert>
//     );
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Dashboard
//       </Typography>
      
//       <Grid container spacing={3}>
//         {/* Summary Cards */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <Today color="primary" sx={{ mr: 1 }} />
//                 <Typography variant="h6">Today</Typography>
//               </Box>
//               <Typography variant="h4" color="primary">
//                 {formatDuration(summary?.todayTotal || 0)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <ViewWeek color="secondary" sx={{ mr: 1 }} />
//                 <Typography variant="h6">This Week</Typography>
//               </Box>
//               <Typography variant="h4" color="secondary">
//                 {formatDuration(summary?.weekTotal || 0)}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <AccessTime color="success" sx={{ mr: 1 }} />
//                 <Typography variant="h6">Total Tasks</Typography>
//               </Box>
//               <Typography variant="h4" color="success">
//                 {summary?.totalTasks || 0}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <History color="info" sx={{ mr: 1 }} />
//                 <Typography variant="h6">Active</Typography>
//               </Box>
//               <Typography variant="h4" color="info">
//                 {summary?.recentEntries?.filter(entry => entry.isRunning).length|| 0}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid> */}

//         {/* Recent Entries */}
//         <Grid item xs={12}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 Recent Entries
//               </Typography>
//               {summary?.recentEntries?.length > 0 ? (
//                 <List>
//                   {summary.recentEntries.map((entry) => (
//                     <ListItem key={entry._id} divider>
//                       <ListItemText
//                         primary={entry.task.name}
//                         secondary={
//                           <Box>
//                             <Typography variant="body2" color="text.secondary">
//                               {entry.task.project.name}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {moment(entry.startTime).format('MMM DD, YYYY HH:mm')}
//                             </Typography>
//                           </Box>
//                         }
//                       />
//                       <Box display="flex" alignItems="center">
//                         <Chip
//                           label={formatDuration(entry.duration)}
//                           color="primary"
//                           size="small"
//                         />
//                         {entry.isRunning && (
//                           <Chip
//                             label="Running"
//                             color="success"
//                             size="small"
//                             sx={{ ml: 1 }}
//                           />
//                         )}
//                       </Box>
//                     </ListItem>
//                   ))}
//                 </List>
//               ) : (
//                 <Typography variant="body2" color="text.secondary">
//                   No recent entries
//                 </Typography>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default Dashboard; 

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardSummary,
  fetchWeeklyData,
} from '../store/slices/dashboardSlice';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper
} from '@mui/material';
import {
  AccessTime,
  Today,
  ViewWeek,
} from '@mui/icons-material';
import moment from 'moment';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { summary, weeklyData, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchWeeklyData());
  }, [dispatch]);

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Today color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Today</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatDuration(summary?.todayTotal || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ViewWeek color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">This Week</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {formatDuration(summary?.weekTotal || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccessTime color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Tasks</Typography>
              </Box>
              <Typography variant="h4" color="success">
                {summary?.totalTasks || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Summary Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Summary
              </Typography>
              {weeklyData?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Day</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell><strong>Project Breakdown</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeklyData.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{day.dayName}</TableCell>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{day.formattedTotal}</TableCell>
                          <TableCell>
                            <List dense>
                              {day.projects.map((project, index) => (
                                <ListItem key={index} disablePadding>
                                  <ListItemText
                                    primary={`${project.name} - ${project.formattedTotal}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No weekly data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Entries */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Entries
              </Typography>
              {summary?.recentEntries?.length > 0 ? (
                <List>
                  {summary.recentEntries.map((entry) => (
                    <ListItem key={entry._id} divider>
                      <ListItemText
                        primary={entry.task.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {entry.task.project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {moment(entry.startTime).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box display="flex" alignItems="center">
                        <Chip
                          label={formatDuration(entry.duration)}
                          color="primary"
                          size="small"
                        />
                        {entry.isRunning && (
                          <Chip
                            label="Running"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent entries
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
