import React from "react";
import JobList from "./Jobs/JobList";
const HomePage: React.FC = () => {
  return (
    <div className=" p-8 rounded-xl ">
      <JobList />
    </div>
  );
};
export default HomePage;
