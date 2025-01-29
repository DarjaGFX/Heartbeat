import { ServerWSResponse, ServiceWSResponse } from '@/types'
import React, { useEffect, useState } from 'react'
import ServerStats from './ServerStats'
import { Box, Card, Typography } from '@mui/material'
import ServiceChart from '../Chart/ServiceChart'

type Props = {
    server_id: number,
    serverBeats: ServerWSResponse,
    serviceBeats?: ServiceWSResponse,
    theme?: any
}

function ServerView(props: Props) {
  return (
    <div className='flex flex-col items-center content-center justify-center'>
      <Card 
          className=' xl:flex-row'
          sx= {{
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            justifyContent: 'inherit',
            height: 'fit-content',
            width: 'fit-content',
          }}
        >
        <Box
          className="md:mt-0 md:border-r-2 md:border-b-0"
          sx={{ 
            marginTop: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'max'
          }}>
          
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
              // color={props.theme.palette.text.secondary}
              noWrap
              className='text-center'
              gutterBottom
            >
              Server Stats
            </Typography>
          
        </Box>
        <div className='flex'>
          <ServerStats theme={props.theme} status={Object.entries(props.serverBeats).find(x => Number(x[0])==props.server_id)[1]} /> 
        </div>
      </Card>
      <div className='flex flex-col' >
        {props.serviceBeats && Object.entries(props.serviceBeats)
          .filter(x => Number(x[0]) == props.server_id)
          .map((servs: any) => servs[1].map((s: any) => (
            <ServiceChart 
              key={`${s.id_service}-${s.service_type}`}
              service_type={s.service_type}
              id_service={s.id_service}
              serviceName={s.service_name}
              message={s.beats}
              theme={props.theme}
            />
          ))
          )
        }
      </div>
    </div>
  )
}

export default ServerView