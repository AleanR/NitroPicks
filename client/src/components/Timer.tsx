import { useEffect, useState } from "react";

function useNow (interval = 1000) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => {
            setNow(Date.now());
        }, interval);

        return () => clearInterval(id);
    }, [interval]);

    return now;
}


function elapsedTime(startTime: string) {
    const now = useNow();
    const start = new Date(startTime).getTime();

    const diff = now - start;

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);


    return { hours, mins, secs };
}

export default function GameTimer({ startTime }: { startTime: string }) {
    const { hours, mins, secs } = elapsedTime(startTime);

    const pad = (n: number) => String(n).padStart(2, "0");


    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`

}