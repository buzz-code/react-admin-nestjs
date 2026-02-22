import React from "react";
import { useDataProvider, SimpleForm, TextInput, useNotify, Toolbar, SaveButton, useResetStore } from "react-admin";
import { useObjectStore } from "src/utils/storeUtil";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import Paper from "@mui/material/Paper";

export const StudentGuard = ({ children }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const reset = useResetStore();
  const { value: student, set: setStudent, clear } = useObjectStore("student");

  const handleLogout = () => {
    clear();
    reset();
  };

  if (student) {
    return (
      <Box display="flex" flexDirection="column" width="100%">
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div">
            שלום התלמידה <strong>{student.name}</strong>
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            התנתק
          </Button>
        </Paper>
        <Box flexGrow={1}>{children}</Box>
      </Box>
    );
  }

  const handleSubmit = async (values) => {
    const { tz } = values;
    const result = await dataProvider.getList("student", {
      pagination: { page: 1, perPage: 1 },
      filter: { tz },
    });
    const student = result.data[0] || null;

    if (student) {
      setStudent(student);
    } else {
      notify("Student not found", { type: "warning" });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
    >
      <Card sx={{ minWidth: 300, maxWidth: 400, p: 2, boxShadow: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
           כניסת תלמידה
          </Typography>
        </Box>
        <CardContent>
          <SimpleForm
            key="view-search-form"
            onSubmit={handleSubmit}
            resource="student"
            toolbar={
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  bgcolor: "transparent",
                  p: 0,
                }}
              >
                <SaveButton
                  label="כניסה"
                  variant="contained"
                  fullWidth
                  color="secondary"
                />
              </Toolbar>
            }
          >
            <TextInput source="tz" label="ת.ז" fullWidth variant="outlined" />
          </SimpleForm>
        </CardContent>
      </Card>
    </Box>
  );
};
