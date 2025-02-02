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
import EditIcon from '@mui/icons-material/Edit';
import { Line } from 'react-chartjs-2';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Theme, Typography } from '@mui/material';
import MuiTooltip from '@mui/material/Tooltip';
import toast from 'react-hot-toast';
import { Colors } from 'chart.js';
import AddSystemdServiceDialog from '@/components/ServiceDialog/SystemdServiceDialog';
import AddJournalServiceDialog from '@/components/ServiceDialog/JournalServiceDialog';
import AddOnlineServiceDialog from '@/components/ServiceDialog/OnlineServiceDialog';


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
  id_service: number;
  serviceName: string;
  service_type: string;
  message: ServiceData[];
  theme?: Theme
}

function ServiceChart(props: ServiceChartProps){

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
        let data: (string | number)[] = props.message.map(data => data?.Active ? 'ON' : 'OFF');
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
        
        if (props.message.some(x => Object.keys(x).includes("latency"))){
            data = props.message.map((item) => (Object.keys(item).includes("latency") ? item.latency ?? 0 : 0))
            if (!data.every(item => item === 0)) {
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
        }
        if (props.message.length > 0){
            let data = {
                labels: props.message.map(data => {
                    const ts = new Date(data.timestamp * 1000).toISOString().slice(0, 19);
                    const dt = ts.split('T')
                    return `${dt[0].slice(5,).replace('-', '/')} ${dt[1]}`
                }),
                datasets: dataset,
            }

            setChartData(data)
        }
    }, [props.serviceName, props.message]);

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
        const tst = toast.loading(`removing ${props.serviceName}...`)
        try{
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/service/`+props.id_service,{
                method: 'DELETE',
                headers: {
                    "accept": "application/json"
                }
            }).then((response) => {
                if (response.status == 202){
                    toast.success(`${props.serviceName} service successfully removed`, {
                        id: tst
                    });
                    setOpen(false);
                    // document.getElementById(props.serviceName)?.remove()
                }
                else{
                    toast.error(`removing ${props.serviceName} failed!`, {
                        id: tst
                    })
                }
            });
        }catch{
            toast.error(`removing ${props.serviceName} failed!`, {
                id: tst
            })
        }
    }
    //
    const [systemdDialogOpen, setSystemdDialogOpen] = useState(false);
    const [journalDialogOpen, setJournalDialogOpen] = useState(false);
    const [onlineDialogOpen, setOnlineDialogOpen] = useState(false);

    function handleEdit(){
        switch (props.service_type) {
            case "SystemdServiceStatus":
                setSystemdDialogOpen(true);        
                break;
            case "Journalctl":
                setJournalDialogOpen(true);
                break;
            case "OnlineService":
                setOnlineDialogOpen(true);
                break;
            default:
                break;
        }
    }

  return (
    <div id={props.serviceName} className="flex flex-col items-center content-center justify-center mt-4 m-2 sm:m-10 w-screen h-auto max-w-4xl max-h-fit" >
        <div className='flex flex-row w-full justify-around'>
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
                    // color: (props) => props.theme?.palette?.mode === 'dark' ? '#fff' : '#000',
                    textDecoration: 'none',
                }}
            >
                {props.serviceName}
            </Typography>
            <div className='flex flex-row'>
                <IconButton   onClick={handleEdit} aria-label="edit" size="small">
                    <EditIcon fontSize="inherit" />
                </IconButton>
                <IconButton onClick={handleClickOpen} aria-label="delete" size="small">
                    <CloseIcon fontSize="inherit" />
                </IconButton>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Remove Service"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to remove the service {props.serviceName}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={removeService} color="error" autoFocus>
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
        <Line
            style={{ width: '100%', maxWidth: '800px' }}
            data={chartData}
            options={
                {
                    scales: scaleState, 
                    // color: `${props.theme?.palette?.mode === 'dark' ? '#fff' : '#000'}`,
                }
            }
        />
        <AddSystemdServiceDialog open={systemdDialogOpen} setOpen={setSystemdDialogOpen} data={props.id_service}/>
        <AddJournalServiceDialog open={journalDialogOpen} setOpen={setJournalDialogOpen} data={props.id_service}/>
        <AddOnlineServiceDialog open={onlineDialogOpen} setOpen={setOnlineDialogOpen} data={props.id_service}/>
    </div>
  );
};

export default ServiceChart;
