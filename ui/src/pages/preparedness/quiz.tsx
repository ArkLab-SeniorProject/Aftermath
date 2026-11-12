import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/molecules/page-container';

const HOME_OPTIONS = [
  ['own', 'I own my home'],
  ['own_not_land', "I own my home but not the land it's on"],
  ['rent', 'I rent my home'],
  ['unstable_housing', "I don't have stable housing right now"],
  ['prefer_not', 'Prefer not to say'],
] as const;

const HOUSEHOLD_OPTIONS = [
  ['just_me', 'Just me'],
  ['partner', 'A partner or spouse'],
  ['kids', 'Children'],
  ['older', 'Someone 65 or older'],
  ['medical_needs', 'Someone with medical needs'],
  ['access_needs', 'Someone with a disability'],
  ['family', 'Other family or friends'],
  ['roommates', 'Roommates'],
  ['pets', 'Pets'],
  ['prefer_not', 'Prefer not to say'],
] as const;

export default function PreparednessQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [zip, setZip] = useState('');
  const [home, setHome] = useState('');
  const [household, setHousehold] = useState<string[]>([]);
  const [name, setName] = useState('');

  const toggleHousehold = (value: string) => {
    setHousehold((current) => {
      if (value === 'prefer_not') return current.includes(value) ? [] : [value];
      if (value === 'just_me') {
        return current.includes(value)
          ? []
          : [
              'just_me',
              ...current.filter((item) =>
                ['older', 'medical_needs', 'access_needs', 'pets'].includes(item)
              ),
            ];
      }
      return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current.filter((item) => item !== 'prefer_not'), value];
    });
  };

  const save = () => {
    localStorage.setItem(
      'preparedness_quiz_answers',
      JSON.stringify({ zip, home, household, name, updatedAt: new Date().toISOString() })
    );
    setStep(4);
  };

  if (step === 4) {
    return (
      <PageContainer>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Your preparedness plan is ready
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 3 }}>
          We&apos;ll use your ZIP, home, and household answers to show checklists that fit your
          home.
        </Typography>
        <Button variant='contained' onClick={() => navigate('/preparedness/checklist')}>
          See my checklists
        </Button>
      </PageContainer>
    );
  }

  const questions = [
    <Box key='location'>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Where are you located?
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        Your ZIP code helps identify local hazards.
      </Typography>
      <TextField
        label='ZIP Code'
        value={zip}
        onChange={(event) => setZip(event.target.value.replace(/\D/g, '').slice(0, 5))}
        inputProps={{ inputMode: 'numeric', maxLength: 5 }}
        fullWidth
        autoFocus
      />
    </Box>,
    <Box key='home'>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Which best describes your home?
      </Typography>
      <RadioGroup value={home} onChange={(event) => setHome(event.target.value)}>
        {HOME_OPTIONS.map(([value, label]) => (
          <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
        ))}
      </RadioGroup>
    </Box>,
    <Box key='household'>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        Who&apos;s in your home?
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 2 }}>
        Select everything that applies.
      </Typography>
      {HOUSEHOLD_OPTIONS.map(([value, label]) => (
        <FormControlLabel
          key={value}
          control={
            <Checkbox checked={household.includes(value)} onChange={() => toggleHousehold(value)} />
          }
          label={label}
          sx={{ display: 'flex' }}
        />
      ))}
    </Box>,
    <Box key='name'>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        What would you like us to call you?
      </Typography>
      <TextField
        label='Name or nickname (optional)'
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth
        autoFocus
      />
    </Box>,
  ];

  const canContinue = [zip.length === 5, !!home, household.length > 0, true][step];

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => (step ? setStep(step - 1) : navigate('/preparedness'))}
        >
          Back
        </Button>
      </Box>
      {questions[step]}
      <Button
        variant='contained'
        fullWidth
        sx={{ mt: 4 }}
        disabled={!canContinue}
        onClick={() => (step === 3 ? save() : setStep(step + 1))}
      >
        {step === 3 ? 'See my plan' : 'Next'}
      </Button>
    </PageContainer>
  );
}
