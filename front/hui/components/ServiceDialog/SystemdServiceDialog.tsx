import { fetchServers } from '@/utils/api/serverApi';
import { addOrUpdateSystemdService } from '@/utils/api/serviceApi';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void,
    data?: any
};

type ServerListRes = {
    id_server: number,
    name: string
};

const SystemdServiceDialog: React.FC<Props> = (props) => {
    const [selectedServer, setSelectedServer] = useState<number | ''>('');
    const [servers, setServers] = useState<ServerListRes[]>([]);
    const [serviceName, setServiceName] = useState("");
    const [heartbeatInterval, setHeartbeatInterval] = useState<number>(1800);
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [hasMoreServers, setHasMoreServers] = useState<boolean>(true); // Track if more servers are available

    useEffect(() => {
        if (props.open) {
            loadServers();
            if (props.data) {
                // Populate form fields if in update mode
                setServiceName(props.data.service_name);
                setHeartbeatInterval(props.data.period_sec);
                setSelectedServer(props.data.server_id);
            }
        } else {
            // Reset form fields when dialog is closed
            setServiceName("");
            setHeartbeatInterval(1800);
            setSelectedServer('');
        }
    }, [props.open, props.data]);

    const loadServers = async () => {
        try {
            const data = await fetchServers(offset, limit);
            setServers(prev => [...prev, ...data]);
            setHasMoreServers(data.length === limit); // Check if more servers are available
        } catch (error) {
            toast.error('Failed to load servers');
        }
    };

    const handleChange = (event: SelectChangeEvent<number | ''>) => {
        setSelectedServer(event.target.value as number);
    };

    const handleClose = () => {
        props.setOpen(false);
        setOffset(0);
        setServers([]);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const toastId = toast.loading(`Saving Systemd Service`);

        const isUpdate = !!props.data;
        const serviceData = {
            service: {
                id_server: selectedServer as number,
                service_name: serviceName
            },
            config: {
                interval: heartbeatInterval
            }
        };

        try {
            const response = await addOrUpdateSystemdService(serviceData, isUpdate);

            if (response.status === 200 || response.status === 201) {
                toast.success(`${serviceName} successfully ${isUpdate ? 'updated' : 'added'}.`, {
                    id: toastId
                });
                handleClose();
            } else {
                toast.error(`Failed to ${isUpdate ? 'update' : 'add'} ${serviceName}.`, {
                    id: toastId
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'An error occurred';
            toast.error(`Error occurred while ${isUpdate ? 'updating' : 'adding'} ${serviceName}: ${errorMessage}`, {
                id: toastId
            });
        }
    };

    // Optionally handle scrolling to load more servers
    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const bottom = event.currentTarget.scrollHeight === event.currentTarget.scrollTop + event.currentTarget.clientHeight;
        if (bottom && hasMoreServers) {
            setOffset(prev => prev + limit);
            loadServers();
        }
    };

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit,
                onScroll: handleScroll // Handle scroll if you want infinite scrolling
            }}
        >
            <DialogTitle>{props.data ? 'Update Existing Systemd Service' : 'Monitor New Systemd Service Heartbeat'}</DialogTitle>
            <DialogContent>
                <InputLabel id="server-select-label">Server</InputLabel>
                <Select
                    labelId="server-select-label"
                    id="server-select"
                    value={selectedServer}
                    onChange={handleChange}
                    
                    label="Server"
                    fullWidth
                    variant="standard"
                    required
                >
                    {servers.map(server => (
                        <MenuItem key={server.id_server} value={server.id_server}>
                            {server.name}
                        </MenuItem>
                    ))}
                </Select>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="Systemd Service Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    disabled={!!props.data}
                />
                <TextField
                    required
                    margin="dense"
                    id="hbi"
                    name="hbi"
                    label="HeartBeat Interval (in seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(parseInt(e.target.value))}
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">{props.data ? 'Update' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SystemdServiceDialog;
