// Census Geocoder + OpenFEMA integration
// Every change from the original quiz is marked with a "NEW:" or "CHANGED:" comment
// Search the file for "NEW:" / "CHANGED:" to find them
// created an old_quiz.tsx with liv's original program just in case this one fails.
import { ArrowBack } from '@mui/icons-material';
import {
  // NEW: Alert (address fallback note) and CircularProgress (loading spinners)
  Alert,
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
// CHANGED: added useEffect (loads FEMA disasters on step 3)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// NEW: auth (to know if the user is logged in), generated GraphQL operations,
// the Apollo client, and the save-to-database helper
import { useAuth } from '../../auth/useAuth';
import {
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
} from '../../generated';
import { apolloClient } from '../../lib/apollo-client';
import { saveRecoveryQuiz } from '../../lib/sync-recovery-situation';

const TOTAL_STEPS = 9;

const TIMELINE_OPTIONS = [
  { value: 'lt6months', label: 'Less than 6 months' },
  { value: '6to12months', label: '6 to 12 months' },
  { value: '1to3years', label: '1 to 3 years' },
  { value: 'gt3years', label: 'More than 3 years' },
  { value: 'unsure', label: "I'm not sure" },
];

// CHANGED: MOCK_DISASTERS removed. Disasters now come from OpenFEMA for the user's county
type DisasterChoice = Pick<DisasterOption, 'id' | 'title' | 'incidentBeginDate'>;

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

// NEW: geocoded location saved with the answers
// What we keep from the Census Geocoder. The street address is never stored.
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
  // NEW: county/state from the Census Geocoder (null if the lookup failed)
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
  // NEW
  location: null,
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

// NEW: converts a geocoder result into what we store
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

export default function RecoveryQuiz() {
  const navigate = useNavigate();
  // NEW: logged-in users save to their account, guests to a guest record
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RecoveryQuizAnswers>(EMPTY_ANSWERS);

  // NEW: state for the location lookup, the disaster list, and saving
  // Street stays in component state only: it is sent to the geocoder, never saved
  const [street, setStreet] = useState('');
  const [resolvedFor, setResolvedFor] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  const [disasterOptions, setDisasterOptions] = useState<DisasterChoice[]>([]);
  const [disastersLoading, setDisastersLoading] = useState(false);
  const [disastersFailed, setDisastersFailed] = useState(false);

  const [saving, setSaving] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  // NEW: everything from here down to handleNext
  const stateFips = answers.location?.stateFips;
  const countyFips = answers.location?.countyFips;
  const timeline = answers.timeline;

  // Step 2: load FEMA disasters for the user's county and timeline
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

  // Step 0: address (optional) + ZIP -> county via the Census Geocoder.
  // Returns true when the quiz can move on.
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
        // previously picked disasters belong to the old county
        disasters: prev.location?.countyFips === location.countyFips ? prev.disasters : [],
      }));
      setResolvedFor(key);
      return true;
    } catch (err) {
      // Location service down: let people keep going instead of getting stuck
      console.error('[RecoveryQuiz] location lookup failed:', err);
      setAnswers((prev) => ({ ...prev, location: null }));
      setResolvedFor(null);
      return true;
    } finally {
      setLocating(false);
    }
  };

  // CHANGED: now async. On step 1 it looks up the location before moving on
  const handleNext = async () => {
    if (step === 0 && !(await resolveLocation())) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate('/');
  };

  // CHANGED: replaces handleFinish. Also saves to the database, and is used by both end buttons
  // Saves locally first (works offline), then to the database
  const finishTo = async (path: string) => {
    saveAnswers(answers);
    setSaving(true);
    try {
      await saveRecoveryQuiz(answers, user?.id);
    } catch (err) {
      // localStorage still has the answers; login/sign-up sync retries for accounts
      console.error('[RecoveryQuiz] saving to the database failed:', err);
    } finally {
      setSaving(false);
    }
    navigate(path);
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
        // CHANGED: also wait while the location lookup is running
        return answers.zipCode.trim().length === 5 && !locating;
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
        <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 360 }}>
          We&rsquo;ve put together your first steps.
        </Typography>

        <Button
          variant='contained'
          size='large'
          sx={{ mt: 2, px: 5, py: 1.75 }}
          // CHANGED: saves to the database before going to the dashboard
          disabled={saving}
          onClick={() => finishTo('/dashboard')}
        >
          {/* CHANGED: spinner while saving */}
          {saving ? <CircularProgress size={24} color='inherit' /> : 'See my plan'}
        </Button>
        <Button
          variant='outlined'
          size='large'
          sx={{ px: 5, py: 1.75 }}
          // CHANGED: saves to the database (as a guest) before going to sign-up
          disabled={saving}
          onClick={() => finishTo('/create-account')}
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
          // CHANGED: hint mentions the optional street address
          hint='We use your location to find disasters and help near you. A street address is optional but more accurate. We never save it.'
        >
          {/* CHANGED: optional street address field added above the ZIP field. The street is
              only sent to the Census Geocoder and is never saved */}
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
              value={answers.zipCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                setAnswers((prev) => ({ ...prev, zipCode: val }));
                setLocationError(null);
              }}
              inputProps={{ inputMode: 'numeric', maxLength: 5 }}
              // CHANGED: clears the error when typing, and shows "ZIP not found" errors
              autoComplete='postal-code'
              error={!!locationError}
              helperText={locationError ?? ' '}
              fullWidth
            />
          </Box>
        </StepWrapper>
      )}

      {/* Step 1: Timeline */}
      {step === 1 && (
        <StepWrapper
          question='When did the disaster happen?'
          hint='A rough estimate is fine. Some deadlines depend on the date.'
        >
          {/* NEW: shown when the street address didn't match and we used the ZIP instead */}
          {locationNote && (
            <Alert severity='info' sx={{ mb: 2 }}>
              {locationNote}
            </Alert>
          )}
          <RadioGroup
            value={answers.timeline}
            // CHANGED: changing the timeline clears disasters picked for the old timeline
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

      {/* Step 2: Disaster selection */}
      {step === 2 && (
        <StepWrapper
          question='Which disaster affected you?'
          // CHANGED: hint names the county and handles loading / no results / errors
          hint={disasterHint(answers, disasterOptions, disastersLoading, disastersFailed)}
        >
          <FormGroup>
            {/* CHANGED: real FEMA disasters (with a loading spinner) instead of MOCK_DISASTERS */}
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
              : 'You indicated you’re not sure what help you need yet.'
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
            onChange={(e) => setAnswers((prev) => ({ ...prev, homeStatus: e.target.value }))}
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
            onChange={(e) => setAnswers((prev) => ({ ...prev, name: e.target.value }))}
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
        {/* CHANGED: spinner while the location lookup runs */}
        {locating ? (
          <CircularProgress size={24} color='inherit' aria-label='Finding your location' />
        ) : step === TOTAL_STEPS - 2 ? (
          'Finish'
        ) : (
          'Continue'
        )}
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
  if (filtered.length === 2) return `"${filtered[0]}" and "${filtered[1]}"`;
  return `${filtered
    .slice(0, -1)
    .map((i) => `"${i}"`)
    .join(', ')}, and "${filtered[filtered.length - 1]}"`;
}

// NEW: helpers for the disaster step (everything below this line is new)
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

// FEMA titles are all caps ("SEVERE STORMS AND FLOODING")
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
