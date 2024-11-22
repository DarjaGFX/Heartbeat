import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_HOST;


export const addOrUpdateSystemdService = async (serviceData: {
    service: {
        id_server: number,
        service_name: string
    },
    config: {
        interval: number
    }
}, isUpdate: boolean) => {
    try {
        const response = await axios({
            method: isUpdate ? 'PUT' : 'POST',
            url: `${apiUrl}/service`,
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
        id_server: number,
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
}, isUpdate: boolean) => {
    try {
        const response = await axios({
            method: isUpdate ? 'PUT' : 'POST',
            url: `${apiUrl}/service`,
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
}, isUpdate: boolean) => {
    try {
        const response = await axios({
            method: isUpdate ? 'PUT' : 'POST',
            url: `${apiUrl}/service`,
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