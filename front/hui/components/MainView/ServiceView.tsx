import { Box, Card, Typography } from '@mui/material';
import { memo } from 'react';
import ServiceChart from '../Chart/ServiceChart';

interface ServiceBeat {
  service_name: string;
  // Add other service beat properties here
}

interface Props {
  pageState: number;
  serviceBeats?: Record<string, ServiceBeat>;
  theme?: any; // ideally this should be properly typed with MUI theme type
}

const ServiceView = memo(({ pageState, serviceBeats, theme }: Props) => {
  return (
    <div className='flex flex-col'>
      <div className='flex flex-col'>
        {serviceBeats && serviceBeats[pageState] && Object.entries(serviceBeats[pageState]).map(([key, value]) => (
          <Card 
            key={key}
            className='md:flex-row'
            sx={{
              margin: 2,
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'center',
              justifyContent: 'inherit',
              height: 'fit-content',
            }}
          >
            {/* <Box
              sx={{ 
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'max'
              }}
            >
              <Typography
                variant="h4"
                component="div"
                sx={{ 
                  marginLeft: 5,
                  marginRight: 5,
                  flexGrow: 1,
                  justifySelf: 'center',
                  alignSelf: 'center'
                }}
                noWrap
                className='text-center'
                gutterBottom
              >
                {console.log(value)}
                {value.service_name}
              </Typography>
            </Box> */}
            <div className='flex'>
              <ServiceChart serviceName={value.service_name} theme={theme} message={value.beats} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.serviceBeats === nextProps.serviceBeats;
});

export default ServiceView;