import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PublicIcon from '@mui/icons-material/Public';
import toast from 'react-hot-toast';
import MuiTooltip from '@mui/material/Tooltip';
import { ServiceConfig } from '@/types';
import EditIcon from '@mui/icons-material/Edit';
import ServerDialog from '../ServiceDialog/ServerDialog';
import JournalServiceDialog from '../ServiceDialog/JournalServiceDialog';
import OnlineServiceDialog from '../ServiceDialog/OnlineServiceDialog';
import { DrawerServerItem, ServerData } from '@/types';
import ServerStats from '../MainView/ServerStats';


type Props = {
    server: DrawerServerItem,
    status: ServerData,
    pageSetState: (content: number) => void,
    drawerSetOpen: (open: boolean) => void,
}

function SideDrawerItem(props: Props) {

    // Remove Dialog
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const setPageState = () =>{
        props.pageSetState(props.server.id_server);
        // props.drawerSetOpen(false);
    }

    // Remove Request
    function removeServer(){
        // add loading and notify the result
        const tst = toast.loading(`removing ${props.server.name}...`)
        try{
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/server/`+props.server.id_server,{
                method: 'DELETE',
                headers: {
                    "accept": "application/json"
                }
            }).then((response) => {
                if (response.status == 202){
                    toast.success(`${props.server.name} service successfully removed`, {
                        id: tst
                    });
                    handleClose();
                }
                else{
                    toast.error(`removing ${props.server.name} failed!`, {
                        id: tst
                    })
                }
            });
        }catch{
            toast.error(`removing ${props.server.name} failed!`, {
                id: tst
            })
        }
    }

    // status color
    const [statusColor, seStatusColor] = React.useState<"limegreen" | "red">("limegreen");

    React.useEffect(() => {
        if (props.status.active){
            seStatusColor("limegreen");
        }
        else{
            seStatusColor("red");
        }
    }, [props.status])

    // Edit Dialog
    const [editOpen, setEditOpen] = React.useState(false);


    return (
    <div key={props.server.name}>
        <ListItemButton>
            <Box
                sx={{ 
                    // marginTop: 1,
                    marginRight: 1,
                    width: 8,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: statusColor,
                }}
            />
            <ListItemText primary={props.server.name} onClick={setPageState}/>
            {/* <ServerStats status={props.status} /> */}
            <MuiTooltip title="Edit Server"> 
                <IconButton onClick={() => setEditOpen(true)}>
                    <EditIcon/>
                </IconButton>
            </MuiTooltip> 
            <MuiTooltip title="Remove Server">   
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
                    {"Remove server?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are You Sure You Want to Remove {props.server.name} Server?
                    action can not be undone.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button className='text-red-500' onClick={removeServer}>Remove</Button>
                <Button onClick={handleClose} autoFocus>
                    Cancel
                </Button>
                </DialogActions>
            </Dialog>    
            <ServerDialog open={editOpen} setOpen={setEditOpen} data={props.server.id_server}/>
        </ListItemButton>

        <Divider />
    </div>
    )
}

export default SideDrawerItem
