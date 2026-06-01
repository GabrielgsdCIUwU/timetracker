export const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateTimeFromEntries = (entries) => {
    const now = Date.now();
    return entries.reduce((total, entry) => {
        const start = new Date(entry.start).getTime();
        const end = entry.end ? new Date(entry.end).getTime() : now;
        return total + (end - start);
    }, 0);
};