import { Box, Typography } from '../../base-web';

export function Footer() {
  return (
    <Box
      component='footer'
      sx={{ py: 2, px: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
    >
      <Typography variant='body2' color='text.secondary' align='center'>
        Senior Project — Base Application
      </Typography>
    </Box>
  );
}

export default Footer;
