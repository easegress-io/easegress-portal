
import React from 'react';
import { Box, Typography } from '@mui/material';

type BlankPageProps = {
  title?: string
  description?: string
};

export default function BlankPage({ title, description }: BlankPageProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '4px',
        transform: 'translateY(-10%)',
      }}
    >
      {title &&
        <Typography variant="body1" color={'rgba(0, 0, 0, 0.85)'} fontSize={'20px'} marginBottom={'8px'}>
          {title}
        </Typography>
      }
      {description &&
        <Typography variant="body1" color="rgba(0, 0, 0, 0.45)" fontSize={'20px'} >
          {description}
        </Typography>
      }
    </Box>
  );
};
