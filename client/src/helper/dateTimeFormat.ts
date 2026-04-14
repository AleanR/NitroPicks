// Format ISO time string into yyyy-mm-dd
export function formatEditDate (time: string) : string {

    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Format ISO string into abbreviated month (e.g. Apr, Mar) - day - year
export function formatDate (dateString: string) : string {

    const date = new Date(dateString);
    const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });

    return formattedDate
}

// Format ISO string into local time (XX:XX AM/PM)
export function formatTime (dateString: string) : string {
    const date = new Date(dateString);

    const formattedTime = date.toLocaleString("en-US", {
        hour: '2-digit',
        minute: '2-digit'
    })

    return formattedTime;
}


export function gameStarted (startTime: string): boolean {
    const now = new Date(Date.now());
    const start = new Date(startTime);

    if (now >= start) return true;
    return false; 
  }