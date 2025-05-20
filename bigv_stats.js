/**
 * Basketball Victoria API Data Fetcher
 * This script fetches data from the Basketball Victoria API and displays the JSON response.
 */

// URL for the Basketball Victoria API
const apiUrl = "https://prod.services.nbl.com.au/api_cache/bbv/synergy?route=seasons/6b772c89-e1d4-11ef-adf4-c9b5f45cb025/entities&limit=200&include=entities&format=true";

/**
 * Fetches data from the Basketball Victoria API
 * @returns {Promise} Promise object representing the fetch operation
 */
async function fetchBasketballData() {
  try {
    // Display a loading message
    updateStatus("Fetching data from Basketball Victoria API...");
    
    // Make the fetch request
    const response = await fetch(apiUrl);
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Update status and return the data
    updateStatus(`Request successful! Status code: ${response.status}`);
    return data;
    
  } catch (error) {
    // Handle any errors
    handleError(error);
    return null;
  }
}

/**
 * Updates the status message on the page
 * @param {string} message - The status message to display
 */
function updateStatus(message) {
  const statusElement = document.getElementById("status");
  if (statusElement) {
    statusElement.textContent = message;
  } else {
    console.log(message);
  }
}

/**
 * Handles errors and displays them
 * @param {Error} error - The error object
 */
function handleError(error) {
  const errorMessage = `Error: ${error.message}`;
  
  // Update status with error
  updateStatus(errorMessage);
  
  // Log error to console for debugging
  console.error(errorMessage);
  
  // Display error in the results area
  const resultsElement = document.getElementById("results");
  if (resultsElement) {
    resultsElement.innerHTML = `<div class="error">${errorMessage}</div>`;
  }
}

/**
 * Displays the JSON data in a formatted way
 * @param {Object} data - The JSON data to display
 */
function displayData(data) {
  const resultsElement = document.getElementById("results");
  
  if (!resultsElement) {
    console.error("Results element not found in the DOM");
    return;
  }
  
  if (!data) {
    resultsElement.innerHTML = "<p>No data to display</p>";
    return;
  }
  
  // Create a pre element for the formatted JSON
  const preElement = document.createElement("pre");
  preElement.className = "json-output";
  
  // Format the JSON with indentation and add it to the pre element
  preElement.textContent = JSON.stringify(data, null, 2);
  
  // Clear previous results and add the new data
  resultsElement.innerHTML = "";
  resultsElement.appendChild(preElement);
  
  // Optional: Add a summary section
  if (data.entities && Array.isArray(data.entities)) {
    const summaryElement = document.createElement("div");
    summaryElement.className = "summary";
    summaryElement.innerHTML = `<p>Found ${data.entities.length} entities in the response</p>`;
    resultsElement.insertBefore(summaryElement, preElement);
  }
}

/**
 * Main function to fetch and display the data
 */
async function main() {
  // Fetch the data
  const data = await fetchBasketballData();
  
  // Display the data if it exists
  if (data) {
    displayData(data);
  }
}

/**
 * Initialize the application when the DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", function() {
  // Create UI elements if they don't exist
  if (!document.getElementById("app")) {
    const appDiv = document.createElement("div");
    appDiv.id = "app";
    
    appDiv.innerHTML = `
      <h1>Basketball Victoria Data Viewer</h1>
      <button id="fetchButton">Fetch Data</button>
      <div id="status">Ready to fetch data</div>
      <div id="results"></div>
    `;
    
    document.body.appendChild(appDiv);
    
    // Add event listener to the fetch button
    document.getElementById("fetchButton").addEventListener("click", main);
  } else {
    // If elements already exist, just add event listener
    const fetchButton = document.getElementById("fetchButton");
    if (fetchButton) {
      fetchButton.addEventListener("click", main);
    }
  }
  
  // Add some basic styles
  addStyles();
});

/**
 * Adds basic CSS styles to the page
 */
function addStyles() {
  if (!document.getElementById("bigv-styles")) {
    const styleElement = document.createElement("style");
    styleElement.id = "bigv-styles";
    
    styleElement.textContent = `
      #app {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      h1 {
        color: #333;
      }
      
      button {
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px 0;
        cursor: pointer;
        border-radius: 4px;
      }
      
      #status {
        margin: 10px 0;
        padding: 10px;
        background-color: #f8f9fa;
        border-left: 4px solid #007bff;
      }
      
      .error {
        color: #721c24;
        background-color: #f8d7da;
        padding: 10px;
        border-radius: 4px;
        margin-top: 10px;
      }
      
      .summary {
        margin: 10px 0;
        padding: 10px;
        background-color: #d4edda;
        border-radius: 4px;
      }
      
      .json-output {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        overflow: auto;
        max-height: 600px;
        font-family: monospace;
        white-space: pre-wrap;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
}

