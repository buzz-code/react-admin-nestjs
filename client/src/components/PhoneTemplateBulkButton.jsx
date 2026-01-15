import React, { useState } from 'react';
import { 
  Button, 
  useNotify, 
  useRefresh,
  useDataProvider,
  useListContext,
} from 'react-admin';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';

const PhoneTemplateBulkButton = ({ phoneNumberExtractor, resource }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const { selectedIds, data } = useListContext();

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    
    try {
      // Fetch active phone templates
      const { data: templatesData } = await dataProvider.getList('phone_template', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
        filter: { isActive: true },
      });
      
      setTemplates(templatesData);
    } catch (error) {
      notify('Failed to load templates', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    
    // Extract phone numbers from selected records
    const selectedRecords = selectedIds.map(id => data[id]).filter(Boolean);
    
    let phoneNumbers = [];
    if (phoneNumberExtractor) {
      phoneNumbers = selectedRecords
        .map(record => {
          const phone = phoneNumberExtractor(record);
          if (phone) {
            return {
              phone,
              name: record.name || record.studentName || '',
              metadata: { recordId: record.id },
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (phoneNumbers.length === 0) {
      notify('No valid phone numbers found in selected records', { type: 'warning' });
      return;
    }

    // Confirm action
    const confirmed = window.confirm(
      `Send phone message to ${phoneNumbers.length} numbers using template "${template.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      // Call the entity's action endpoint
      const response = await fetch(`/api/${resource}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute-phone-campaign',
          templateId: template.id,
          selectedIds,
          phoneNumbers,
        }),
      });

      const result = await response.json();

      if (result.error) {
        notify(result.error, { type: 'error' });
      } else if (result.success) {
        notify(
          `Campaign started successfully! ${phoneNumbers.length} calls initiated.`,
          { type: 'success' }
        );
        setOpen(false);
        refresh();
      }
    } catch (error) {
      notify('Failed to execute campaign', { type: 'error' });
    } finally {
      setLoading(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      <Button
        label="Send Phone Messages"
        onClick={handleOpen}
        disabled={!selectedIds || selectedIds.length === 0}
      >
        <PhoneIcon />
      </Button>

      <Dialog 
        open={open} 
        onClose={() => !loading && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Phone Template</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Typography>
              No active phone templates found. Please create a template first.
            </Typography>
          ) : (
            <List>
              {templates.map(template => (
                <ListItem key={template.id} disablePadding>
                  <ListItemButton 
                    onClick={() => handleSelectTemplate(template)}
                    disabled={loading}
                  >
                    <ListItemText
                      primary={template.name}
                      secondary={template.description}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2 }}>
            {selectedIds?.length || 0} records selected
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            label="ra.action.cancel"
            disabled={loading}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PhoneTemplateBulkButton;
