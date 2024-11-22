import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_HOST;

export const addOrUpdateServer = async (formData: FormData, isUpdate: boolean, id_server: number | null) => {
    try {
        const response = await axios({
            method: isUpdate ? 'PUT' : 'POST',
            url: isUpdate ? `${apiUrl}/server/${id_server}` : `${apiUrl}/server/`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response;
    } catch (error) {
        throw error;
    }
};

export const fetchServers = async (offset: number = 0, limit: number = 10) => {
    try {
        if (limit === -1) {
            let allServers: Array<any> = [];
            let currentOffset = 0;
            let hasMore = true;

            while (hasMore) {
                const response = await axios.get(`${apiUrl}/server/`, {
                    params: {
                        offset: currentOffset,
                        limit: 10
                    }
                });

                const data = response.data;
                allServers = [...allServers, ...data];

                // If the number of returned servers is less than the limit, we have fetched all servers
                hasMore = data.length === 10;
                currentOffset += 10; // Increment the offset for the next batch
            }

            return allServers;
        } else {
            const response = await axios.get(`${apiUrl}/server/`, {
                params: {
                    offset: offset,
                    limit: limit
                }
            });
            return response.data;
        }
    } catch (error) {
        throw error;
    }
};

export const fetchServer = async (id_server: number, field: string = "") => {
    try {
        const response = await axios.get(`${apiUrl}/server/${id_server}`, {
            params: field ? { field } : undefined
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteServer = async (serverId: number) => {
    try {
        await axios.delete(`${apiUrl}/server/${serverId}`);
    } catch (error) {
        throw error;
    }
};