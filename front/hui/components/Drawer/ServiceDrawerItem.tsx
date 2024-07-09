import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PublicIcon from '@mui/icons-material/Public';
import toast from 'react-hot-toast';
import MuiTooltip from '@mui/material/Tooltip';
import { ServiceConfig } from '@/types';
import EditIcon from '@mui/icons-material/Edit';
import SystemdServiceDialog from '../ServiceDialog/SystemdServiceDialog';
import JournalServiceDialog from '../ServiceDialog/JournalServiceDialog';
import OnlineServiceDialog from '../ServiceDialog/OnlineServiceDialog';




type Props = {
    serviceName: string
}

function ServiceDrawerItem(props: Props) {


    // Remove Dialog
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    // Remove Request
    function removeService(){
        // add loading and notify the result
        const tst = toast.loading(`removing ${props.serviceName}...`)
        try{
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/service/`+props.serviceName,{
                method: 'DELETE',
                headers: {
                    "accept": "application/json"
                }
            }).then((response) => {
                if (response.status == 202){
                    toast.success(`${props.serviceName} service successfully removed`, {
                        id: tst
                    });
                    handleClose();
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

    // item details
    const [itemData, setItemData] = React.useState<ServiceConfig>();

    React.useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/service/`+props.serviceName,{
            method: 'GET',
            headers: {
                "accept": "application/json"
            }})
            .then(
                async (data) => {
                    const detail = await data.json();
                    setItemData(detail);
                }
            )
        
    }, [])

    // Edit Dialog
    const [editOpen, setEditOpen] = React.useState(false);



    return (
    <div key={props.serviceName}>
        <ListItemButton>
            <ListItemIcon>
                {itemData?.type == "SystemdServiceStatus" ? <SettingsSuggestIcon/>:itemData?.type == "OnlineService" ? <PublicIcon/>:<NewspaperIcon/>}
            </ListItemIcon>
            <ListItemText primary={props.serviceName} />
            <IconButton onClick={() => setEditOpen(true)}>
                <EditIcon/>
            </IconButton>
            <MuiTooltip title="Remove Service">   
                <IconButton onClick={handleClickOpen} >
                    <CloseIcon/>
                </IconButton>
            </MuiTooltip>
            <Dialog
                open={dialogOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                {"Remove service?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are You Sure You Want to Remove Monitoring Task for {props.serviceName} Service?
                    acrion can not be undone.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button className='text-red-500' onClick={removeService}>Remove</Button>
                <Button onClick={handleClose} autoFocus>
                    Cancel
                </Button>
                </DialogActions>
            </Dialog>    
            {
                itemData?.type == "SystemdServiceStatus" ? <SystemdServiceDialog open={editOpen} setOpen={setEditOpen} data={itemData}/>:itemData?.type == "OnlineService" ? <OnlineServiceDialog open={editOpen} setOpen={setEditOpen} data={itemData}/>:<JournalServiceDialog open={editOpen} setOpen={setEditOpen} data={itemData}/>
            }
        </ListItemButton>

        <Divider />
    </div>
    )
}

export default ServiceDrawerItem
