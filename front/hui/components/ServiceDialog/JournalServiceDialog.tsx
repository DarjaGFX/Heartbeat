import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import toast from "react-hot-toast";

type Props = {
    open: any,
    setOpen: any,
    data?: any
}

function JournalServiceDialog(props: Props) {

    const [name, setName] = useState("");
    const [desiredResponse, setDesiredResponse] = useState("");
    const [operator, setOperator] = useState("in");
    const [heartbeatInterval, setHeartbeatInterval] = useState(1800);

    useEffect(() => {
        if (!props.open) {
            // Reset form fields when dialog is closed
            setName("");
            setDesiredResponse("");
            setOperator("in");
            setHeartbeatInterval(1800); // Reset to default value
        } else if (props.data) {
            // Populate form fields if in update mode
            setName(props.data.service_name ?? "");
            setDesiredResponse(props.data.desired_response ?? "");
            setOperator(props.data.operator ?? "in");
            setHeartbeatInterval(props.data.period_sec ?? 1800);
        }
    }, [props.open, props.data]);

    const handleClose = () => {
        props.setOpen(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        const toastId = toast.loading(`Adding new Journalctl Report Monitor for ${formJson.name}`);

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
                    desired_response: formJson.desired_response,
                    operator: formJson.operator,
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
            <DialogTitle>{props.data ? 'Update Existing Journalctl Service' : 'Monitor New Journalctl Service Report Heartbeat'}</DialogTitle>
            <DialogContent>
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
                    disabled={props.data ? true : false} // Disable if in update mode
                />
                <TextField
                    autoFocus
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
                    <MenuItem key="in" value="in">
                        in
                    </MenuItem>
                    <MenuItem key="not in" value="not in">
                        not in
                    </MenuItem>
                </TextField>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="hbi"
                    name="hbi"
                    label="HeartBeat Interval (in seconds)"
                    type="number"
                    InputProps={{ inputProps: { min: 1 } }}
                    defaultValue={1800}
                    fullWidth
                    variant="standard"
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(parseInt(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">{props.data ? 'Update' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
}

export default JournalServiceDialog;
