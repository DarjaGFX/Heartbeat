import { ServerConfig } from '@/types';
import { addOrUpdateServer, fetchServer } from '@/utils/api/serverApi';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void,
    data?: Number
}

function ServerDialog(props: Props) {
    const [serverName, setServerName] = useState("");
    const [ip, setIp] = useState("");
    const [port, setPort] = useState(22);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [keyfile, setKeyfile] = useState<File | null>(null);

    const [server, setServer] = useState<ServerConfig | null>(null);

    useEffect(() => {
        if (!props.open) {
            // Reset form fields when dialog is closed
            setServerName("");
            setKeyfile(null); // Reset file input
            setServerName("");
            setIp("");
            setPort(22);
            setUsername("");
            setPassword("");
        } else if (props.data) {
            // fetch server config
            const fetchServerConfig = async () => {
                try {
                    const response = await fetchServer(props.data as number);
                    setServer(response);
                    setServerName(response.name);
                    setIp(response.ip);
                    setPort(response.port);
                    setUsername(response.username);
                } catch (error) {
                    console.error("Error fetching server config:", error);
                    toast.error("Failed to fetch server configuration");
                }
            };
            fetchServerConfig();
        }
    }, [props.open, props.data]);

    const handleClose = () => {
        props.setOpen(false);
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setKeyfile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        // const formData = new FormData(event.currentTarget);
        const formData = new FormData();

        // Append the file manually if it exists
        if (keyfile) {
            formData.append('keyfile', keyfile);
        }
        if (password != ""){
            formData.append('password', password);
        }
        formData.append("name", serverName);
        formData.append("ip", ip);
        formData.append("port", String(port));
        formData.append("username", username);

        const toastId = toast.loading(`Adding new Server`);

        const isUpdate = !!props.data;
        try {
            const id_serv = props.data ? Number(props.data) : null;
            const response = await addOrUpdateServer(formData, isUpdate, id_serv);

            if (response.status === 201 || response.status === 200) {
                toast.success(`${formData.get('name')} successfully ${isUpdate ? 'updated' : 'added'}.`, {
                    id: toastId
                });
                handleClose();
            } else {
                toast.error(`Failed to ${isUpdate ? 'update' : 'add'} ${formData.get('name')}.`, {
                    id: toastId
                });
            }
        } catch (error: unknown) {
            // Extract the error message if available
            const errorMessage = error instanceof Error && 'response' in error
                ? (error.response as any)?.data?.detail || error.message
                : 'An error occurred';
            toast.error(`Error occurred while ${isUpdate ? 'updating' : 'adding'} ${formData.get('name')}: ${errorMessage}`, {
                id: toastId
            });
        }
    };

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            sx={{zIndex: 2000}}
            PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmit
            }}
        >
            <DialogTitle>{props.data ? 'Update Existing Server' : 'Add New Server'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                />
                <TextField
                    required
                    margin="dense"
                    id="ip"
                    name="ip"
                    label="ip"
                    type="text"
                    InputProps={{ inputProps: { min: 1 } }}
                    fullWidth
                    variant="standard"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                />
                <TextField
                    // autoFocus
                    required
                    margin="dense"
                    id="port"
                    name="port"
                    label="port"
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    fullWidth
                    variant="standard"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                />
                <TextField
                    // autoFocus
                    autoComplete='off'
                    required
                    margin="dense"
                    id="username"
                    name="username"
                    label="username"
                    type="text"
                    fullWidth
                    variant="standard"
                    placeholder="root"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    // autoFocus
                    margin="dense"
                    id="password"
                    name="password"
                    label="password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    component="label"
                    id="keyfile"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                >
                    Upload key file
                    <VisuallyHiddenInput
                        type="file"
                        onChange={handleFileChange}
                    />
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='inherit'>Cancel</Button>
                <Button onClick={(e) => handleSubmit(e)} type="submit">{props.data ? 'Update' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ServerDialog;
