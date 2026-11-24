import { Box, CircularProgress, Typography } from '../../base-web';

interface LoadingProps {
  text?: string;
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color='text.secondary'>{text}</Typography>
    </Box>
  );
}

export default Loading;
