// Importing Space model
import { Space } from '../models/Space.js';
import { Thought } from '../models/ThoughtModel.js';
const animate = require('motion').animate;


const { v4: uuid } = require('uuid');


// Open the database
const DB_NAME = 'spaces_database';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'spaces';
const request = indexedDB.open(DB_NAME, DB_VERSION);
let db;
var open = false;
const goBackArrow = document.getElementById('goback');


// Handle database upgrade event
request.onupgradeneeded = (event) => {
  db = event.target.result;
  // Create object store
  db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
};

// Handle database open success event
request.onsuccess = (event) => {
  db = event.target.result;
  console.log('Database opened successfully');
  // Call init() after the database is opened
  init();
};

// Handle database open error event
request.onerror = (event) => {
  console.error('Error opening database:', event.target.error);
};

var myInput = document.getElementById('my-input');
var thoughtContainer = document.getElementById('thoughtContainer');
var space;
const spacenamee =  document.getElementById('spacenamee');

function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}

// Function to initialize space with thoughts from the store
async function initSpace() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const isThisNew = urlParams.get('isThisNew');
  console.log(isThisNew);

  if (isThisNew === 'true') {
    console.log('creating a new space')

    const spacename = urlParams.get('spacename');
    const spaceId = uuid();
    const spaceDate = new Date().toLocaleDateString();
    const spaceName = spacename;
    const spaceThoughtList = [];
    
    space = new Space(spaceId, spaceDate, spaceName, spaceThoughtList, db);
    space.save(); // Save space details to IndexedDB
    spacenamee.innerHTML = capitalizeFirstLetter(space.name);
    
  } else {
    console.log('loading an existing space')
    const spaceidd = urlParams.get('spaceid');
    space = new Space(spaceidd, null, null, null, db);
    await space.load();
    spacenamee.innerHTML = capitalizeFirstLetter(space.name);
    
  }

}

spacenamee.addEventListener('click', (event) => {
  event.stopPropagation();
  document.getElementById('space-menu').style.display = 'flex';
  open = true;

})

document.addEventListener('click', (event) => {
  if (open && !document.getElementsByClassName('space-title-container')[0].contains(event.target)) {
      var popup = document.getElementById('space-menu');
      popup.style.display = 'none'
      open = false;
  }
});

