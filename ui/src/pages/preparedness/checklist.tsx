import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/molecules/page-container';

const CHECKLIST_ITEMS = [
  { id: 'water', label: 'Water — 1 gallon per person per day for 3 days' },
  { id: 'food', label: 'Non-perishable food — 3-day supply' },
  { id: 'radio', label: 'Battery-powered or hand-crank radio' },
  { id: 'flashlight', label: 'Flashlight with extra batteries' },
  { id: 'firstaid', label: 'First aid kit' },
  { id: 'whistle', label: 'Whistle to signal for help' },
  { id: 'mask', label: 'Dust masks and plastic sheeting' },
  { id: 'wrench', label: 'Wrench or pliers to turn off utilities' },
  { id: 'opener', label: 'Manual can opener' },
  { id: 'maps', label: 'Local maps' },
  { id: 'phone', label: 'Cell phone with chargers and a backup battery' },
  { id: 'documents', label: 'Copies of important documents in a waterproof container' },
  { id: 'medications', label: 'Prescription medications and glasses' },
  { id: 'cash', label: 'Cash in small denominations' },
  { id: 'sleeping', label: 'Sleeping bag or warm blanket for each person' },
];

const STORAGE_KEY = 'preparedness_checklist';

function loadChecked(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function PreparednessChecklist() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<string[]>(loadChecked);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const progress =
    CHECKLIST_ITEMS.length > 0 ? Math.round((checked.length / CHECKLIST_ITEMS.length) * 100) : 0;

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/preparedness')} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
        <Typography variant='h5' fontWeight={600}>
          Emergency Checklist
        </Typography>
      </Box>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        {checked.length} of {CHECKLIST_ITEMS.length} items ready ({progress}%)
      </Typography>

      <Paper sx={{ p: 3 }}>
        <FormGroup>
          {CHECKLIST_ITEMS.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox checked={checked.includes(item.id)} onChange={() => toggle(item.id)} />
              }
              label={item.label}
              sx={{
                mb: 0.5,
                textDecoration: checked.includes(item.id) ? 'line-through' : 'none',
                color: checked.includes(item.id) ? 'text.disabled' : 'text.primary',
              }}
            />
          ))}
        </FormGroup>
      </Paper>
    </PageContainer>
  );
}
