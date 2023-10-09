
import React from 'react';
import { Box, Typography } from '@mui/material';

type BlankPageProps = {
  title?: string
  description?: string
};

export default function BlankPage({ title, description }: BlankPageProps) {
  return (
    <Box m={1}>
      {title && <Typography variant="h4">{title}</Typography>}
      {description && <Typography variant="body1">{description}</Typography>}
    </Box>
  );
};
