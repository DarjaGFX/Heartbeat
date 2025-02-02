import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_HOST;


export const addOrUpdateSystemdService = async (serviceData: {
    service: {
        id_server?: number,
        service_name: string
    },
    config: {
        interval: number
    }
}, id_service: number|undefined) => {
    try {
        const response = await axios({
            method: id_service ? 'PUT' : 'POST',
            url: id_service ? `${apiUrl}/service/${id_service}`:`${apiUrl}/service`,
            data: serviceData,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};


export const addOrUpdateOnlineService = async (serviceData: {
    service: {
        id_server?: number,
        service_name: string
      },
      config: {
        interval: number,
        method: "POST" | "GET",
        url: string,
        desired_response: string,
        operator: "==" | "!=" | "in" | "not in",
        target: "content" | "status_code",
        data: object | null
      }
}, id_service: number|undefined) => {
    try {
        const response = await axios({
            method: id_service ? 'PUT' : 'POST',
            url: id_service ? `${apiUrl}/service/${id_service}`:`${apiUrl}/service`,
            data: serviceData,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const addOrUpdateJournalService = async (serviceData: {
    service: {
        id_server: number,
        service_name: string
      },
    config: {
        interval: number,
        desired_response: string,
        operator: "in" | "not in"
    }
}, id_service: number|undefined) => {
    try {
        const response = await axios({
            method: id_service ? 'PUT' : 'POST',
            url: id_service ? `${apiUrl}/service/${id_service}`:`${apiUrl}/service`,
            data: serviceData,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const getServiceById = async (id: number) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${apiUrl}/service/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};