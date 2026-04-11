import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-lg text-gray-600">Page not found</p>
      </div>
      <a
        href="/"
        className="inline-block px-6 py-3 mt-6 font-medium text-white transition bg-primary rounded-2xl bg-primary-dark"
      >
        Go back home
      </a>
    </div>
  );
};
export default NotFound;
