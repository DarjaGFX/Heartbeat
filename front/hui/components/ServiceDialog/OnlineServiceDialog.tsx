import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import toast from "react-hot-toast";

type Props = {
    open: any,
    setOpen: any,
    data?: any
}

function OnlineServiceDialog(props: Props) {

    const [name, setName] = useState("");
    const [method, setMethod] = useState("get");
    const [url, setUrl] = useState("");
    const [desiredResponse, setDesiredResponse] = useState("");
    const [operator, setOperator] = useState("==");
    const [target, setTarget] = useState("status_code");
    const [data, setData] = useState("");
    const [heartbeatInterval, setHeartbeatInterval] = useState(1800);

    useEffect(() => {
        if (!props.open) {
            // Reset form fields when dialog is closed
            setName("");
            setMethod("get");
            setUrl("");
            setDesiredResponse("");
            setOperator("==");
            setTarget("status_code");
            setData("");
            setHeartbeatInterval(1800); // Reset to default value
        } else if (props.data) {
            // Populate form fields if in update mode
            setName(props.data.service_name ?? "");
            setMethod(props.data.method ?? "get");
            setUrl(props.data.url ?? "");
            setDesiredResponse(props.data.desired_response ?? "");
            setOperator(props.data.operator ?? "==");
            setTarget(props.data.target ?? "status_code");
            setData(props.data.data ?? "");
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

        const toastId = toast.loading(`Adding new Online Service Monitor for ${formJson.name}`);

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
                    method: formJson.method,
                    url: formJson.url,
                    desired_response: formJson.desired_response,
                    operator: formJson.operator,
                    target: formJson.target,
                    data: formJson.data === "" ? {} : formJson.data,
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
            <DialogTitle>{props.data ? 'Update Existing Online Service' : 'Monitor New Online Service Heartbeat'}</DialogTitle>
            <DialogContent>
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
                    disabled={props.data ? true : false} // Disable if in update mode
                />
                <TextField
                    id="method"
                    select
                    label="Method"
                    name="method"
                    defaultValue="get"
                    helperText="Please select request method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="get" value="get">
                        get
                    </MenuItem>
                    <MenuItem key="post" value="post">
                        post
                    </MenuItem>
                    <MenuItem key="put" value="put">
                        put
                    </MenuItem>
                </TextField>
                <TextField
                    autoFocus
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
                    defaultValue="=="
                    helperText="Please select match operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="==" value="==">
                        ==
                    </MenuItem>
                    <MenuItem key="!=" value="!=">
                        !=
                    </MenuItem>
                    <MenuItem key="in" value="in">
                        in
                    </MenuItem>
                    <MenuItem key="not in" value="not in">
                        not in
                    </MenuItem>
                </TextField>
                <TextField
                    id="target"
                    select
                    label="Target"
                    name="target"
                    defaultValue="status_code"
                    helperText="Please select matching target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    fullWidth
                    variant="standard"
                >
                    <MenuItem key="status_code" value="status_code">
                        status_code
                    </MenuItem>
                    <MenuItem key="content" value="content">
                        content
                    </MenuItem>
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

export default OnlineServiceDialog;
