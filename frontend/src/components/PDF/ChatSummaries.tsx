import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjust this import based on your project structure
import { useNavigate } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import useStore from "../../store/store";
//for showing the chat summaries
type Summary = {
 _id: Id<"summaries">;
  title: string;
  // content: string;
  createdAt: string;
};

export function ChatSummaries() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const navigate = useNavigate();

  const user = useStore((state) => state.user);

	if (!user) {
		return null;
	}
	const { id } = user;
  // Fetch summaries using Convex query
  const fetchedSummaries = useQuery(api.summaries.getSummariesByUserId, {
    userId: String(id), // Replace with the correct user ID
  }) as Summary[] ;

  
    useEffect(() => {
        if (fetchedSummaries && fetchedSummaries.length > 0) {
          setSummaries(fetchedSummaries);
        } else {
          console.log("No summaries found for userId");
        }
      }, [fetchedSummaries]);
      if (!fetchedSummaries) {
        return <p>Loading summaries...</p>; // Optional loading state
      }
    
      
      const handleCardClick = (chatId: string) => {
        navigate(`/chat/${chatId}`); // Navigate to ChatTemplate with chatId
      };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Chat Summaries</h1>

      <div className="flex flex-wrap gap-6">
        {summaries.length > 0 ? (
          summaries.map((summary) => (
            <div
              key={summary._id}
              onClick={() => handleCardClick(summary._id)}
              className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4 border border-gray-300 rounded-lg shadow-md"
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-2">{summary.title}</h2>
                {/* <p className="text-sm mb-2">{summary.content}</p> */}
                <p className="text-xs text-gray-500">
                  Created At: {new Date(summary.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No summaries available for this user.</p>
        )}
      </div>
    </div>
  );
}
