const animate = require('motion').animate;
const Store = require('electron-store');
var myInput = document.getElementById('myInput');
var thoughtContainer = document.getElementById('thoughtContainer');
var thoughts = [];
var thoughtIdCounter = 1;

function mySaver(thought, position, toolong) {
  const store = new Store();
  const now = new Date();
  const thoughtObject = {
    id: thoughtIdCounter++,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    text: thought,
    position: position,
    new:true,
    toolong: toolong
  };
  thoughts.push(thoughtObject);
  store.set('thoughts', thoughts);
  store.set('thoughtIdCounter', thoughtIdCounter); // Save thoughtIdCounter
  updateReceiver();
  var a = new Audio('sound/add_sound1.mp3');
  a.play();

}



function myLoader() {
  const store = new Store();
  thoughts = store.get('thoughts') || [];
  thoughtIdCounter = store.get('thoughtIdCounter') || 1;
  return thoughts;
}

function myDeleter() {
  const store = new Store();
  store.delete('thoughts') || [];
  store.delete('thoughtIdCounter') || []; // Reset thoughtIdCounter on deletion
  thoughts = [];
  updateReceiver();
}

function updateReceiver() {
  renderThoughts();
  myInput.value = '';
}

function getRandomPosition() {
  const maxX = window.innerWidth - 200;
  const maxY = window.innerHeight - 100;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  return { x, y };
}

function attachDeleteListener(thoughtElement, thoughtId) {
  thoughtElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
        animate(
      (progress) => {
        thoughtElement.style.transform = `scale(${1 + progress})`;
        thoughtElement.style.opacity = 1 - progress;
      },
      {
        duration: 0.5, // Adjust the duration of the fade-out animation
        easing: 'ease-out'
      }
    );
    setInterval(() => {
      deleteThought(thoughtId);
    }, 500);
  });
}

function deleteThought(thoughtId) {
  const index = thoughts.findIndex(thought => thought.id === thoughtId);
  if (index !== -1) {
    thoughts.splice(index, 1);
    const store = new Store();
    store.set('thoughts', thoughts);
    updateReceiver();
  }
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


function fadeOut(element) {
  let opacity = 1;

  // Set the initial opacity to 0
  element.style.opacity = opacity;

  // Decrease opacity at regular intervals
  const intervalId = setInterval(() => {
    opacity -= 0.1; // Adjust the increment as needed
    element.style.opacity = opacity;

    // Stop when opacity reaches 1
    if (opacity >= 0) {
      clearInterval(intervalId);
    }
  }, 1000); // Adjust the interval duration as needed
}



function renderThoughts() {
  thoughtContainer.innerHTML = '';
  var counter = 0
  thoughts.forEach(thought => {
    counter = counter + 1;
    const thoughtElement = document.createElement('div');

    if (thought.toolong) {
      thoughtElement.innerHTML = `
      <div class="document-container">
        <img src="document.png" alt="" width="40px" height="40">
        <div class="document-content">${thought.text}</div>
      </div>
      `;
      thoughtElement.addEventListener('dblclick', () => {
        const documentContent = thoughtElement.querySelector('.document-content');
        if (documentContent.style.display === 'none' || !documentContent.style.display) {
          documentContent.style.display = 'block';
        } else {
          documentContent.style.display = 'none';
        }

      }
      
      )

    }
    else {
      thoughtElement.innerText = thought.text;
    }
    thoughtElement.className = 'thought';
    thoughtElement.style.left = thought.position.x + 'px';
    thoughtElement.style.top = thought.position.y + 'px';

    // FOR DRAGGING AND DROPPING
    thoughtElement.draggable = true;
    thoughtElement.addEventListener('mousedown', (event) => {
      thoughtElement.classList.add('dragging');
      let offsetX = event.clientX - thoughtElement.getBoundingClientRect().left;
      let offsetY = event.clientY - thoughtElement.getBoundingClientRect().top;

      function onMouseMove(moveEvent) {
        thoughtElement.style.left = moveEvent.clientX - offsetX + 'px';
        thoughtElement.style.top = moveEvent.clientY - offsetY + 'px';
      }

      function onMouseUp() {
        thoughtElement.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const newPosition = {
          x: parseFloat(thoughtElement.style.left),
          y: parseFloat(thoughtElement.style.top),
        };
        updateThoughtPosition(thought.id, newPosition);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    attachDeleteListener(thoughtElement, thought.id);
    thoughtContainer.appendChild(thoughtElement);
    if(thought.new == true){
      fadeIn(thoughtElement);
      thoughtElement.classList.add('super-thought')
      thought.new = false;
      setTimeout(() => {
        thoughtElement.classList.remove('super-thought');
      }, 2000);
    }

  });
  scrollCounter(counter);

}

function updateThoughtPosition(thoughtId, newPosition) {
  const index = thoughts.findIndex(thought => thought.id === thoughtId);
  if (index !== -1) {
    thoughts[index].position = newPosition;
    const store = new Store();
    store.set('thoughts', thoughts);
  }
}

myInput.addEventListener('keydown', handleKeyDown);
function handleKeyDown(event) {
  if (event.keyCode === 13) {
    const inputText = myInput.value.trim(); // Trim to remove trailing spaces

    if (inputText === '/delete everything') {
      myDeleter()
    } 
    else if (inputText.startsWith('/play')) {
      const searchTerm = inputText.slice('/play'.length).trim();
    
      if (searchTerm !== '') {
        fetchAndPlayAudio(searchTerm);
      } else {
        // Handle the case where "/play" is followed by nothing
        console.log('Please provide a search term after "/play".');
      }
    }
    else if (inputText !== '') {
      const position = getRandomPosition();


      if (inputText.length > 50) {
        mySaver(inputText,position,true);

      }
      else {
        mySaver(inputText,position,false);
      }       


    }
  }

}

document.addEventListener('keyup', function(event){
  var nothingIsFocused = document.activeElement === document.body
  if (event.keyCode == 84 && nothingIsFocused) {
      myInput.focus();
      console.log('serving T')
      myInput.value ='';

  }
});

document.addEventListener('dragstart', function (e) {
  e.preventDefault();
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

// Load thoughts on launch
thoughts = myLoader();
updateReceiver();
