import * as React from 'react';
import { ServerWSResponse } from '@/types';
import ServerOverview from './ServerOverview';
import ServiceOverview from './ServiceOverview';
import { Box, Skeleton } from '@mui/material';

type Props = {
    serverws: ServerWSResponse,
    servicews: any
}

export default function Overview(props: Props) {
    const { serverws = undefined, servicews = undefined } = props;
    return (
        <>
            <Box className="w-full flex flex-col items-center justify-items-center justify-evenly lg:flex-row">
                { 
                    serverws == undefined ?
                        <Skeleton width={300} height={300} />
                        :
                        Object.keys(serverws).length > 0 ? 
                            <ServerOverview servers={serverws} />
                            : 
                            'Add Servers to analyze'
                }
                {
                    servicews == undefined ?
                        <Skeleton width={300} height={300} />
                        :
                        Object.keys(servicews).length > 0 ? 
                         <ServiceOverview services={servicews} />
                         :
                         ''
                }
            </Box>
        </>
    );
}