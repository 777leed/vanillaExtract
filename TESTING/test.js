// Importing Space model
import { Space } from '../models/Space.js';
import { Thought } from '../models/ThoughtModel.js';
const { v4: uuid } = require('uuid');
const animate = require('motion').animate;

// Open the database
const DB_NAME = 'spaces_database';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'spaces';
const request = indexedDB.open(DB_NAME, DB_VERSION);
let db;

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

// Function to initialize space with thoughts from the store
function initSpace() {
  // Get the URL parameters
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // Get the value of the 'spacename' parameter
  const spacename = urlParams.get('spacename');
  const spaceId = uuid();
  const spaceDate = new Date().toLocaleDateString();
  const spaceName = spacename;
  const spaceThoughtList = [];
  
  // Create a new Space instance with IndexedDB database
  space = new Space(spaceId, spaceDate, spaceName, spaceThoughtList, db);
  space.save(); // Save space details to IndexedDB
  document.getElementById('spacenamee').innerHTML = space.name;
}

// Function to handle key down event
function handleKeyDown(event) {
  if (event.keyCode === 13) {
    const inputText = myInput.value.trim(); // Trim to remove trailing spaces

    if (inputText === '/delete everything') {
      space.clearThoughts();
      space.save(); // Save changes to IndexedDB
    } 
    else if (inputText !== '') {
      const id = uuid();
      const date = new Date().toLocaleDateString();
      const text = inputText;
      const position = getRandomPosition();
      const isNew = true;
      const isLong = inputText.length > 50;
      const newthought = new Thought(id,date,text,position,isNew,isLong);
      space.addThought(newthought);
      
      updateReceiver();
    }
  }
}

async function updateReceiver() {
  await space.load();
  console.log("I waited")
  renderThoughts();
  myInput.value = '';
}

// Function to render thoughts on the UI
function renderThoughts() {
  thoughtContainer.innerHTML = '';
  if (space.thoughtList && space.thoughtList.length > 0) {
    space.thoughtList.forEach(thought => {
      const thoughtElement = document.createElement('div');
      thoughtElement.innerText = thought.text;
      thoughtElement.className = 'thought';
      thoughtElement.style.left = thought.position.x + 'px';
      thoughtElement.style.top = thought.position.y + 'px';
      thoughtContainer.appendChild(thoughtElement);
    });
  }
}

function getRandomPosition() {
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 100;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  
  return { x, y };
}

// Function to initialize space and load thoughts on launch
function init() {
  initSpace();
  updateReceiver();
}

// Event listener for keydown event on myInput
myInput.addEventListener('keydown', handleKeyDown);

