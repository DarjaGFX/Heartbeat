import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ServiceWSResponse } from '@/types';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    services: ServiceWSResponse
}

export default function ServiceOverview(props: Props) {
    const [activeServices, setActiveServices] = useState<number>(0);
    const [inactiveServices, setInactiveServices] = useState<number>(0);
    const [data, setData] = useState<any>({
        labels: [
            'inactive services',
            'active services'
        ],
        datasets: [{
            label: 'Services',
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
        if (props.services) {
            let active = 0;
            for (const server of Object.values(props.services)) {
                for (const service of Object.values(server)) {
                    if (service && service.beats && service.beats.length > 0 && service.beats[service.beats.length - 1].Active === true) {
                        active++;
                    }
                }
            }
            let inactive = 0;
            for (const server of Object.values(props.services)) {
                for (const service of Object.values(server)) {
                    if (service && (!service.beats || service.beats.length === 0 || service.beats[service.beats.length - 1].Active !== true)) {
                        inactive++;
                    }
                }
            }
            setActiveServices(active);
            setInactiveServices(inactive);
        }
        setData({
            labels: [
                'inactive services',
                'active services'
            ],
            datasets: [{
                label: 'Services',
                data: [inactiveServices, activeServices],
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
    }, [props.services]);
    return (
        <div className="flex flex-col align-middle h-fit w-fit">
            <Doughnut data={data} options={config} />
            <span className='mt-4 ml-4'> Service Activity</span>
        </div>
    );
}