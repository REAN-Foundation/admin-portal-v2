// this is generic function which takes input as array and add missing month with value 0
export function processMissingMonths(allRawData: any[] | null) {
    // Check if input is undefined or null
    if (allRawData == null) {
        console.error('Error: Input is null or undefined');
        return { labels: [], data: [] };
    }

    // Ensure input is an array
    if (!Array.isArray(allRawData)) {
        console.error('Error: Input is not an array');
        return { labels: [], data: [] };
    }

    // Initialize the arrays
    const data = [];
    const labels = [];

    // Check if the input array is empty
    if (allRawData.length === 0) {
        console.log('No data to process');
        return { labels: [], data: [] };
    }

    try {
        // Find start and end months
        const sortedDates = allRawData
            .map((item) => new Date(item.activity_month))
            .sort((a:any, b:any) => a - b);

        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];

        // console.log('Start month:', startDate.toISOString().slice(0, 7));
        // console.log('End month:', endDate.toISOString().slice(0, 7));

        // Create a map for quick lookup of user counts
        const userCountMap = new Map(
            allRawData.map((item) => [item.activity_month, item.monthly_active_users])
        );

        // Iterate through all months from start to end
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentMonthStr = currentDate.toISOString().slice(0, 7);
            labels.push(formatMonth(currentMonthStr));  // Format the month
            data.push(userCountMap.get(currentMonthStr) || 0);

            // Move to the next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log('Labels.................:', labels);
        console.log('Data...................:', data);

        return {
            labels: labels,
            data: data
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return { labels: [], data: [] };
    }
}

// Function to format month as "Jan-2024" or "Sept-2023"
export function formatMonth(utcDate: string): string {
    const date = new Date(utcDate);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',    // Use short month name (e.g., "Jan", "Feb")
        year: 'numeric'    // Include the year (e.g., "2024")
    }).format(date).replace(' ', '-');  // Replace space with dash for format like "Jan-2024"
}

// for january-2025 lke date
export function formatMonthLabel(utcDate: string): string {
    const date = new Date(utcDate);
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}


//this gives output as 04-06-2025
export function formatDateToDDMMYYYY(dateString: string | number | Date) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}


// this is generic function which takes input as array and add missing month with value 0
export function processMissingMonthsFeature(allRawData: any[] | null) {
    // Check if input is undefined or null
    if (allRawData == null) {
        console.error('Error: Input is null or undefined');
        return { labels: [], data: [] };
    }

    // Ensure input is an array
    if (!Array.isArray(allRawData)) {
        console.error('Error: Input is not an array');
        return { labels: [], data: [] };
    }

    // Initialize the arrays
    const data = [];
    const labels = [];

    // Check if the input array is empty
    if (allRawData.length === 0) {
        console.log('No data to process');
        return { labels: [], data: [] };
    }

    try {
        // Find start and end months
        const sortedDates = allRawData
            .map((item) => new Date(item.month))
            .sort((a:any, b:any) => a - b);

        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];

        // console.log('Start month:', startDate.toISOString().slice(0, 7));
        // console.log('End month:', endDate.toISOString().slice(0, 7));

        // Create a map for quick lookup of user counts
        const userCountMap = new Map(
            allRawData.map((item) => [item.month, item.access_frequency])
        );

        // Iterate through all months from start to end
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentMonthStr = currentDate.toISOString().slice(0, 7);
            labels.push(formatMonth(currentMonthStr));  // Format the month
            data.push(userCountMap.get(currentMonthStr) || 0);

            // Move to the next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        console.log('Labels.................:', labels);
        console.log('Data...................:', data);

        return {
            labels: labels,
            data: data
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return { labels: [], data: [] };
    }
}

// Helper function to generate sequential months between two dates
export function generateMonthSequence(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const monthSequence = [];

    while (startDate <= endDate) {
        monthSequence.push(formatMonth(startDate.toISOString())); // Use formatMonth for formatting
        startDate.setMonth(startDate.getMonth() + 1);
    }

    return monthSequence;
}

export function formatLabelOfMonth(month: string): string {
    const date = new Date(month + '-01');
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}



