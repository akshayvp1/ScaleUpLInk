import React from 'react'
// import AgeCard from '../../components/entrepreneur/ageCard'
import Stories from '../../components/basics/stories'
import Post from '../../components/basics/post'
import { ModeToggle } from '../../components/mode-toggle';
function AgeCardPage() {
  // Sample users array
  const users = [
    { id: "1", username: "JohnDoe", avatar: "https://via.placeholder.com/100", hasUnseenStory: true },
    { id: "2", username: "JaneDoe", hasUnseenStory: false },
  ];

  return (
    <div>
      <ModeToggle/>
      <Stories users={users} />
      {/* <AgeCard /> */}
      <Post/>
    </div>
  );
}

export default AgeCardPage;
