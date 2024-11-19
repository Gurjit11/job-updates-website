import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { FaCheckDouble, FaShareFromSquare } from "react-icons/fa6";

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleShare = (message, index) => {
    const formattedDetails =
      `Company Name: ${message.company_name}\n` +
      `Role: ${message.role}\n` +
      `Years of Experience: ${message.years_of_experience || "N/A"}\n` +
      `Batch Eligible: ${
        message.batch_eligible.length > 0
          ? message.batch_eligible.join(", ")
          : "N/A"
      }\n` +
      `Apply Link: ${message.apply_link}\n` +
      `Salary: ${message.salary || "Not Disclosed"}`;

    navigator.clipboard.writeText(formattedDetails).then(() => {
      setCopied(index);
      setTimeout(() => setCopied(null), 2000); // Reset copied state after 2 seconds
    });
  };

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_KEY}/fetch_updates`
      );
      if (
        response.data.messages.error &&
        response.data.messages.error.code === 503
      ) {
        console.error(
          "Error fetching updates:",
          response.data.messages.error.message
        );
        alert(`Error: ${response.data.messages.error.message}`);
      } else {
        console.log(
          "Response:",
          response.data.messages.candidates[0].content.parts[0].text
        );
        const rawText =
          response.data.messages.candidates[0].content.parts[0].text;
        const cleanedText = rawText
          .trim() // Remove unnecessary whitespace
          .replace(/```json|```/g, ""); // Remove ```json and ```

        const jsonArray = JSON.parse(cleanedText); // Parse JSON string to object

        setMessages(jsonArray);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
    setLoading(false);
  };
  console.log("Messages:", messages);

  return (
    <div className="min-h-screen w-full h-full bg-gray-100 flex flex-col items-center p-4">
      {" "}
      <header className="w-full max-w-4xl">
        {" "}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
          {" "}
          Job Updates{" "}
        </h1>{" "}
        <div className="flex justify-center mb-4">
          {" "}
          <button
            onClick={fetchUpdates}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {" "}
            {loading ? "Fetching Updates..." : "Fetch Latest Job Updates"}{" "}
          </button>{" "}
        </div>{" "}
      </header>{" "}
      <div className="w-full md:px-10">
        <div className="overflow-x-auto w-full max-h-[75vh] relative  rounded-lg">
          <table className="min-w-full bg-white rounded-lg border-collapse">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0 z-10 rounded-t-lg">
              <tr>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Company Name
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Role
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Years of Experience
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Batch Eligible
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Salary
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Apply
                </th>
                <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold text-white">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {messages
                .slice()
                .reverse()
                .map((message, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-indigo-50 transition duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="border-b border-gray-200 px-6 py-4 text-gray-900 font-medium">
                      {message.company_name}
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4 text-gray-700">
                      {message.role}
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4 text-gray-600">
                      {message.years_of_experience || "N/A"}
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4 text-gray-600">
                      {message.batch_eligible.length > 0
                        ? message.batch_eligible.join(", ")
                        : "N/A"}
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4 text-gray-700">
                      {message.salary || "Not Disclosed"}
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4">
                      <a
                        href={message.apply_link}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300 shadow-sm"
                      >
                        Apply Here
                      </a>
                    </td>
                    <td className="border-b border-gray-200 px-6 py-4">
                      <button
                        onClick={() => handleShare(message, index)}
                        className="px-4 py-2 bg-gray-100 text-indigo-600 rounded-full hover:bg-green-300 hover:text-gray-700 transition duration-300 shadow-sm"
                      >
                        {copied === index ? (
                          <FaCheckDouble className="text-green-500" />
                        ) : (
                          <FaShareFromSquare />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