export function processPatientDeregistrationHistory(patientDeregistrationHistory: any[] | null) {
    // console.log('Input received:', patientDeregistrationHistory);

    // Check if input is undefined or null
    if (patientDeregistrationHistory == null) {
        console.error('Error: Input is null or undefined');
        return { labels: [], data: [] };
    }

    // Ensure input is an array
    if (!Array.isArray(patientDeregistrationHistory)) {
        console.error('Error: Input is not an array');
        return { labels: [], data: [] };
    }

    // Initialize the arrays
    const patientDeRegistrationHistoryData = [];
    const patientDeRegistrationHistoryLabels = [];

    // Check if the input array is empty
    if (patientDeregistrationHistory.length === 0) {
        console.log('No data to process');
        return { labels: [], data: [] };
    }

    try {
        // Find start and end months
        const sortedDates = patientDeregistrationHistory.map((item) => new Date(item.month)).sort((a:any, b:any) => a - b);

        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];

        // console.log('Start month:', startDate.toISOString().slice(0, 7));
        // console.log('End month:', endDate.toISOString().slice(0, 7));

        // Create a map for quick lookup of user counts
        const userCountMap = new Map(patientDeregistrationHistory.map((item) => [item.month, item.user_count]));

        // Iterate through all months from start to end
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentMonthStr = currentDate.toISOString().slice(0, 7);
            patientDeRegistrationHistoryLabels.push(currentMonthStr);
            patientDeRegistrationHistoryData.push(userCountMap.get(currentMonthStr) || 0);

            // Move to the next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // console.log('Labels:', patientDeRegistrationHistoryLabels);
        // console.log('Data:', patientDeRegistrationHistoryData);

        return {
            labels: patientDeRegistrationHistoryLabels,
            data: patientDeRegistrationHistoryData
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return { labels: [], data: [] };
    }
}

export function processPatientRegistrationHistory(registrationHistory: any[] | null, deregistrationHistory: any[] | null) {
    console.log('Input received:', { registrationHistory, deregistrationHistory });

    // Check if inputs are undefined or null
    if (registrationHistory == null || deregistrationHistory == null) {
        console.error('Error: One or both inputs are null or undefined');
        return { labels: [], registrationData: [], deregistrationData: [] };
    }

    // Ensure inputs are arrays
    if (!Array.isArray(registrationHistory) || !Array.isArray(deregistrationHistory)) {
        console.error('Error: One or both inputs are not arrays');
        return { labels: [], registrationData: [], deregistrationData: [] };
    }

    // Check if both input arrays are empty
    if (registrationHistory.length === 0 && deregistrationHistory.length === 0) {
        console.log('No data to process');
        return { labels: [], registrationData: [], deregistrationData: [] };
    }

    try {
        // Combine both arrays and find start and end months
        const allDates = [
            ...registrationHistory.map((item) => new Date(item.month)),
            ...deregistrationHistory.map((item) => new Date(item.month))
        ].sort((a:any, b:any) => a - b);

        const startDate = allDates[0];
        const endDate = allDates[allDates.length - 1];

        console.log('Start month:', startDate.toISOString().slice(0, 7));
        console.log('End month:', endDate.toISOString().slice(0, 7));

        // Create maps for quick lookup of user counts
        const registrationMap = new Map(registrationHistory.map((item) => [item.month, item.user_count]));
        const deregistrationMap = new Map(deregistrationHistory.map((item) => [item.month, item.user_count]));

        const labels = [];
        const registrationData = [];
        const deregistrationData = [];

        // Iterate through all months from start to end
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentMonthStr = currentDate.toISOString().slice(0, 7);

            // Format label as "MMM-YYYY"
            const formattedLabel:any =
                currentDate.toLocaleString('default', { month: 'short' }) + '-' + currentDate.getFullYear();
            labels.push(formattedLabel);

            registrationData.push(registrationMap.get(currentMonthStr) || 0);
            deregistrationData.push(deregistrationMap.get(currentMonthStr) || 0);

            // Move to the next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // console.log('Labels..............................:', labels);
        // console.log('Registration Data...........................:', registrationData);
        // console.log('Deregistration Data...................:', deregistrationData);

        return { labels, registrationData, deregistrationData };
    } catch (error) {
        console.error('Error processing data:', error);
        return { labels: [], registrationData: [], deregistrationData: [] };
    }
}

// Function to format the date
export function formatDate(utcDate: string): string {
    const date = new Date(utcDate);
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}