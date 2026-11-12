import { ArrowBack, Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import {
  CreateSituationDocument,
  type CreateSituationMutation,
  type CreateSituationMutationVariables,
  type DisasterOption,
  GeocodeAddressDocument,
  type GeocodeAddressQuery,
  type GeocodeAddressQueryVariables,
  type GeocodeResult,
  GeocodeZipDocument,
  type GeocodeZipQuery,
  type GeocodeZipQueryVariables,
  GetDisastersForLocationDocument,
  type GetDisastersForLocationQuery,
  type GetDisastersForLocationQueryVariables,
  GetSituationsByUserDocument,
  type GetSituationsByUserQuery,
  type GetSituationsByUserQueryVariables,
  UpdateSituationDocument,
  type UpdateSituationMutation,
  type UpdateSituationMutationVariables,
} from '../../generated';
import { apolloClient } from '../../lib/apollo-client';
import {
  deriveQuizStep,
  quizAnswersToInput,
  situationToQuizAnswers,
} from '../../lib/situation-utils';
import { colors } from '../../theme';

const TOTAL_STEPS_LOGGED_IN = 7; // steps 0-6
const TOTAL_STEPS_LOGGED_OUT = 9; // steps 0-6 + name (7) + ending (8)

const TIMELINE_OPTIONS = [
  { value: 'lt6months', label: 'Less than 6 months' },
  { value: '6to12months', label: '6 to 12 months' },
  { value: '1to3years', label: '1 to 3 years' },
  { value: 'gt3years', label: 'More than 3+ years' },
  { value: 'unsure', label: "I'm not sure" },
];

type DisasterChoice = Pick<DisasterOption, 'id' | 'title' | 'incidentBeginDate'>;

const HELP_OPTIONS = [
  {
    value: 'damage_recovery',
    label: 'Damage recovery',
    description: 'Temporary housing, shelter, or help staying in your home',
  },
  {
    value: 'financial_assistance',
    label: 'Financial assistance',
    description: 'Temporary housing, shelter, or help staying in your home',
  },
  {
    value: 'housing_shelter',
    label: 'Housing and shelter',
    description: 'Temporary housing, shelter, or help staying in your home',
  },
  {
    value: 'unsure',
    label: "I'm not sure yet",
  },
];

const HOME_OPTIONS = [
  { value: 'own', label: 'I own my home' },
  { value: 'rent', label: 'I rent my home' },
  {
    value: 'unstable',
    label: "I don't have stable housing right now",
    description: 'For example, staying with family or friends, in a shelter, or in a car',
  },
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

export interface QuizLocation {
  zip?: string | null;
  city?: string | null;
  stateCode?: string | null;
  stateFips?: string | null;
  countyFips?: string | null;
  countyName?: string | null;
  latitude: number;
  longitude: number;
  precision: 'address' | 'zip';
}

export interface RecoveryQuizAnswers {
  zipCode: string;
  location: QuizLocation | null;
  timeline: string;
  disasters: string[];
  helpTypes: string[];
  homeStatus: string;
  household: string[];
  name: string;
}

const EMPTY_ANSWERS: RecoveryQuizAnswers = {
  zipCode: '',
  location: null,
  timeline: '',
  disasters: [],
  helpTypes: [],
  homeStatus: '',
  household: [],
  name: '',
};

const ANON_STORAGE_KEY = 'recovery_quiz_answers';

function loadAnonDraft(): RecoveryQuizAnswers | null {
  try {
    const stored = localStorage.getItem(ANON_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return null;
}

function saveAnonDraft(answers: RecoveryQuizAnswers) {
  try {
    localStorage.setItem(ANON_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* ignore */
  }
}

function clearAnonDraft() {
  try {
    localStorage.removeItem(ANON_STORAGE_KEY);
    localStorage.removeItem('recovery_quiz_complete');
    localStorage.removeItem('recovery_quiz_draft_step');
  } catch {
    /* ignore */
  }
}

async function saveSituationToServer(
  situationId: string | null,
  answers: RecoveryQuizAnswers
): Promise<string | null> {
  const input = quizAnswersToInput(answers);
  if (situationId) {
    await apolloClient.mutate<UpdateSituationMutation, UpdateSituationMutationVariables>({
      mutation: UpdateSituationDocument,
      variables: { id: situationId, input },
    });
    return situationId;
  }
  const { data } = await apolloClient.mutate<
    CreateSituationMutation,
    CreateSituationMutationVariables
  >({
    mutation: CreateSituationDocument,
    variables: { input },
  });
  return data?.createSituation.id ?? null;
}

function toQuizLocation(result: GeocodeResult): QuizLocation {
  return {
    zip: result.zip,
    city: result.city,
    stateCode: result.stateCode,
    stateFips: result.stateFips,
    countyFips: result.countyFips,
    countyName: result.countyName,
    latitude: result.latitude,
    longitude: result.longitude,
    precision: result.precision,
  };
}

const DOT_KEYS = Array.from({ length: TOTAL_STEPS_LOGGED_OUT - 1 }, (_, i) => `step-${i}`);

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {DOT_KEYS.slice(0, total).map((key, i) => (
        <Box
          key={key}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: colors.black,
            width: i === current ? 24 : 8,
            transition: 'width 0.2s ease',
          }}
        />
      ))}
    </Box>
  );
}

function QuizCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: colors.heroGray,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          height: { xs: '14vh', md: '18vh' },
          minHeight: { xs: 100, md: 140 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 2, md: 4 },
        }}
      >
        <Typography
          variant='h6'
          sx={{
            color: colors.black,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Aftermath
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          mt: { xs: -3, md: -4 },
          borderRadius: { xs: '24px 24px 0 0', md: '32px 32px 0 0' },
          bgcolor: 'background.paper',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: { md: 720, lg: 800 },
          mx: 'auto',
          width: '100%',
          boxShadow: { md: '0 -4px 24px rgba(0,0,0,0.08)' },
        }}
      >
        {children}
      </Box>
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
      <Typography
        variant='h5'
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          mb: 1.5,
        }}
      >
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

