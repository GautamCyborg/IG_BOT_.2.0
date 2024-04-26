/** @format */

let links = [];
let MessageArr = [];

function extractMessages(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      // Assuming each line in the CSV is a separate message
      const messages = text.split(/\r?\n/); // Handles both Windows and UNIX line endings
      const cleanedMessages = messages.filter(
        (message) => message.trim() !== ""
      ); // Filter out any empty lines
      resolve(cleanedMessages);
    };
    reader.onerror = (error) => {
      console.error("Error reading the file:", error);
      reject(error);
    };
    reader.readAsText(file);
  });
}

// Code to read CSV file and extract Instagram links
function extractInstagramData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/); // Handles both Windows and UNIX line endings
      const data = [];

      if (lines.length > 0) {
        // Assuming the first line contains headers: Links, Status, Comment, Follow
        const headers = lines[0].split(","); // Split headers by comma

        // Find index of 'Links' and other columns based on headers
        const linksIndex = headers.findIndex(
          (header) => header.trim().toLowerCase() === "links"
        );
        const statusIndex = headers.findIndex(
          (header) => header.trim().toLowerCase() === "status"
        );
        const commentIndex = headers.findIndex(
          (header) => header.trim().toLowerCase() === "comment"
        );
        const followIndex = headers.findIndex(
          (header) => header.trim().toLowerCase() === "follow"
        );

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() !== "") {
            const fields = lines[i].split(",");
            if (fields[linksIndex].startsWith("https://www.instagram.com/")) {
              // Extract the username from the URL
              const username = fields[linksIndex]
                .split("www.instagram.com/")[1]
                .split("/")[0];
              const status = fields[statusIndex]
                ? fields[statusIndex].trim()
                : "";
              const comment = fields[commentIndex]
                ? fields[commentIndex].trim()
                : "";
              const follow = fields[followIndex]
                ? fields[followIndex].trim()
                : "";

              data.push({
                username: username,
                status: status,
                comment: comment,
                follow: follow,
              });
            }
          }
        }
      }
      resolve(data);
    };
    reader.onerror = (error) => {
      console.error("Error reading the file:", error);
      reject(error);
    };
    reader.readAsText(file);
  });
}

document.getElementById("clickButton").addEventListener("click", async () => {
  const fileInput = document.getElementById("excelFileInput");
  const messageInputFile = document.getElementById("messageInput");
  const file = fileInput.files[0];

  if (!messageInputFile.files[0]) {
    alert("Please select a Message CSV file");
  }

  if (!file) {
    alert("Please select a username CSV file.");
    return;
  }

  cleanedMessages = await extractMessages(messageInputFile.files[0]);
  data = await extractInstagramData(file);
  alert("Data extracted please click Start");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: "runScript",
        links: data,
        MessageArray: cleanedMessages,
      });
    } else {
      console.error("Active tab not found.");
    }
  });
});

document.getElementById("stopButton").addEventListener("click",async ()=>{
  chrome.tabs.query({active:true,currentWindow:true}, (tabs) => {
    const activeTab=tabs[0];
    if(activeTab){
      chrome.tabs.sendMessage(activeTab.id,{
        action:"stopScript",
      });
    }else{
      console.log("active tab not found");
    }
  })
});
