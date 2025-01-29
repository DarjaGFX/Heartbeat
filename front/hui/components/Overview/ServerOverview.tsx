import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ServerWSResponse } from '@/types';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    servers: ServerWSResponse
}

export default function ServerOverview(props: Props) {
    const [activeServers, setActiveServers] = useState<number>(0);
    const [inactiveServers, setInactiveServers] = useState<number>(0);
    const [data, setData] = useState<any>({
        labels: [
            'inactive servers',
            'active servers'
        ],
        datasets: [{
            label: 'Servers',
            data: [5, 1],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)'
            ],
            hoverOffset: 4
        }]
    });
    const [config, setConfig] = useState<any>();
    useEffect(() => {
        if (props.servers) {
            const active = Object.values(props.servers).filter(server => server.active == true).length;
            const inactive = Object.values(props.servers).filter(server => server.active != true).length;
            setActiveServers(active);
            setInactiveServers(inactive);
        }
        setData({
            labels: [
                'inactive servers',
                'active servers'
            ],
            datasets: [{
                label: 'Servers',
                data: [inactiveServers, activeServers],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)'
                ],
                hoverOffset: 4
            }]
        });
        setConfig({
            type: 'doughnut',
            data: data,
        });
    }, [props.servers]);


    return (
        <div className="flex flex-col align-middle h-fit w-fit">
            <Doughnut data={data} options={config}/>
            
            <span className='mt-4 ml-4'> Server Activity</span>

        </div>
    );
}