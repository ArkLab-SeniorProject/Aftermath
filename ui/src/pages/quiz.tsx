import {
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  LinearProgress,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMELINE_OPTIONS = [
  { value: 'lt6months', label: 'Less than 6 months ago' },
  { value: '6to12months', label: '6 to 12 months ago' },
  { value: '1to3years', label: '1 to 3 years ago' },
  { value: 'gt3years', label: 'More than 3 years ago' },
];

const HELP_OPTIONS = [
  { value: 'housing', label: 'Housing and shelter' },
  { value: 'financial', label: 'Financial help' },
  { value: 'repairs', label: 'Repairing damage' },
  { value: 'unsure', label: "I'm not sure yet" },
];

// Placeholder disaster types until FEMA API is connected
const DISASTER_TYPES = [
  'Hurricane or tropical storm',
  'Flood',
  'Wildfire',
  'Tornado',
  'Earthquake',
  'Winter storm or freeze',
  'Other',
];

interface Answers {
  zipCode: string;
  timeline: string;
  disasters: string[];
  helpType: string;
}

const TOTAL_STEPS = 4;

export default function QuizRoute() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    zipCode: '',
    timeline: '',
    disasters: [],
    helpType: '',
  });

  const progress = ((step) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setDone(true);
      }, 2500);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate('/');
  };

  const toggleDisaster = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      disasters: prev.disasters.includes(value)
        ? prev.disasters.filter((d) => d !== value)
        : [...prev.disasters, value],
    }));
  };

  const canContinue = (): boolean => {
    if (step === 0) return answers.zipCode.trim().length === 5;
    if (step === 1) return !!answers.timeline;
    if (step === 2) return answers.disasters.length > 0;
    if (step === 3) return !!answers.helpType;
    return false;
  };

  if (loading && !done) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          gap: 3,
          px: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant='h5' fontWeight={600}>
          Thank you.
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 360 }}>
          We're getting your resources ready.
        </Typography>
      </Box>
    );
  }

  if (done) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          gap: 3,
          px: 2,
        }}
      >
        <CheckCircle sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant='h5' fontWeight={600}>
          Your guide is ready.
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 360 }}>
          We found resources in your area based on your situation.
        </Typography>
        <Button variant='contained' size='large' sx={{ mt: 1, px: 4 }} onClick={() => navigate('/')}>
          View my resources
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={handleBack} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        <Typography variant='caption' color='text.secondary' sx={{ minWidth: 36, textAlign: 'right' }}>
          {step + 1}/{TOTAL_STEPS}
        </Typography>
      </Box>

      {step === 0 && (
        <StepWrapper
          question="Let's find help near you."
          hint='Enter your zip code so we can show you resources in your area.'
        >
          <TextField
            label='Zip Code'
            value={answers.zipCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              setAnswers((prev) => ({ ...prev, zipCode: val }));
            }}
            inputProps={{ inputMode: 'numeric', maxLength: 5 }}
            fullWidth
            autoFocus
          />
        </StepWrapper>
      )}

      {step === 1 && (
        <StepWrapper
          question="When did this happen?"
          hint='A rough estimate is fine. This helps us find programs that fit your timeline.'
        >
          <RadioGroup
            value={answers.timeline}
            onChange={(e) => setAnswers((prev) => ({ ...prev, timeline: e.target.value }))}
          >
            {TIMELINE_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </StepWrapper>
      )}

      {step === 2 && (
        <StepWrapper
          question='Which of these affected you?'
          hint={`These events happened in ${answers.zipCode} during that time. Select any that apply.`}
        >
          <FormGroup>
            {DISASTER_TYPES.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={answers.disasters.includes(type)}
                    onChange={() => toggleDisaster(type)}
                  />
                }
                label={type}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper
          question='What would help most right now?'
          hint=''
        >
          <RadioGroup
            value={answers.helpType}
            onChange={(e) => setAnswers((prev) => ({ ...prev, helpType: e.target.value }))}
          >
            {HELP_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </StepWrapper>
      )}

      <Button
        variant='contained'
        size='large'
        fullWidth
        disabled={!canContinue()}
        onClick={handleNext}
        sx={{ mt: 3, py: 1.75 }}
      >
        {step === TOTAL_STEPS - 1 ? 'See my resources' : 'Continue'}
      </Button>
    </Box>
  );
}

function StepWrapper({
  question,
  hint,
  children,
}: {
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant='h5' fontWeight={600} gutterBottom>
        {question}
      </Typography>
      {hint && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          {hint}
        </Typography>
      )}
      {children}
    </Box>
  );
}
