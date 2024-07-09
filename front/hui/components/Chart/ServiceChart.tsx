import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale, 
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { ServiceData } from '@/types';
import 'chartjs-adapter-date-fns'; // Import date-fns adapter for Chart.js
import CloseIcon from '@mui/icons-material/Close';
import { Line } from 'react-chartjs-2';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Theme, Typography } from '@mui/material';
import MuiTooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';
import { Colors } from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale, 
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Colors
)

interface ServiceChartProps {
  serviceName: string;
  message: ServiceData[];
  theme: Theme
}

const ServiceChart: React.FC<ServiceChartProps> = ({ serviceName, message , theme}) => {
    const [chartData, setChartData] = useState<any>({
        labels: [],
        datasets: []
    })

    const [scaleState, setScaleState] = useState<any>({
        y: {
            type: 'category',
            labels: ['ON', 'OFF'],
            offset: true,
            position: 'left',
            stack: 'demo',
            stackWeight: 1,
            border: {
                color: 'rgb(75, 192, 170)',
            },
        }
    });

    useEffect(() => {
        let data: (string | number)[] = message.map(data => data.Active ? 'ON' : 'OFF');
        let dataset = [
            {
                label: `Active Status`,
                data,
                borderColor: 'rgb(75, 192, 170)',
                backgroundColor: 'rgb(75, 192, 170)',
                stepped: true,
                yAxisID: 'y',
            }
        ];
        
        if (message.some(x => Object.keys(x).includes("latency"))){
            data = message.map((item) => (Object.keys(item).includes("latency") ? item.latency ?? 0 : 0))
            dataset.push({
                label: "latency",
                data: data,
                borderColor: "red",
                backgroundColor: "red",
                stepped: false,
                yAxisID: "y2"
            });
            setScaleState(
                {
                    y: {
                        type: 'category',
                        labels: ['ON', 'OFF'],
                        offset: true,
                        position: 'left',
                        stack: 'demo',
                        stackWeight: 1,
                        border: {
                            color: 'rgb(75, 192, 170)',
                        }
                    },
                    y2: {
                        type: 'linear',
                        position: 'left',
                        stack: 'demo',
                        stackWeight: 2,
                        border: {
                        color: "red"
                        }
                    }
                }
            );
        }
        if (message.length > 0){
            let data = {
                labels: message.map(data => {
                    const ts = new Date(data.timestamp * 1000).toISOString().slice(0, 19);
                    const dt = ts.split('T')
                    return `${dt[0].slice(5,).replace('-', '/')} ${dt[1]}`
                }),
                datasets: dataset,
            }

            setChartData(data)
        }
    }, [serviceName, message]);

    //

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    function removeService(){
        // add loading and notify the result
        const tst = toast.loading(`removing ${serviceName}...`)
        try{
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/service/`+serviceName,{
                method: 'DELETE',
                headers: {
                    "accept": "application/json"
                }
            }).then((response) => {
                if (response.status == 202){
                    toast.success(`${serviceName} service successfully removed`, {
                        id: tst
                    });
                    setOpen(false);
                    // document.getElementById(serviceName)?.remove()
                }
                else{
                    toast.error(`removing ${serviceName} failed!`, {
                        id: tst
                    })
                }
            });
        }catch{
            toast.error(`removing ${serviceName} failed!`, {
                id: tst
            })
        }
    }

    const mainStyle = "border-t-2 mt-4 m-2 sm:ml-10 sm:mr-16 lg:mr-60 w-auto h-auto"
  return (
    <div id={serviceName} className={theme.palette.mode == 'dark' ? "hover:shadow-md  hover:shadow-gray-800 " + mainStyle : "hover:shadow-2xl  hover:shadow-gray-300 " + mainStyle} >
        <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
                mr: 2,
                display: { md: 'flow'},
                fontFamily:  `sans-serif`,
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: `${theme.palette.mode == 'dark' ? "white":"black"}`,
                textDecoration: 'none',
            }}
        >
            {serviceName}
        </Typography>
        <Line
            style={{  width: '800px' }}
            data={chartData}
            options={
                {
                    scales: scaleState, 
                    color: `${theme.palette.mode == 'dark' ? "white":"black"}`,
                }
            }
        />
    </div>
  );
};

export default ServiceChart;
