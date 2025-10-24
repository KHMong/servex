import apiClient from './apiClient';

export const getFeaturedVenues = async () => {
    try {
        const response = await apiClient.get('/home/featured-venues');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching featured venues:", error);
        return [];
    }
    
};

export const getUpcomingTournaments = async () => {
    try {
        const response = await apiClient.get('/home/upcoming-tournaments');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching upcoming tournaments:", error);
        return [];
    }
    
};