export default function RecoveryQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RecoveryQuizAnswers>(EMPTY_ANSWERS);
  const [situationId, setSituationId] = useState<string | null>(null);

  // Geocoder state
  const [street, setStreet] = useState('');
  const [resolvedFor, setResolvedFor] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  // FEMA disaster state
  const [disasterOptions, setDisasterOptions] = useState<DisasterChoice[]>([]);
  const [disastersLoading, setDisastersLoading] = useState(false);
  const [disastersFailed, setDisastersFailed] = useState(false);

  const totalSteps = user ? TOTAL_STEPS_LOGGED_IN : TOTAL_STEPS_LOGGED_OUT;
  const isSubmitStep = !!user && step === 6;

  const stateFips = answers.location?.stateFips;
  const countyFips = answers.location?.countyFips;
  const timeline = answers.timeline;

  // Load FEMA disasters for the user's county and timeline
  useEffect(() => {
    if (step !== 2) return;
    if (!stateFips || !countyFips) {
      setDisasterOptions([]);
      setDisastersFailed(true);
      return;
    }
    let cancelled = false;
    setDisastersLoading(true);
    setDisastersFailed(false);
    apolloClient
      .query<GetDisastersForLocationQuery, GetDisastersForLocationQueryVariables>({
        query: GetDisastersForLocationDocument,
        variables: { stateFips, countyFips, timeline },
      })
      .then(({ data }) => {
        if (!cancelled) setDisasterOptions(data?.getDisastersForLocation ?? []);
      })
      .catch((err) => {
        console.error('[RecoveryQuiz] disaster lookup failed:', err);
        if (!cancelled) setDisastersFailed(true);
      })
      .finally(() => {
        if (!cancelled) setDisastersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, stateFips, countyFips, timeline]);

  // Load existing situation or anonymous draft on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      let loaded = false;

      if (user) {
        try {
          const { data } = await apolloClient.query<
            GetSituationsByUserQuery,
            GetSituationsByUserQueryVariables
          >({
            query: GetSituationsByUserDocument,
            variables: { userId: user.id },
            fetchPolicy: 'network-only',
          });
          if (!cancelled && data?.getSituationsByUser.length) {
            const record = data.getSituationsByUser[0];
            const restored = situationToQuizAnswers(record);
            setSituationId(record.id);
            setAnswers(restored);
            setStep(deriveQuizStep(restored, true));
            loaded = true;
          }
        } catch {
          // fall through to anonymous draft
        }
      }

      if (!cancelled && !loaded) {
        const draft = loadAnonDraft();
        if (draft) {
          setAnswers(draft);
          setStep(deriveQuizStep(draft, false));
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Geocode address/ZIP to get county FIPS codes
  const resolveLocation = async (): Promise<boolean> => {
    const zip = answers.zipCode.trim();
    const trimmedStreet = street.trim();
    const key = `${trimmedStreet}|${zip}`;
    if (resolvedFor === key && answers.location) return true;

    setLocating(true);
    setLocationError(null);
    setLocationNote(null);
    try {
      let result: GeocodeResult | null = null;
      if (trimmedStreet) {
        const { data } = await apolloClient.query<
          GeocodeAddressQuery,
          GeocodeAddressQueryVariables
        >({
          query: GeocodeAddressDocument,
          variables: { address: `${trimmedStreet}, ${zip}` },
          fetchPolicy: 'network-only',
        });
        result = data?.geocodeAddress ?? null;
        if (!result) {
          setLocationNote("We couldn't match that street address, so we're using your ZIP code.");
        }
      }
      if (!result) {
        const { data } = await apolloClient.query<GeocodeZipQuery, GeocodeZipQueryVariables>({
          query: GeocodeZipDocument,
          variables: { zip },
        });
        result = data?.geocodeZip ?? null;
      }
      if (!result) {
        setLocationError("We couldn't find that ZIP code. Please check it and try again.");
        return false;
      }

      const location = toQuizLocation(result);
      setAnswers((prev) => ({
        ...prev,
        location,
        disasters: prev.location?.countyFips === location.countyFips ? prev.disasters : [],
      }));
      setResolvedFor(key);
      return true;
    } catch (err) {
      console.error('[RecoveryQuiz] location lookup failed:', err);
      setAnswers((prev) => ({ ...prev, location: null }));
      setResolvedFor(null);
      return true;
    } finally {
      setLocating(false);
    }
  };

  const persistAnswers = async (answersToSave: RecoveryQuizAnswers) => {
    if (user) {
      try {
        const id = await saveSituationToServer(situationId, answersToSave);
        if (id) setSituationId(id);
        clearAnonDraft();
      } catch {
        saveAnonDraft(answersToSave);
      }
    } else {
      saveAnonDraft(answersToSave);
    }
  };

  const handleNext = async () => {
    if (step === 0 && !(await resolveLocation())) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate('/recovery');
  };

  const handleClose = () => {
    void persistAnswers(answers);
    navigate('/');
  };

  const handleFinish = () => {
    void persistAnswers(answers);
    navigate('/dashboard');
  };

  const handleSaveAndExit = () => {
    if (user) {
      void persistAnswers(answers);
      navigate('/');
    } else {
      saveAnonDraft(answers);
      navigate('/create-account');
    }
  };

  const toggleMulti = (field: 'disasters' | 'helpTypes' | 'household', value: string) => {
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
        return answers.zipCode.trim().length === 5 && !locating;
      case 1:
        return !!answers.timeline;
      case 2:
        return answers.disasters.length > 0;
      case 3:
        return answers.helpTypes.length > 0;
      case 4:
        return true;
      case 5:
        return !!answers.homeStatus;
      case 6:
        return answers.household.length > 0;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const displayName = answers.name.trim() || 'friend';

  const selectedHelpLabels = answers.helpTypes
    .filter((v) => v !== 'unsure')
    .map((v) => HELP_OPTIONS.find((o) => o.value === v)?.label)
    .filter(Boolean);

  if (loading) {
    return (
      <QuizCard>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}
        >
          <CircularProgress />
        </Box>
      </QuizCard>
    );
  }

  if (!user && step === 8) {
    return (
      <QuizCard>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            px: 3,
            pt: { xs: 6, md: 8 },
            pb: 6,
          }}
        >
          <Typography variant='h4' fontWeight={700} sx={{ mb: 1.5, textAlign: 'center' }}>
            Thank you, {displayName}. We&rsquo;ve put together your first steps.
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 4, textAlign: 'center', maxWidth: 360 }}
          >
            You can change your answers any time in Profile.
          </Typography>

          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ py: 1.75, maxWidth: 400 }}
            onClick={handleFinish}
          >
            See my plan
          </Button>

          {/* OR divider */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 400,
              my: 2,
            }}
          >
            <Box sx={{ flex: 1, borderBottom: '1px solid', borderColor: 'divider' }} />
            <Typography variant='body2' color='text.secondary' sx={{ px: 2 }}>
              OR
            </Typography>
            <Box sx={{ flex: 1, borderBottom: '1px solid', borderColor: 'divider' }} />
          </Box>

          <Button
            variant='outlined'
            size='large'
            fullWidth
            sx={{ py: 1.75, maxWidth: 400 }}
            onClick={() => {
              saveAnonDraft(answers);
              navigate('/create-account');
            }}
          >
            Create an account
          </Button>
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1, textAlign: 'center' }}>
            Create an account to save your progress.
          </Typography>
        </Box>
      </QuizCard>
    );
  }

  return (
    <QuizCard>
      {/* Navigation bar: back, dots, close */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          pt: { xs: 2.5, md: 3 },
          pb: 1,
        }}
      >
        <IconButton onClick={handleBack} size='small' aria-label='back'>
          <ArrowBack />
        </IconButton>
        <StepDots current={step} total={totalSteps - 1} />
        <IconButton onClick={handleClose} size='small' aria-label='close'>
          <Close />
        </IconButton>
      </Box>

      {/* Question content */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 3, md: 5 },
          pt: { xs: 2, md: 3 },
          pb: 2,
        }}
      >
        {step === 0 && (
          <StepWrapper
            question='Where are you located?'
            hint='We use your location to find disasters and help near you. A street address is optional but more accurate. We never save it.'
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label='Street address (optional)'
                placeholder='123 Main St'
                value={street}
                onChange={(e) => setStreet(e.target.value.slice(0, 150))}
                autoComplete='street-address'
                fullWidth
                autoFocus
              />
              <TextField
                label='ZIP Code'
                placeholder='Ex. 90001'
                value={answers.zipCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setAnswers((prev) => ({ ...prev, zipCode: val }));
                  setLocationError(null);
                }}
                inputProps={{ inputMode: 'numeric', maxLength: 5 }}
                autoComplete='postal-code'
                error={!!locationError}
                helperText={locationError ?? ' '}
                fullWidth
              />
            </Box>
          </StepWrapper>
        )}

        {step === 1 && (
          <StepWrapper
            question='When did the disaster happen?'
            hint='A rough estimate is fine. Some deadlines depend on the date.'
          >
            {locationNote && (
              <Alert severity='info' sx={{ mb: 2 }}>
                {locationNote}
              </Alert>
            )}
            <RadioGroup
              value={answers.timeline}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  timeline: e.target.value,
                  disasters: prev.timeline === e.target.value ? prev.disasters : [],
                }))
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

        {step === 2 && (
          <StepWrapper
            question='Which disaster affected you?'
            hint={disasterHint(answers, disasterOptions, disastersLoading, disastersFailed)}
          >
            <FormGroup>
              {disastersLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={28} aria-label='Loading disasters' />
                </Box>
              )}
              {!disastersLoading &&
                disasterOptions.map((d) => (
                  <FormControlLabel
                    key={d.id}
                    control={
                      <Checkbox
                        checked={answers.disasters.includes(d.id)}
                        onChange={() => toggleMulti('disasters', d.id)}
                      />
                    }
                    label={formatDisasterLabel(d)}
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

        {step === 3 && (
          <StepWrapper
            question='What do you need help with?'
            hint='Select all that apply. You can always change this later in your Profile.'
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
                  label={
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {opt.label}
                      </Typography>
                      {'description' in opt && opt.description && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {opt.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ mb: 1.5, alignItems: 'flex-start', '& .MuiCheckbox-root': { pt: 0.5 } }}
                />
              ))}
            </FormGroup>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper
            question={
              selectedHelpLabels.length > 0
                ? `You indicated that you needed help with ${formatList(selectedHelpLabels)}.`
                : "You indicated you're not sure what help you need yet."
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

        {step === 5 && (
          <StepWrapper
            question='Which best describes your home?'
            hint='This helps us show the kinds of help that may apply to you.'
          >
            <RadioGroup
              value={answers.homeStatus}
              onChange={(e) => setAnswers((prev) => ({ ...prev, homeStatus: e.target.value }))}
            >
              {HOME_OPTIONS.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={
                    'description' in opt && opt.description ? (
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {opt.label}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: '0.85rem' }}
                        >
                          {opt.description}
                        </Typography>
                      </Box>
                    ) : (
                      opt.label
                    )
                  }
                  sx={{
                    mb: 1.5,
                    ...('description' in opt && opt.description
                      ? { alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0.5 } }
                      : {}),
                  }}
                />
              ))}
            </RadioGroup>
          </StepWrapper>
        )}

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

        {!user && step === 7 && (
          <StepWrapper
            question='What would you like us to call you?'
            hint='Sharing your first name or nickname is optional. This helps us tailor the website to you.'
          >
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              Name:
            </Typography>
            <TextField
              placeholder='Enter your name or nickname'
              value={answers.name}
              onChange={(e) => setAnswers((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <Button
              variant='outlined'
              size='large'
              fullWidth
              sx={{ mt: 2, py: 1.5 }}
              onClick={() => {
                setAnswers((prev) => ({ ...prev, name: '' }));
                handleNext();
              }}
            >
              Skip
            </Button>
          </StepWrapper>
        )}
      </Box>

      {/* Bottom buttons */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pb: { xs: 3, md: 4 },
          pt: 1,
        }}
      >
        <Button
          variant='contained'
          size='large'
          fullWidth
          disabled={!canContinue()}
          onClick={isSubmitStep ? handleFinish : handleNext}
          sx={{ py: 1.75, mb: 1.5 }}
        >
          {locating ? (
            <CircularProgress size={24} color='inherit' aria-label='Finding your location' />
          ) : isSubmitStep ? (
            'Submit'
          ) : (
            'Next'
          )}
        </Button>
        <Button
          variant='outlined'
          size='large'
          fullWidth
          onClick={handleSaveAndExit}
          sx={{ py: 1.75 }}
        >
          Save and come back later
        </Button>
      </Box>
    </QuizCard>
  );
}

