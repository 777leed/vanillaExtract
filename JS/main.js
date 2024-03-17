import { Space } from '../models/Space.js';
var fileName = location.href.split("/").slice(-1)[0]; 
const goBackArrow = document.getElementById('goback');


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
  initHomepage();
};

// Handle database open error event
request.onerror = (event) => {
  console.error('Error opening database:', event.target.error);
};

// when I click on create space the popup appears
var open = false;
var popupContent = `            
    <div class="creator-pop glassify flexify">
        <span class="inside">What are we naming it ?</span>
        <input type="text" placeholder="Insert Name" id='spn'>
        <button id='sbtn'>Create</button>

    </div>
`;
var popupRemovalContent = `            
<div class="creator-pop glassify flexify">
    <span class="inside">Are You Sure you Want to delete this ?</span>
    <button id='rbtn'>Delete</button>
</div>
`;
var blurOverlay = document.getElementById('blur-overlay');
function openPopup() {
    blurOverlay.style.display = 'block';
    var popup = document.createElement('div');
    popup.id = 'popup';
    popup.innerHTML = popupContent;
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1111';
    document.body.appendChild(popup);
    open = true;
}

function createNewSpace() {
    // retrieve space name and create a new space
    var spaceNameHOlder = document.getElementById('spn');
    console.log('clickkk space create lol');
    window.location.href = `../Html/index.html?spacename=${spaceNameHOlder.value.trim()}&isThisNew=${true}`;
    spaceNameHOlder.value = '';


}



document.addEventListener('click', (event) => {
    if (open && !document.getElementById('popup').contains(event.target)) {
        var popup = document.getElementById('popup');
        popup.remove();
        blurOverlay.style.display = 'none';
        open = false;
    }
});



// Function to load all spaces
async function loadAllSpaces() {
    const transaction = db.transaction(['spaces'], 'readonly');
    const objectStore = transaction.objectStore('spaces');
  
    const request = objectStore.getAll();
  
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const spaces = request.result;
        resolve(spaces);
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  // Function to create HTML elements for each space
  function createSpaceElements(spaces) {
    const gridContainer = document.querySelector('.space-grid');
    let howmany;
    if (fileName === 'allspaces.html') {
      howmany = spaces.length;
      gridContainer.style.gridTemplateColumns = `repeat(4, 1fr)`;
      gridContainer.style.gridTemplateRows = `repeat(4, 1fr)`;
      goBackArrow.addEventListener('click', (event) => {
        window.location.href = `../Html/initial.html`;
      
      });
      document.addEventListener('keydown', (event)=>{
        if (event.keyCode === 8) {
          window.location.href = `../Html/initial.html`;

        }
      })
      howmany = 100;


    } else {
      howmany = 4;
      document.getElementById('seeall').addEventListener('click', (event) => {
        window.location.href = `../Html/allspaces.html`;
      
      });
      document.getElementById('spacecreator').addEventListener('click', (event) => {
        openPopup();
        event.stopPropagation(); // Prevents the click event from reaching document
        document.getElementById('sbtn').addEventListener('click', (event) => {
            createNewSpace();
        });
    });
      gridContainer.style.gridTemplateColumns = `repeat(2, 1fr)`;
      gridContainer.style.gridTemplateRows = `repeat(2, 1fr)`;
    }

    spaces.slice(0, howmany).forEach(space => {
      const spaceElementContainer = document.createElement('div');
      spaceElementContainer.classList.add('space-elm-container', 'glassify');
      spaceElementContainer.innerText = space.name; // Display space name, adjust as needed
      gridContainer.appendChild(spaceElementContainer);

      spaceElementContainer.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents the click event from reaching document
        window.location.href = `../Html/index.html?spaceid=${space.id}&isThisNew=${false}`;

      })

      spaceElementContainer.addEventListener('contextmenu', (event) => {
        event.stopPropagation(); // Prevents the click event from reaching document
        openRemovalPopup();
        document.getElementById('rbtn').addEventListener('click', (event) => {
          space = new Space(space.id, null, null, null, db);
          space.deleteSpace();
          var popup = document.getElementById('popup');
          popup.remove();
          blurOverlay.style.display = 'none';
          open = false;
          spaceElementContainer.remove();
          
      });
      })


    });


  }
  
  // Function to initialize the homepage
  async function initHomepage() {
    // await deleteAllSpaces();
    const spaces = await loadAllSpaces();
    createSpaceElements(spaces);
  }
  

  // Function to delete all spaces
async function deleteAllSpaces() {
    const transaction = db.transaction(['spaces'], 'readwrite');
    const objectStore = transaction.objectStore('spaces');
  
    // Get all keys
    const request = objectStore.getAllKeys();
  
    request.onsuccess = async () => {
      const keys = request.result;
  
      // Iterate over keys and delete each space
      for (const key of keys) {
        await deleteSpace(key);
      }
  
      console.log('All spaces deleted');
    };
  
    request.onerror = () => {
      console.error('Error deleting spaces:', request.error);
    };
  }
  
  // Function to delete a single space by its key
  async function deleteSpace(key) {
    const transaction = db.transaction(['spaces'], 'readwrite');
    const objectStore = transaction.objectStore('spaces');
  
    // Delete the space by its key
    const deleteRequest = objectStore.delete(key);
  
    return new Promise((resolve, reject) => {
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }
  

  
  function openRemovalPopup() {
    blurOverlay.style.display = 'block';
    var popup = document.createElement('div');
    popup.id = 'popup';
    popup.innerHTML = popupRemovalContent;
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1111';
    document.body.appendChild(popup);
    open = true;
}
