function performSearchAndReturnLinks(query) {
  var apiKey = 'AIzaSyBTeNmd_NhI3bexlNBRagD0KU1YKH_n1Vo';
  var cx = '805e28d7ed95f443b';
  var typeSearch = 'image';
  var url = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=' + cx + '&q=' + query + '&searchType=' + typeSearch + '&imgType=clipart&imgColorType=trans';
  
  return fetch(url)
      .then(function(response) {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(function(data) {
          
          return data.items ? data.items.map(function(item) {
              return item.link;
          }) : [];
      })
      .catch(function(error) {
          console.error('Error fetching search results:', error);
          return []; 
      });
}


// Function to handle key down event
function handleKeyDown(event) {
  if (event.keyCode === 13) {
    const inputText = myInput.value.trim();
    if (inputText === '/delete everything') {
      space.clearThoughts();
      space.save();
    } 
    else if (inputText.startsWith('/image')) {
      const searchTerm = inputText.slice('/image'.length).trim();
      if (searchTerm !== '') {
          performSearchAndReturnLinks(searchTerm)
              .then(function(links) {
                  if (links.length > 0) {
                      console.log('Links to images:', links);
                      const imageContainer = document.getElementById('image-container');
                      imageContainer.innerHTML = '';
  
                      // Counter to track the number of loaded images
                      let loadedCount = 0;
  
                      // Function to check if all images are loaded
                      function checkAllImagesLoaded() {
                          loadedCount++;
                          if (loadedCount === links.length) {
                              console.log('All images loaded');
                              // Show the image container after all images are loaded
                              imageContainer.style.display = 'block';
                          }
                      }
  
                      links.slice(0, 7).forEach(link => {
                          const imageElement = document.createElement('div');
                          imageElement.className = 'image-elm';
                          const img = document.createElement('img');
                          img.src = link;
                          img.alt = 'image element';
  
                          // Listen for the load event on the image
                          img.addEventListener('load', checkAllImagesLoaded);
  
                          imageElement.appendChild(img);
                          imageContainer.appendChild(imageElement);
                          imageElement.addEventListener('click',(event) => {
                          imageContainer.innerHTML = '';
                          imageContainer.style.display = 'none';
                          const newthought = new Thought(uuid(),new Date().toLocaleDateString(),link,getRandomPosition(),true,inputText.length > 50,true);
                          space.addThought(newthought);
                          updateReceiver();
                           
                          });
  
                      });
                      imageContainer.style.display = 'flex'
  
                  } else {
                      console.log('No images found');
                  }
              });
  
      } else {
          // Handle the case where "/play" is followed by nothing
          console.log('Please provide a search term after "/image".');
      }
  }
  
    else if (inputText !== '') {
      const newthought = new Thought(uuid(),new Date().toLocaleDateString(),inputText,getRandomPosition(),true,inputText.length > 50,false);
      space.addThought(newthought);
      updateReceiver();
      console.log('normal adding');

    }
  }
}

function updateReceiver() {
  console.log('updating UI');
  renderThoughts();
  myInput.value = '';
}

// Function to render thoughts on the UI
function renderThoughts() {
  thoughtContainer.innerHTML = '';
  if (space.thoughtList && space.thoughtList.length > 0) {
    space.thoughtList.forEach(thought => {
    const thoughtElement = document.createElement('div');
    if (thought.isImg) {
      thoughtElement.classList.add('image-elm');
      const img = document.createElement('img');
      img.width = 100
      img.src = thought.text;
      img.alt = 'image element';
      thoughtElement.appendChild(img);      
    } else {
      thoughtElement.innerText = thought.text;

    }
      thoughtElement.className = 'thought';
      thoughtElement.style.left = thought.position.x + 'px';
      thoughtElement.style.top = thought.position.y + 'px';
      // thought.isNew = false;
      // space.save();

         // FOR DRAGGING AND DROPPING
      dragListener(thoughtElement,thought.id);
      attachDeleteListener(thoughtElement, thought.id);
      thoughtContainer.appendChild(thoughtElement);
      if(thought.isNew == true){
        console.log('new thought insert');
        fadeIn(thoughtElement);
        thoughtElement.classList.add('super-thought')
        thought.isNew = false;
        space.save();
        setTimeout(() => {
          thoughtElement.classList.remove('super-thought');
        }, 2000);
      }
      

      
    });
  }
  scrollCounter(space.thoughtList.length);

}

function getRandomPosition() {
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 100;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  
  return { x, y };
}

// Function to initialize space and load thoughts on launch
async function init() {
  
  await initSpace();
  updateReceiver();
  console.log('initializing');
}

// Event listener for keydown event on myInput
myInput.addEventListener('keydown', handleKeyDown);


async function updateThoughtPosition(thoughtId, newPosition) {
  const index = space.thoughtList.findIndex(thought => thought.id === thoughtId);
  if (index !== -1) {
    space.thoughtList[index].position = newPosition;
    await space.save();

  }

}


function attachDeleteListener(thoughtElement, thoughtId) {
  thoughtElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    space.removeThought(thoughtId);
    updateReceiver();
    console.log('removing a thought');
      

  });
}

document.addEventListener('dragstart', function (e) {
  e.preventDefault();
});




document.addEventListener('keyup', function(event) {
  // Check if the pressed key is a letter (a-z or A-Z)
  var isLetter = event.keyCode >= 65 && event.keyCode <= 90;
  // Check if no element is currently focused
  var nothingIsFocused = document.activeElement === document.body;

  if (isLetter && nothingIsFocused) {
    // Focus on the input field
    myInput.focus();
    // Clear the input field
    myInput.value = '';
  }
});



function scrollCounter(c) {

  setTimeout(() => {
    const thoughtCount = document.getElementById('thoughtCount');
    animate(
      (progress) => thoughtCount.innerHTML = Math.round(progress * c),
      { duration: 1, easing: "ease-out" }
    )
  }, 500)
  
}

goBackArrow.addEventListener('click', (event) => {
  window.location.href = `../Html/initial.html`;

})



  import { GoogleGenerativeAI } from "@google/generative-ai";
  // Fetch your API_KEY
  const API_KEY = "AIzaSyDzYqr6tYrGR2Rq1KCYVpNJXCkgKh-iPpc";
  // Access your API key (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(API_KEY);


  async function run() {
    
    const risenPromptTxt = `
    Role: Imagine you're an experienced strategist with a knack for synthesizing diverse ideas into cohesive narratives.

    Main Task: Provide the user with a succinct summary of their thoughts and clarify their underlying objective or purpose. Additionally, equip the user with a curated list of concepts and topics that can inspire further exploration and provide valuable insights or solutions based on their interests and objectives.

    Steps to complete the task:

    - Analyze the user's array of thoughts and identify common themes or areas of interest.
    - Craft a concise summary that captures the essence of the user's thoughts and objectives, clarifying their underlying purpose or objective.
    - Research and compile a list of relevant concepts, technologies, or strategies that address the user's interests and objectives.
    - Provide brief descriptions or explanations for each concept to help the user understand its significance and potential applications.
    - Organize the summary and concepts into a structured format, ensuring clarity and coherence.

    Goal: The goal is to provide the user with a succinct summary of their thoughts and clarify their underlying objective or purpose. Additionally, equip the user with a curated list of concepts and topics that can inspire further exploration and provide valuable insights or solutions based on their interests and objectives.
    
    Constraints: Maximum of 250 words. - Use simple and straightforward language. - Ensure the summary captures the essence of the user's thoughts and objectives accurately.

    Random User Thoughts: 
    `

    if (space.thoughtList && space.thoughtList.length > 0) {
      let numberedString = '';
      space.thoughtList.forEach((thought, index) => {
          // Append the element with its index (plus 1 to make it 1-indexed)
          numberedString += `${index + 1}. ${thought.text}\n`;
      });
      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const prompt = risenPromptTxt + numberedString
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(numberedString)
      console.log(text);
      }
    }


    document.getElementById('send').addEventListener('click',(event) => {
    run();
    });


    function dragListener(element,thoughtId) {
      element.draggable = true;
      element.addEventListener('mousedown', (event) => {
        console.log('mousedown');
        element.classList.add('dragging');
        element.classList.add('thought');
        let offsetX = event.clientX - element.getBoundingClientRect().left;
        let offsetY = event.clientY - element.getBoundingClientRect().top;

        function onMouseMove(moveEvent) {
          element.style.left = moveEvent.clientX - offsetX + 'px';
          element.style.top = moveEvent.clientY - offsetY + 'px';
        }

        function onMouseUp() {
          element.classList.remove('dragging');
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);

          const newPosition = {
            x: parseFloat(element.style.left),
            y: parseFloat(element.style.top),
          };
          updateThoughtPosition(thoughtId, newPosition);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }



    function fadeIn(element) {
      let opacity = 0;
    
      // Set the initial opacity to 0
      element.style.opacity = opacity;
    
      // Increase opacity at regular intervals
      const intervalId = setInterval(() => {
        opacity += 0.1; // Adjust the increment as needed
        element.style.opacity = opacity;
    
        // Stop when opacity reaches 1
        if (opacity >= 1) {
          clearInterval(intervalId);
        }
      }, 50); // Adjust the interval duration as needed
    }


