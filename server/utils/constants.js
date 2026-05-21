export const FINE_RATE_PER_DAY = 1; // ₹1 per day

export const getDaysOverdue = (returnDate, dueDate) => {
    if (!returnDate) return 0;
    const returnD = new Date(returnDate);
    const dueD = new Date(dueDate);
    
    // Set hours to 0 to compare dates accurately without timezone/time-of-day offsets
    returnD.setHours(0, 0, 0, 0);
    dueD.setHours(0, 0, 0, 0);
    
    const diffTime = returnD.getTime() - dueD.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

export const calculateFine = (returnDate, dueDate) => {
    const days = getDaysOverdue(returnDate, dueDate);
    return days * FINE_RATE_PER_DAY;
};
