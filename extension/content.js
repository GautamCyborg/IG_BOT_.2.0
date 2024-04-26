/** @format */
let shouldContinue = true;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "runScript") {
    const username=message.links;
    const messages=message.MessageArray;
    runScript(username,messages);
  } else if (message.action === "stopScript") {
    shouldContinue = false;
    logSuccess("script will be stopped wait for action to complete");
  }
});

function runScript(username,messages) {
  const overlay = document.createElement("div");
  overlay.id = "overlay";
  overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 24px;
      z-index: 1000;
  `;
  overlay.textContent = "A bot is running, please do not close this tab.";
  document.body.appendChild(overlay);
  main(username,messages).finally(() => {
    document.body.removeChild(overlay);
  });
}

// Global function for colored console logs
const coloredLog = (message, color) => {
  console.log(`%c${message}`, `color: ${color}`);
};

// Global function for success logs
const logSuccess = (message) => {
  coloredLog(message, 'green');
};

// Global function for error logs
const logError = (message) => {
  coloredLog(message, 'red');
};

// Global variable to store the first name
var firstName;

function extractFirstName() {
  var span = document.querySelector("div.x7a106z > div.x9f619 > span");
  if (span) {
    firstName = span.textContent.trim().split(" ")[0];
    logSuccess("First name extracted: " + firstName); // Outputs the first name
  } else {
    logError("First name not found");
  }
}

function createAndDownloadCSV(dataArray) {
  const csvRows = [
    "links,status,comment,follow",
  ];
  dataArray.forEach(item => {
    csvRows.push(`https://www.instagram.com/${item.username}/,${item.status},${item.comment},${item.follow}`);
  });
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Output.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const main = async (linksArr, MessageArray) => {
  //00 wait for random time in range
  //function to add random pause
  const addRandomPause = async (start, end) => {
    const pauseTime =
      (Math.floor(Math.random() * (end - start + 1)) + start) * 1000;
    await new Promise((resolve) => setTimeout(resolve, pauseTime));
  };

  //00 waitForElement to load before executing next line of code
  const waitForElement = async (selector, timeout = 30000) => {
    return new Promise((resolve, reject) => {
      // Check if the element already exists
      if (document.querySelector(selector)) {
        return resolve();
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve();
        }
      });

      // Start observing the document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false, // Set to true if you need to observe attribute changes
      });

      // Set a timeout to stop observing after a specified time
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    });
  };

  //00 human typing and sending message
  const typeAndSendMessage = async (message, userArray, username) => {
    // Preprocess the message to remove quotes and replace placeholders
    message = message.replace(/"/g, ""); // Removes double quotes from the message
    message = message.replace(/\$\{FirstName\}/g, firstName); // Replaces ${FirstName} with the global firstName

    let index = 0;

    // Promisify the typing to ensure completion before proceeding
    const typeMessage = () => {
      return new Promise((resolve) => {
        function typeCharacter() {
          if (index < message.length) {
            document.execCommand("insertText", false, message[index]);
            index++;
            setTimeout(typeCharacter, 100); // Delay between each character to simulate typing
          } else {
            resolve(); // Resolve the promise once all characters are typed
          }
        }
        typeCharacter();
      });
    };

    // Function to find and click the send button
    const findAndClickSendButton = () => {
      const buttons = Array.from(
        document.querySelectorAll('div[role="button"]')
      );
      const sendButton = buttons.find(
        (button) => button.textContent.trim() === "Send"
      );
      if (sendButton) {
        console.log("Clicking the send button...");
        sendButton.click();
        const userObject = userArray.find((obj) => obj.username === username);
        if (userObject) {
          userObject.status = "success";
          logSuccess(`Message sent successfully to ${username}`);
        }
      } else {
       logError("Send button not found");
      }
    };

    // Ensure message is fully typed before clicking the send button
    await typeMessage().then(findAndClickSendButton);
  };

  //00 function to type text
  const typeText = async (message, index = 0) => {
    message = message.replace(/"/g, ""); // Removes double quotes from the message
    message = message.replace(/\$\{FirstName\}/g, firstName); // Replaces ${FirstName} with the global firstName

    if (index < message.length) {
      document.execCommand("insertText", false, message[index]);
      index++;
      setTimeout(() => typeText(message, index), 100); // Delay between each character to simulate typing
    }
  };

  //0/1 function to open profile using links
  // const openProfile = async (link) => {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  //   //this below piece of code will execute after 5seconds
  //   //window.location.href = link;
  //   window.location.assign(link);
  // };

  //01
  //to click search icon
  const clickSearchIcon = async () => {
    // Select the SVG element with the aria-label "Search"
    const searchBtn = document.querySelector('svg[aria-label="Search"]');
    if (searchBtn) {
      const parentElement = searchBtn.parentElement;
      if (parentElement) {
        parentElement.click();
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
       logError("Parent element not found");
      }
    } else {
      logError("Search element not found");
    }
  };

  //enter search working fine
  const enterSearch = async (username) => {
    const inputElement = document.querySelector(
      'input[aria-label="Search input"]'
    );
    if (inputElement) {
      inputElement.textContent = "";
      inputElement.focus();
      await typeText(username);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
     logError("Input element not found");
    }
  };

  //click on search result working fine
  const clickSearchResult = async (username) => {
    return new Promise((resolve, reject) => {
      const searchResult = document.querySelector(`a[href^="/${username}/"]`);
      if (searchResult) {
        searchResult.click();
        setTimeout(() => {
          extractFirstName(); // Call extractFirstName right after navigating to the user's page
          resolve();
        }, 5000); // Resolve after 5 seconds
      } else {
        reject(new Error("Search result not found"));
      }
    });
  };

  //02 function to click follow
  const follow = async (username, userArray) => {
    // Find and click the follow button based on its text content
    let foundFollowButton = false;
    document.querySelectorAll("button").forEach((button) => {
      if (button.textContent.trim() === "Follow") {
        logSuccess("Follow button found and clicked for:", username);
        button.click();
        foundFollowButton = true;
      } else {
        console.log("follow button not found");
      }
    });

    // Update the user object based on whether the Follow button was clicked
    const userObject = userArray.find((obj) => obj.username === username);
    if (userObject) {
      if (foundFollowButton) {
        userObject.follow = "success";
        logSuccess(`Successfully followed ${username}.`);
      } else {
        userObject.follow = "failed";
        logError(`Failed to find the Follow button for ${username}.`);
      }
      // Wait for 3 seconds after the action
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      logError(`User object not found for username: ${username}`);
    }
  };

  //03 function to like->close and comment
  const likeAndComment = async (username, userArray) => {
    const comment = Math.floor(Math.random() * 4);
    const allposts = document.querySelectorAll(
      'a[href^="/reel/"], a[href^="/p/"]'
    );
    const posts = Array.from(allposts).slice(0, 4);
    for (let i = 0; i < 4; i++) {
      const post = posts[i];
      post.click();
      await addRandomPause(5, 7); // Wait for 3-5 seconds
      if (i == comment) {
        const commentField = document.querySelector(
          'textarea[aria-label="Add a comment…"]'
        );
        if (commentField) {
          const comments = [
            "great Post",
            "congratulations",
            "Keept it up",
            "Nice one",
          ];
          commentField.focus();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          document.execCommand(
            "insertText",
            false,
            comments[Math.floor(Math.random() * 3)]
          );
          await addRandomPause(3, 5);

          const divElements = document.querySelectorAll('div[role="button"]');
          divElements.forEach((element) => {
            if (element.innerText.includes("Post")) {
              element.click();
            }
          });
          await addRandomPause(3, 5);
          const userObject = userArray.find((obj) => obj.username === username);
          if (userObject) {
            userObject.comment = "success";
          }
        } else {
          const userObject = userArray.find((obj) => obj.username === username);
          if (userObject) {
            userObject.comment = "failed";
          }
        }
      }

      // Click on the like button
      const likeBtn = document.querySelector('svg[aria-label="Like"]');
      if (likeBtn) {
        likeBtn.parentElement.click();
        await addRandomPause(3, 5); // Wait for 20-30 seconds
      }

      // Close modal
      document.querySelector('svg[aria-label="Close"]').parentElement.click();
      await addRandomPause(3, 5); // Wait for 20-30 seconds
    }
  };

  //04 function to send message
  const sendMessage = async (username, userArray, MessageArray) => {
    const messageBox = document.querySelector(
      'div[contenteditable="true"][aria-label="Message"]'
    );
    if (messageBox) {
      // Clear existing content
      messageBox.textContent = "";

      // Ensure messages array is correctly formed and randomized selection
      const messages = [...MessageArray];
      const message = messages[Math.floor(Math.random() * messages.length)]; // Proper random selection
      console.log("Selected message: ", message);

      messageBox.focus();
      await typeAndSendMessage(message, userArray, username); // Ensure await is used for asynchronous typing function
      await addRandomPause(2, 4); // Use await to ensure pauses complete before moving on
    } else {
      logError("Message Box not Found");
    }
  };

  //05 function for story reply
  const replyStory = async (username, userArray, MessageArray) => {
    const messageBox = document.querySelector(
      'textarea[placeholder*="Reply to"]'
    );
    if (messageBox) {
      // Clear existing content
      messageBox.textContent = "";
      // Set the new message
      const messages = [...MessageArray];
      const message = messages[Math.floor(Math.random() * messages.length)]; // Proper random selection
      console.log("Selected message: ", message);
      messageBox.focus();
      await typeAndSendMessage(message, userArray, username);
      const closeBtn = document.querySelector('svg[aria-label="Close"]');
      closeBtn.parentNode.click();
      await addRandomPause(2, 4);
    } else {
      logError("Message box in story not found");

      //close modal and message
      const closeBtn = document.querySelector('svg[aria-label="Close"]');
      if (closeBtn) {
        closeBtn.parentNode.click();
      } else {
        logError("Close element not found");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      //click message button
      const messageBtn = document.querySelectorAll('div[role="button"]');
      for (const element of messageBtn) {
        if (element.innerText.includes("Message")) {
          element.click();
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await sendMessage(username, userArray, MessageArray);
        }
      }
    }
  };

  //06 function to choose between story highlights and message
  const storyHighlights = async (username, userArray, MessageArray) => {
    try {
      const story = document.querySelector("canvas");
      if (story) {
        story.click();
        console.log("Story opened.");

        await waitForElement('svg[aria-label="Pause"]');
        const pauseButtonElement = document.querySelector(
          'svg[aria-label="Pause"]'
        );
        if (pauseButtonElement && pauseButtonElement.parentNode) {
          pauseButtonElement.parentNode.click();
          console.log("Story paused.");

          // Wait before trying to interact with the like button
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const likeButtonElement = document.querySelector(
            'svg[aria-label="Like"]'
          );
          document.querySelector('svg[aria-label="Pause"]').parentNode.click();
          if (likeButtonElement && likeButtonElement.parentNode) {
            likeButtonElement.parentNode.click();
            logSuccess("Story liked.");
          } else {
            logError("Like button not found, proceeding without liking.");
          }
          await replyStory(username, userArray, MessageArray);
        } else {
          logError("Pause button not found.");
        }
      } else {
        logError("Story canvas not found.");
        Array.from(document.querySelectorAll('[role="button"]'))
          .find((el) => el.textContent.trim() === "Message")
          .click();
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await sendMessage(username, userArray, MessageArray);
      }
    } catch (error) {
      logError("An error occurred in storyHighlights:", error);
    }
  };

  //function to create and download csv
  function createAndDownloadCSV(dataArray) {
    // Create a CSV string
    const csvRows = [
      "links,status,comment,follow", // CSV header
    ];

    // Fill the CSV string with data from dataArray
    dataArray.forEach((item) => {
      csvRows.push(
        `https://www.instagram.com/${item.username}/,${item.status},${item.comment},${item.follow}`
      );
    });

    // Join CSV rows and create a Blob with MIME type as 'text/csv'
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });

    // Create a temporary anchor element to trigger file download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Output.csv";
    document.body.appendChild(a);
    a.click();

    // Cleanup: remove the anchor element and revoke the URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  //07 final function
  const final = async (linksArr,MessageArray) => {
    let arrObj = linksArr;

    let start = 0,
      pause = 20,
      max = 30,
      current = 0;
      console.log(linksArr);
      console.log(MessageArray);
    
    for (const user of linksArr) {
      if (!shouldContinue) {
        console.log(shouldContinue);
        createAndDownloadCSV(arrObj);
        return;
    }else{
      if (user.status === "success") {
        continue;
      }

      if (user.status === "failed") {
        continue;
      }

      if (current >= max) {
        break;
      }

      if (start >= pause) {
        const time = (Math.floor(Math.random() * (20 - 15 + 1)) + 15) * 1000;
        await new Promise((resolve) => setTimeout(resolve, time * 60));
        start = 0;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await clickSearchIcon();
      await addRandomPause(3, 5);
      await enterSearch(user.username);
      await addRandomPause(3, 5);
      await clickSearchResult(user.username);
      await addRandomPause(3, 5);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      //checks
      //01 first to check if account is private and has posts or not

      const allposts = document.querySelectorAll(
        "div.x1lliihq.x1n2onr6.xh8yej3.x4gyw5p.x2pgyrj.xbkimgs.xfllauq.xh8taat.xo2y696"
      );
      const posts = Array.from(allposts).slice(0, 4);

      if (posts.length == 0) {
        user.status = "failed";
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (posts.length > 0) {
        try {
          await follow(user.username, arrObj);
          await likeAndComment(user.username, arrObj);
          await storyHighlights(user.username, arrObj, MessageArray);
        } catch (error) {
          console.log(`Error processing ${user.username}: ${error}`);
        }
        await addRandomPause(5, 7);
        start++;
        current++;
      }
    }
    createAndDownloadCSV(arrObj);
    };
  }
  await final(linksArr, MessageArray);
};