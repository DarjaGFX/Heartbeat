IDEAS:
    [] add pinger for server! show tiny line graph or sth else for visualising server accessibility

TODOS:
    [] create ssh connection for each new creating servers
    [] create ssh connection for each in db stored servers on service start up


    [] add tests
    [] install SSH in docker image (add command in dockerfile) // ? why? SSH should be installed on hosts! awa curl!
    [] service.beats list may have lots of items. check how to load limited sized relation fields

DONE:        
    [X] add another connection manager for server sockets
    [X] merge service socket endpoints and have one -> needs change channel function in ServiceConnectionManager, each socket can change its channel if it recieves a message containing server or service id
    [X] check Relationship
    [] async db interactions
    [X] Service API
        -> [X] Config
            -> [X] Model
            -> [X] Crud
        -> [X] Service
            -> [X] Model
            -> [X] Crud
            -> [X] API UPDATE
        -> [X] Beat
            -> [X] Model
            -> [X] Crud
ERRORS:
    [X] password would not be stored because of recent changes in server sqlmodel (in order to remove password from API responses)
    [X] files does not store correctly, just a directory with filename would be created!
    [X] requests without files would fail and exception will occure


About (AI generated):
The project appears to be a **Heartbeat Monitoring Application** built using **Next.js** for the frontend and **FastAPI** for the backend. Here’s a breakdown of its purpose and functionality:

