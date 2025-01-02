import { DrawerServerItem, ServerWSResponse } from '@/types'
import React, { useEffect } from 'react'
import Guage from './Guage'
import { title } from 'process'
import ServerStats from './ServerStats'
import { Box, Card, Typography } from '@mui/material'

type Props = {
    pageState: number,
    serverBeats?: ServerWSResponse,
    serverList?: DrawerServerItem[],
    // serviceBeats?: any,
    theme?: any
}

function ServerView(props: Props) {
 
  return (
    <div className='flex flex-col'>
      {/* <div className='flex justify-between h-32 w-auto '> */}
      <Card 
          className='md:flex-row'
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
          
            { props.pageState > 0 ? <Typography
                variant="h4"
                component="div"
                sx={{ 
                  marginLeft: 5,
                  marginRight: 5,
                  flexGrow: 1,
                  justifySelf: 'center',
                  alignSelf: 'center'
                }}
                color={props.theme.palette.text.secondary}
                noWrap
                className='text-center'
                gutterBottom
              >
                {Object.entries(props.serverList).find(x => Number(x[1].id_server)==props.pageState)[1].name} 
              </Typography> : ""
            }
          
        </Box>
        <div className='flex'>
          {props.serverList?.length > 0 ? props.pageState > 0 ? <ServerStats theme={props.theme} status={Object.entries(props.serverBeats).find(x => Number(x[0])==props.pageState)[1]} /> : "NO SERVER SELECTED" : "ADD SERVERS TO SEE REPORTS"}
        </div>
      </Card>
      <div className='flex flex-col'>
        {/* { props.serviceBeats ? Object.entries(props.serviceBeats).map(([key, value]) => {}) : "" } */}
        {/* { props.serviceBeats ? console.log("server beats:", props.serviceBeats[props.pageState]) : "" } */}
      </div>
    </div>
  )
}

export default ServerView