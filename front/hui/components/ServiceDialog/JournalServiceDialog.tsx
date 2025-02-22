import { fetchServers } from '@/utils/api/serverApi';
import { addOrUpdateJournalService, getServiceById } from '@/utils/api/serviceApi'; // Import the API function for adding/updating journal services
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    data?: number;
};

type ServerListRes = {
    id_server: number;
    name: string;
};

const JournalServiceDialog: React.FC<Props> = (props) => {
    const [selectedServer, setSelectedServer] = useState<number | ''>('');
    const [servers, setServers] = useState<ServerListRes[]>([]);
    const [name, setName] = useState("");
    const [desiredResponse, setDesiredResponse] = useState("");
    const [operator, setOperator] = useState< "in" | "not in">("in");
    const [heartbeatInterval, setHeartbeatInterval] = useState<number>(1800);
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [hasMoreServers, setHasMoreServers] = useState<boolean>(true);

    useEffect(() => {
        if (props.open) {
            loadServers();
            if (props.data) {
                // Populate form fields if in update mode
                const loadServiceData = async () => {
                    try {
                        const response = await getServiceById(props.data);
                        const serviceData = response.data;
                        setName(serviceData.service_name ?? "");
                        setDesiredResponse(serviceData.config.desired_response ?? "");
                        setOperator(serviceData.config.operator ?? "in");
                        setHeartbeatInterval(serviceData.config.interval ?? 1800);
                        setSelectedServer(serviceData.id_server ?? ''); // Set selected server
                    } catch (error) {
                        toast.error('Failed to load service data');
                    }
                };

                loadServiceData();
            }
        } else {
            // Reset form fields when dialog is closed
            setName("");
            setDesiredResponse("");
            setOperator("in");
            setHeartbeatInterval(1800);
            setSelectedServer('');
        }
    }, [props.open, props.data]);

    const loadServers = async () => {
        try {
            const data = await fetchServers(offset, limit);
            setServers(prev => [...prev, ...data]);
            setHasMoreServers(data.length === limit);
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

        const toastId = toast.loading(`Saving Journalctl Service`);

        const isUpdate = !!props.data;
        const serviceData = {
            service: {
                id_server: selectedServer as number,
                service_name: name
            },
            config: {
                interval: heartbeatInterval,
                desired_response: desiredResponse,
                operator: operator,
            }
        };

        try {
            const response = await addOrUpdateJournalService(serviceData, props.data);

            if (response.status === 200 || response.status === 201) {
                toast.success(`${name} successfully ${isUpdate ? 'updated' : 'added'}.`, {
                    id: toastId
                });
                handleClose();
            } else {
                toast.error(`Failed to ${isUpdate ? 'update' : 'add'} ${name}.`, {
                    id: toastId
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'An error occurred';
            toast.error(`Error occurred while ${isUpdate ? 'updating' : 'adding'} ${name}: ${errorMessage}`, {
                id: toastId
            });
        }
    };

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
                onScroll: handleScroll // Handle scroll for infinite scrolling
            }}
        >
            <DialogTitle>{props.data ? 'Update Existing Journalctl Service' : 'Monitor New Journalctl Service Report Heartbeat'}</DialogTitle>
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
                    label="Journalctl Service Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // disabled={!!props.data} // Disable if in update mode
                />
                <TextField
                    required
                    margin="dense"
                    id="desired_response"
                    name="desired_response"
                    label="Desired Response"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={desiredResponse}
                    onChange={(e) => setDesiredResponse(e.target.value)}
                />
                <TextField
                    id="operator"
                    select
                    label="Operator"
                    name="operator"
                    defaultValue="in"
                    helperText="Please select match operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="in" value="in">in</MenuItem>
                    <MenuItem key="not in" value="not in">not in</MenuItem>
                </TextField>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="hbi"
                    name="hbi"
                    label="HeartBeat Interval (in seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 10 } }}
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(parseInt(e.target.value))}
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='inherit'>Cancel</Button>
                <Button type="submit">{props.data ? 'Update' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default JournalServiceDialog;
