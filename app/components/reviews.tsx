import { useOptimistic } from "react";

export default function Reviews({extracted}: {extracted: boolean}) {

    const [reviews, setReviews] = useOptimistic([]);
    if (!extracted) {
        
    }
    
    return (
        <div>
            
        </div>
    )
}