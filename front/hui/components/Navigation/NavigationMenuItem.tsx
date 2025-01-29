import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import NavigationMenu from './NavigationMenu';
import ServerDialog from '../ServiceDialog/ServerDialog';
import toast from 'react-hot-toast';

interface NavigationMenuProps {
  name: string;
  id: number;
  serverNames: Object;
  setServerNames: () => void;
}

const NavigationMenuItem: React.FC<NavigationMenuProps> = ({ name, id, serverNames, setServerNames }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleClose = () => {
        setDialogOpen(false);
    };
    const handleClickOpen = () => {
    setDialogOpen(true);
    };
    const handleEditOpen = () => {
        setEditOpen(true);
        setEditTriggered(true);
    };
    // Edit Dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editTriggered, setEditTriggered] = useState(false);
    
    const refreshServerNames = () => {
        setServerNames(Object.fromEntries(Object.entries(serverNames).filter(x => x[0] != id)));
    }
    
    useEffect(() => {
        if (editTriggered && !editOpen){
            refreshServerNames();
        }
    }, [editOpen, editTriggered])

  // Remove Request
  function removeServer(){
    refreshServerNames();
    // add loading and notify the result
    const tst = toast.loading(`removing ${name}...`)
    try{
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/server/`+id,{
            method: 'DELETE',
            headers: {
                "accept": "application/json"
            }
        }).then((response) => {
            if (response.status == 202){
                toast.success(`${name} service successfully removed`, {
                    id: tst
                });
                handleClose();
            }
            else{
                toast.error(`removing ${name} failed!`, {
                    id: tst
                })
            }
        });
    }catch{
        toast.error(`removing ${name} failed!`, {
            id: tst
        })
    }
    }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{name}</span>
      <NavigationMenu
        onEdit={handleEditOpen}
        onRemove={handleClickOpen}
      />
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
                  Are You Sure You Want to Remove {name} Server?
                  action can not be undone.
              </DialogContentText>
              </DialogContent>
              <DialogActions>
              <Button onClick={handleClose} color='inherit' autoFocus>
                  Cancel
              </Button>
              <Button color='error' onClick={removeServer}>Remove</Button>
              </DialogActions>
          </Dialog>    
      <ServerDialog key={id+name} open={editOpen} setOpen={setEditOpen} data={id}/>
    </div>
  );
};

export default NavigationMenuItem;