function formatList(items: (string | undefined)[]): string {
  const filtered = items.filter(Boolean) as string[];
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return `"${filtered[0]}"`;
  if (filtered.length === 2) return `"${filtered[0]}" and "${filtered[1]}"`;
  return `${filtered
    .slice(0, -1)
    .map((i) => `"${i}"`)
    .join(', ')}, and "${filtered[filtered.length - 1]}"`;
}

function placeName(location: QuizLocation | null): string | null {
  if (!location?.countyName) return null;
  return location.stateCode ? `${location.countyName}, ${location.stateCode}` : location.countyName;
}

function disasterHint(
  answers: RecoveryQuizAnswers,
  options: DisasterChoice[],
  loading: boolean,
  failed: boolean
): string {
  const place = placeName(answers.location);
  if (loading) return 'Looking up disasters declared in your area…';
  if (failed || !place) {
    return `We couldn't look up disasters for ${answers.zipCode} right now. Choose "I don't see my event" to keep going.`;
  }
  if (options.length === 0) {
    return `We didn't find federally declared disasters in ${place} during that time. Choose "I don't see my event" to keep going.`;
  }
  return `These federally declared disasters cover ${place} around that time. Select all that apply.`;
}

function toTitleCase(text: string): string {
  return text.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

function formatDisasterLabel(d: DisasterChoice): string {
  const title = toTitleCase(d.title);
  if (!d.incidentBeginDate) return title;
  const date = new Date(d.incidentBeginDate);
  if (Number.isNaN(date.getTime())) return title;
  const when = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `${title} — ${when}`;
}
