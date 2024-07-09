import React, { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import toast from "react-hot-toast";

type Props = {
    open: any,
    setOpen: any,
    data?: any
}

function SystemdServiceDialog(props: Props) {

    const [serviceName, setServiceName] = useState("");
    const [heartbeatInterval, setHeartbeatInterval] = useState(1800); // Default value, adjust as needed

    useEffect(() => {
        if (!props.open) {
            // Reset form fields when dialog is closed
            setServiceName("");
            setHeartbeatInterval(1800); // Reset to default value
        } else if (props.data) {
            // Populate form fields if in update mode
            setServiceName(props.data.service_name);
            setHeartbeatInterval(props.data.period_sec);
        }
    }, [props.open, props.data]);

    const handleClose = () => {
        props.setOpen(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        const toastId = toast.loading(`Adding new Systemd Monitor for ${formJson.name}`);

        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/service`;
        const method = props.data ? "PUT" : "POST";

        try {
            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    service_name: formJson.name,
                    period_sec: formJson.hbi
                })
            });

            if (response.status === 200) {
                toast.success(`${formJson.name} successfully ${props.data ? 'updated' : 'added'}.`, {
                    id: toastId
                });
            } else {
                toast.error(`Failed to ${props.data ? 'update' : 'add'} ${formJson.name}.`, {
                    id: toastId
                });
            }
        } catch (error) {
            toast.error(`Error occurred while ${props.data ? 'updating' : 'adding'} ${formJson.name}.`, {
                id: toastId
            });
        }

        handleClose();
    };

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit
            }}
        >
            <DialogTitle>{props.data ? 'Update Existing Systemd Service' : 'Monitor New Systemd Service Heartbeat'}</DialogTitle>
            <DialogContent>
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
                    disabled={props.data ? true : false} // Disable if in update mode
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
}

export default SystemdServiceDialog;
