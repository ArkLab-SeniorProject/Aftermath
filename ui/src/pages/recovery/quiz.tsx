import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
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

const TOTAL_STEPS = 9;

const TIMELINE_OPTIONS = [
  { value: 'lt6months', label: 'Less than 6 months' },
  { value: '6to12months', label: '6 to 12 months' },
  { value: '1to3years', label: '1 to 3 years' },
  { value: 'gt3years', label: 'More than 3 years' },
  { value: 'unsure', label: "I'm not sure" },
];

const MOCK_DISASTERS = [
  { id: 'DR-4883', title: 'Severe Storms and Flooding', date: 'March 2025' },
  { id: 'DR-4862', title: 'Wildfires', date: 'January 2025' },
  { id: 'DR-4824', title: 'Tropical Storm Hilary', date: 'August 2024' },
  { id: 'DR-4699', title: 'Earthquake', date: 'December 2023' },
];

const HELP_OPTIONS = [
  { value: 'damage_recovery', label: 'Damage recovery' },
  { value: 'financial_assistance', label: 'Financial assistance' },
  { value: 'housing_shelter', label: 'Housing and shelter' },
  { value: 'unsure', label: "I'm not sure yet" },
];

const HOME_OPTIONS = [
  { value: 'own', label: 'I own my home' },
  { value: 'rent', label: 'I rent my home' },
  { value: 'unstable', label: "I don't have stable housing right now" },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const HOUSEHOLD_OPTIONS = [
  { value: 'just_me', label: 'Just me' },
  { value: 'partner', label: 'Partner or spouse' },
  { value: 'children', label: 'Children' },
  { value: 'other_family', label: 'Other family members' },
  { value: 'roommates', label: 'Roommates' },
  { value: 'pets', label: 'Pets' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export interface RecoveryQuizAnswers {
  zipCode: string;
  timeline: string;
  disasters: string[];
  helpTypes: string[];
  homeStatus: string;
  household: string[];
  name: string;
}

const EMPTY_ANSWERS: RecoveryQuizAnswers = {
  zipCode: '',
  timeline: '',
  disasters: [],
  helpTypes: [],
  homeStatus: '',
  household: [],
  name: '',
};

const STORAGE_KEY = 'recovery_quiz_answers';

function saveAnswers(answers: RecoveryQuizAnswers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  localStorage.setItem('recovery_quiz_complete', 'true');
}

export default function RecoveryQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RecoveryQuizAnswers>(EMPTY_ANSWERS);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate('/');
  };

  const handleFinish = () => {
    saveAnswers(answers);
    navigate('/dashboard');
  };

  const toggleMulti = (
    field: 'disasters' | 'helpTypes' | 'household',
    value: string,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 0:
        return answers.zipCode.trim().length === 5;
      case 1:
        return !!answers.timeline;
      case 2:
        return answers.disasters.length > 0;
      case 3:
        return answers.helpTypes.length > 0;
      case 4:
        return true; // filter confirmation — always continuable
      case 5:
        return !!answers.homeStatus;
      case 6:
        return answers.household.length > 0;
      case 7:
        return true; // name is optional
      default:
        return false;
    }
  };

  const displayName = answers.name.trim() || 'friend';

  const selectedHelpLabels = answers.helpTypes
    .filter((v) => v !== 'unsure')
    .map((v) => HELP_OPTIONS.find((o) => o.value === v)?.label)
    .filter(Boolean);

  // Step 8: Ending page
  if (step === 8) {
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
          px: 3,
        }}
      >
        <Typography variant='h4' fontWeight={700}>
          Thank you, {displayName}.
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ maxWidth: 360 }}
        >
          We&rsquo;ve put together your first steps.
        </Typography>

        <Button
          variant='contained'
          size='large'
          sx={{ mt: 2, px: 5, py: 1.75 }}
          onClick={handleFinish}
        >
          See my plan
        </Button>
        <Button
          variant='outlined'
          size='large'
          sx={{ px: 5, py: 1.75 }}
          onClick={() => {
            saveAnswers(answers);
            navigate('/create-account');
          }}
        >
          Create an account
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', px: 2, py: 3 }}>
      {/* Progress bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
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
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ minWidth: 36, textAlign: 'right' }}
        >
          {step + 1}/{TOTAL_STEPS}
        </Typography>
      </Box>

      {/* Step 0: Zip code */}
      {step === 0 && (
        <StepWrapper
          question='Where are you located?'
          hint='We use your ZIP code to find disasters and help near you.'
        >
          <TextField
            label='ZIP Code'
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

      {/* Step 1: Timeline */}
      {step === 1 && (
        <StepWrapper
          question='When did the disaster happen?'
          hint='A rough estimate is fine. Some deadlines depend on the date.'
        >
          <RadioGroup
            value={answers.timeline}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, timeline: e.target.value }))
            }
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

      {/* Step 2: Disaster selection */}
      {step === 2 && (
        <StepWrapper
          question='Which disaster affected you?'
          hint={`These disasters were reported in your area, ${answers.zipCode}, during that time. Select all that apply.`}
        >
          <FormGroup>
            {MOCK_DISASTERS.map((d) => (
              <FormControlLabel
                key={d.id}
                control={
                  <Checkbox
                    checked={answers.disasters.includes(d.id)}
                    onChange={() => toggleMulti('disasters', d.id)}
                  />
                }
                label={`${d.title} — ${d.date}`}
                sx={{ mb: 0.5 }}
              />
            ))}
            <FormControlLabel
              control={
                <Checkbox
                  checked={answers.disasters.includes('not_listed')}
                  onChange={() => toggleMulti('disasters', 'not_listed')}
                />
              }
              label="I don't see my event"
              sx={{ mb: 0.5 }}
            />
          </FormGroup>
        </StepWrapper>
      )}

      {/* Step 3: Help types */}
      {step === 3 && (
        <StepWrapper
          question='What do you need help with?'
          hint='Select all that apply. You can always change this later.'
        >
          <FormGroup>
            {HELP_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={answers.helpTypes.includes(opt.value)}
                    onChange={() => toggleMulti('helpTypes', opt.value)}
                  />
                }
                label={opt.label}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </StepWrapper>
      )}

      {/* Step 4: Filter confirmation (placeholder) */}
      {step === 4 && (
        <StepWrapper
          question={
            selectedHelpLabels.length > 0
              ? `You indicated that you needed help with ${formatList(selectedHelpLabels)}.`
              : "You indicated you’re not sure what help you need yet."
          }
          hint='Customizable filters based on your selections will appear here.'
        >
          <Box
            sx={{
              p: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Filter options coming soon
            </Typography>
          </Box>
        </StepWrapper>
      )}

      {/* Step 5: Home status */}
      {step === 5 && (
        <StepWrapper
          question='Which best describes your home?'
          hint='This helps us show the kinds of help that may apply to you.'
        >
          <RadioGroup
            value={answers.homeStatus}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, homeStatus: e.target.value }))
            }
          >
            {HOME_OPTIONS.map((opt) => (
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

      {/* Step 6: Household */}
      {step === 6 && (
        <StepWrapper
          question='Who lives with you?'
          hint='This helps us point you to help that fits everyone in your home. Select all that apply.'
        >
          <FormGroup>
            {HOUSEHOLD_OPTIONS.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={answers.household.includes(opt.value)}
                    onChange={() => toggleMulti('household', opt.value)}
                  />
                }
                label={opt.label}
                sx={{ mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </StepWrapper>
      )}

      {/* Step 7: Name */}
      {step === 7 && (
        <StepWrapper
          question='What would you like us to call you?'
          hint='A first name or nickname is fine. You can skip this.'
        >
          <TextField
            label='Name (optional)'
            value={answers.name}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, name: e.target.value }))
            }
            fullWidth
            autoFocus
          />
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
        {step === TOTAL_STEPS - 2 ? 'Finish' : 'Continue'}
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

function formatList(items: (string | undefined)[]): string {
  const filtered = items.filter(Boolean) as string[];
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return `"${filtered[0]}"`;
  if (filtered.length === 2)
    return `"${filtered[0]}" and "${filtered[1]}"`;
  return `${filtered.slice(0, -1).map((i) => `"${i}"`).join(', ')}, and "${filtered[filtered.length - 1]}"`;

}
