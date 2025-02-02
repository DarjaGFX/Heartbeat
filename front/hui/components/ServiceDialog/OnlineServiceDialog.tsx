import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { fetchServers } from '@/utils/api/serverApi'; // Import the fetchServers function
import { addOrUpdateOnlineService, getServiceById } from '@/utils/api/serviceApi'; // Import the API function for adding/updating online services

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    data?: number;
};

type ServerListRes = {
    id_server: number;
    name: string;
};

function OnlineServiceDialog(props: Props) {
    const [selectedServer, setSelectedServer] = useState<number | ''>('');
    const [servers, setServers] = useState<ServerListRes[]>([]);
    const [name, setName] = useState("");
    const [method, setMethod] = useState<"GET" | "POST">("GET");
    const [url, setUrl] = useState("");
    const [desiredResponse, setDesiredResponse] = useState("");
    const [operator, setOperator] = useState<"==" | "!=" | "in" | "not in">("==");
    const [target, setTarget] = useState<"content" | "status_code">("status_code");
    const [data, setData] = useState("");
    const [heartbeatInterval, setHeartbeatInterval] = useState<number>(1800);
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [hasMoreServers, setHasMoreServers] = useState<boolean>(true); // Track if more servers are available

    useEffect(() => {
        if (props.open) {
            loadServers();
            if (props.data) {
                // Populate form fields if in update mode
                const fetchData = async () => {
                    try {
                        const response = await getServiceById(props.data);
                        setName(response.service_name ?? "");
                        setMethod(response.config.method ?? "GET");
                        setUrl(response.config.url ?? "");
                        setDesiredResponse(response.config.desired_response ?? "");
                        setOperator(response.config.operator ?? "==");
                        setTarget(response.config.target ?? "status_code");
                        setData(response.config.data ?? "");
                        setHeartbeatInterval(response.config.interval ?? 1800);
                        setSelectedServer(response.id_server ?? '');
                    } catch (error) {
                        toast.error('Failed to load service data');
                    }
                };

                fetchData();
            }
        } else {
            // Reset form fields when dialog is closed
            setName("");
            setMethod("GET");
            setUrl("");
            setDesiredResponse("");
            setOperator("==");
            setTarget("status_code");
            setData("");
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

    const handleServerChange = (event: SelectChangeEvent<number | ''>) => {
        setSelectedServer(event.target.value as number);
    };

    const handleClose = () => {
        props.setOpen(false);
        setOffset(0);
        setServers([]);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const toastId = toast.loading(`Saving Online Service Monitor`);

        const isUpdate = !!props.data;
        const serviceData = {
            service: {
                id_server: selectedServer as number,
                service_name: name
            },
            config: {
                interval: heartbeatInterval,
                method: method,
                url: url,
                desired_response: desiredResponse,
                operator: operator,
                target: target,
                data: data === "" ? {} : data
            }
        };

        try {
            const response = await addOrUpdateOnlineService(serviceData, props.data);

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
            <DialogTitle>{props.data ? 'Update Existing Online Service' : 'Monitor New Online Service'}</DialogTitle>
            <DialogContent>
                <InputLabel id="server-select-label">Server</InputLabel>
                <Select
                    labelId="server-select-label"
                    id="server-select"
                    value={selectedServer}
                    onChange={handleServerChange}
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
                    label="Online Service Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // disabled={!!props.data}
                />
                <TextField
                    id="method"
                    select
                    label="Method"
                    name="method"
                    helperText="Please select request method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="GET" value="GET">GET</MenuItem>
                    <MenuItem key="POST" value="POST">POST</MenuItem>
                    {/* <MenuItem key="put" value="put">put</MenuItem> */}
                </TextField>
                <TextField
                    required
                    margin="dense"
                    id="url"
                    name="url"
                    label="URL"
                    type="url"
                    fullWidth
                    variant="standard"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
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
                    helperText="Please select match operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="==" value="==">==</MenuItem>
                    <MenuItem key="!=" value="!=">!=</MenuItem>
                    <MenuItem key="in" value="in">in</MenuItem>
                    <MenuItem key="not in" value="not in">not in</MenuItem>
                </TextField>
                <TextField
                    id="target"
                    select
                    label="Target"
                    name="target"
                    helperText="Please select matching target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="status_code" value="status_code">status_code</MenuItem>
                    <MenuItem key="content" value="content">content</MenuItem>
                </TextField>
                <TextField
                    margin="dense"
                    id="data"
                    name="data"
                    label="Response Data"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />
                <TextField
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
}

export default OnlineServiceDialog;
